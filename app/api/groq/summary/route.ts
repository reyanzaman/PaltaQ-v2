import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const questions: string[] = body.questions ?? [];

    // ✅ Empty case
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
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // ✅ Prompt with new teacherTip field
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

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      max_tokens: 500,
    });

    const raw = response.choices[0]?.message?.content ?? "{}";

    console.log("Summary tokens used:", response.usage?.total_tokens);

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      // محاولة استخراج JSON إذا كان فيه تنسيق زائد
      const match = raw.match(/\{[\s\S]*\}/);
      parsed = match
        ? JSON.parse(match[0])
        : {
            summary: "Could not parse summary.",
            themes: [],
            misconceptions: [],
            topQuestions: [],
            teacherTip:
              "Encourage students to ask clearer, more specific questions.",
          };
    }

    // ✅ Safety fallback (in case model omits field)
    parsed.teacherTip =
      parsed.teacherTip ||
      "Encourage students to ask deeper, more analytical questions by modeling good examples.";

    return new Response(JSON.stringify(parsed), {
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
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}