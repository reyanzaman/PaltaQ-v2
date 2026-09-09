import {
  evaluateQuestion,
  getLLMErrorStatus,
  type QuestionEvaluationVersion,
} from "@/app/lib/llm";

function isQuestionEvaluationVersion(
  value: string | null,
): value is QuestionEvaluationVersion {
  return value === "1" || value === "2" || value === "3" || value === "4";
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  const question = url.searchParams.get("question");
  const version = url.searchParams.get("version");
  const topic = url.searchParams.get("topic") || "";

  if (!question || !isQuestionEvaluationVersion(version)) {
    return new Response(JSON.stringify({ error: "No data provided" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const response = await evaluateQuestion(question, version, topic);

    console.log("Tokens Used:", response.usage?.total_tokens);

    // Preserve the existing response shape: a JSON-encoded string.
    return new Response(JSON.stringify(response.content), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Failed to get AI response:", error);
    return new Response(JSON.stringify({ error: "Failed to get response" }), {
      status: getLLMErrorStatus(error),
      headers: { "Content-Type": "application/json" },
    });
  }
}
