import { callLLM, getLLMErrorStatus } from "@/app/lib/llm";

const fallbackSummary = {
  summary: "Could not parse summary.",
  themes: [],
  misconceptions: [],
  topQuestions: [],
  teacherTip:
    "Encourage students to ask deeper, more analytical questions by modeling good examples.",
};

function asStringArray(value: unknown, maxItems: number) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .slice(0, maxItems);
}

function parseSummary(raw: string) {
  let parsed: any;

  try {
    parsed = JSON.parse(raw);
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return fallbackSummary;

    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return fallbackSummary;
    }
  }

  return {
    summary:
      typeof parsed?.summary === "string"
        ? parsed.summary
        : fallbackSummary.summary,
    themes: asStringArray(parsed?.themes, 5),
    misconceptions: asStringArray(parsed?.misconceptions, 3),
    topQuestions: asStringArray(parsed?.topQuestions, 3),
    teacherTip:
      typeof parsed?.teacherTip === "string" && parsed.teacherTip.trim()
        ? parsed.teacherTip
        : fallbackSummary.teacherTip,
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const questions: string[] = Array.isArray(body.questions)
      ? body.questions.filter(
          (question: unknown): question is string =>
            typeof question === "string",
        )
      : [];

    if (questions.length === 0) {
      return new Response(
        JSON.stringify({
          summary: "No questions have been asked in this class yet.",
          themes: [],
          misconceptions: [],
          topQuestions: [],
          teacherTip:
            "Prompt students with examples of good questions to help them get started.",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    const prompt = `You are an academic assistant. Analyze these student questions from a class discussion and reply ONLY with a valid JSON object — no markdown, no extra text, no backticks.

Questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join("\n")}

Return this exact JSON shape:
{
  "summary": "2-3 sentence overview of the discussion",
  "themes": ["theme1", "theme2"],
  "misconceptions": ["misconception1"],
  "topQuestions": ["best question 1", "best question 2"],
  "teacherTip": "Actionable advice for the teacher to improve student questioning quality"
}

Rules:
- summary: max 60 words
- themes: max 5 short items
- misconceptions: max 3 items, leave empty array if none detected
- topQuestions: max 3 of the highest quality questions
- teacherTip: 1–2 practical, actionable sentences for the teacher`;

    const response = await callLLM(
      [{ role: "user", content: prompt }],
      { maxTokens: 250, temperature: 0.15 },
    );

    console.log("Summary tokens used:", response.usage?.total_tokens);

    return new Response(JSON.stringify(parseSummary(response.content)), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Summary route error:", error);

    return new Response(
      JSON.stringify({
        error: "Failed to generate summary",
        teacherTip:
          "Try guiding students with prompts to improve question quality.",
      }),
      {
        status: getLLMErrorStatus(error),
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
