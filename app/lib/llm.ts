type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type LLMOptions = {
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
};

type LLMResponse = {
  content: string;
  usage?: {
    total_tokens?: number;
  };
};

export type QuestionEvaluationVersion = "1" | "2" | "3" | "4";

const MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 250;
const DEFAULT_TIMEOUT_MS = 15_000;

export class LLMError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly retryable = false,
  ) {
    super(message);
    this.name = "LLMError";
  }
}

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function isRetryableStatus(status: number) {
  return status === 429 || status >= 500;
}

function responseStatusForError(error: unknown) {
  if (error instanceof LLMError) {
    if (error.status === 429) return 429;
    if (error.status && error.status >= 500) return 503;
    return error.status ?? 502;
  }

  return 503;
}

export function getLLMErrorStatus(error: unknown) {
  return responseStatusForError(error);
}

async function readErrorBody(response: Response) {
  try {
    const body = await response.text();
    return body.slice(0, 500);
  } catch {
    return "";
  }
}

/**
 * Provider-neutral LLM entry point. Provider-specific request and response
 * handling stays here so routes and consumers only deal with text content.
 */
export async function callLLM(
  messages: ChatMessage[],
  { maxTokens = 150, temperature = 0.15, timeoutMs = DEFAULT_TIMEOUT_MS }: LLMOptions = {},
): Promise<LLMResponse> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new LLMError("AI service is not configured", 503);
  }

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          temperature,
          max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const details = await readErrorBody(response);
        const error = new LLMError(
          `AI service request failed with status ${response.status}${details ? `: ${details}` : ""}`,
          response.status,
          isRetryableStatus(response.status),
        );

        if (error.retryable && attempt < MAX_ATTEMPTS - 1) {
          await wait(RETRY_DELAY_MS * 2 ** attempt);
          continue;
        }

        throw error;
      }

      let payload: any;
      try {
        payload = await response.json();
      } catch {
        throw new LLMError("AI service returned invalid JSON", 502);
      }

      const content = payload?.choices?.[0]?.message?.content;
      if (typeof content !== "string" || content.trim() === "") {
        throw new LLMError("AI service returned an empty response", 502);
      }

      return {
        content: content.trim(),
        usage: payload?.usage,
      };
    } catch (error) {
      if (error instanceof LLMError) {
        if (error.retryable && attempt < MAX_ATTEMPTS - 1) {
          await wait(RETRY_DELAY_MS * 2 ** attempt);
          continue;
        }

        throw error;
      }

      const isTimeout = error instanceof DOMException && error.name === "AbortError";
      const networkError = new LLMError(
        isTimeout ? "AI service request timed out" : "AI service network request failed",
        503,
        true,
      );

      if (attempt < MAX_ATTEMPTS - 1) {
        await wait(RETRY_DELAY_MS * 2 ** attempt);
        continue;
      }

      throw networkError;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new LLMError("AI service request failed", 503);
}

export async function evaluateQuestion(
  question: string,
  version: QuestionEvaluationVersion,
  topic = "",
) {
  const prompts: Record<QuestionEvaluationVersion, string> = {
    "1": `Leniently check if this is a proper question? Reply with only:
- "yes" if it is a valid question
- OR "no: <short reason>" if it is not valid
Be strict but helpful. Keep reason under 12 words. Here is the question: '${question}'`,
    "2": `Score the question from 0 to 150, ensuring that low-level or low IQ questions receive below 50, mid-level or moderate questions between 50 to 100, and high-level and intelligent questions between 100 to 150. Only give me the score. For example: 50. Here is the question: '${question}'`,
    "3": `For this question, please give tips on how to improve the question while keeping the response limited to 2 short sentences. DO NOT directly provide an improved question or suggestion an improved version. NEVER give the answer. NEVER provide an example. Here is the question: '${question}'`,
    "4": `Leniently check if this question belong to the '${topic}' topic. Only reply with 'yes' or 'no'. Here is the question: '${question}'`,
  };

  const maxTokens: Record<QuestionEvaluationVersion, number> = {
    "1": 64,
    "2": 32,
    "3": 100,
    "4": 8,
  };

  return callLLM(
    [{ role: "user", content: prompts[version] }],
    { maxTokens: maxTokens[version], temperature: 0.15 },
  );
}
