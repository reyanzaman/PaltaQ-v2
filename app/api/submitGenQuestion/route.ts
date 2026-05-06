import { NextApiResponse } from "next";
import {
  validateQuestion,
  scoreQuestion,
  updateRank,
} from "@/app/utils/questionUtils";
import {
  submitQuestionToDatabase,
  submitPaltaQToDatabase,
} from "@/app/utils/postUtils";
import { getToken } from "next-auth/jwt";
import { getUserIDFromDatabase } from "@/app/utils/getUtils";
import { QuestionCategory } from "@/app/utils/postUtils";

const secret = process.env.SECRET;

// General Class ID
export const cid = "ae9b5c88-e98e-4774-a606-790f71947591";
// General Topic ID
export const tid = "e1566b05-fef2-4958-885b-2808695b7ba7";
// Guest User ID
export const uid = "03277337-f5ae-42c4-985c-4e35e64b3fc3";

// ✅ Consistent error helper
function errorResponse(message: string, status: number = 500, extra?: any) {
  return new Response(
    JSON.stringify({
      error: true,
      message,
      ...(extra && { details: extra }),
    }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    },
  );
}

async function postHandler(req: Request, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const token = await getToken({ req: req as any, secret });

      // ✅ Safe JSON parsing
      let body;
      try {
        body = await req.json();
      } catch {
        return errorResponse("Invalid JSON body", 400);
      }

      const { question, category, quesID, paltaQuesID, anonymity } = body;

      if (!question || !category) {
        return errorResponse(
          "Missing required fields (question, category)",
          400,
        );
      }

      let processed_question = question.trim();
      processed_question =
        processed_question.charAt(0).toUpperCase() +
        processed_question.slice(1);

      let userId = "";

      // Guest logic preserved
      if (!token) {
        console.log("Guest User Detected");
      } else {
        const userEmail = token?.email;
        try {
          userId = await getUserIDFromDatabase(userEmail ?? "");
        } catch (err) {
          console.error("Failed to fetch user ID:", err);
          return errorResponse("Failed to resolve user identity", 500);
        }
      }

      // =========================================
      // LLAMA-3 CHECKING + SCORING
      // =========================================

      const baseUrl = process.env.VERCEL_URL
        ? "https://" + process.env.VERCEL_URL
        : "http://localhost:3000";

      // ✅ Validation request
      const llama_response = await fetch(
        `${baseUrl}/api/groq?question=${processed_question}&version=1`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!llama_response.ok) {
        console.error(await llama_response.text());
        return errorResponse("AI validation service unavailable", 503);
      }

      let data;
      try {
        data = await llama_response.json();
      } catch {
        return errorResponse("Invalid AI validation response", 502);
      }

      const is_valid_question = String(data || "").toLowerCase();

      if (!is_valid_question.includes("yes") && !is_valid_question.includes("no")) {
        return errorResponse(
          "AI validation failed. Please try again.",
          502
        );
      }

      // =========================================
      // QUESTION REJECTION
      // =========================================

      // If invalid question
      if (is_valid_question.trim().startsWith("no")) {
        // Try extract AI reason after "no:"
        const reason = is_valid_question.split(":")[1]?.trim();

        return errorResponse(
          reason ||
            "Your question was rejected because it does not meet quality standards.",
          400,
          {
            type: "validation_error",
          },
        );
      }

      // ✅ Scoring request
      const llama_response2 = await fetch(
        `${baseUrl}/api/groq?question=${processed_question}&version=2`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!llama_response2.ok) {
        return errorResponse("AI scoring service unavailable", 503);
      }

      let rawScore;
      try {
        rawScore = await llama_response2.json();
      } catch {
        return errorResponse("Invalid scoring response", 502);
      }

      let llama_score = parseInt(rawScore, 10);

      // ✅ Retry loop preserved (safe)
      let retryCount = 0;
      const MAX_RETRIES = 3;

      while (Number.isNaN(llama_score) && retryCount < MAX_RETRIES) {
        retryCount++;

        const retry_response = await fetch(
          `${baseUrl}/api/groq?question=${processed_question}&version=2`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          },
        );

        if (!retry_response.ok) {
          return errorResponse("AI scoring retry failed", 503);
        }

        try {
          const retryData = await retry_response.json();
          llama_score = parseInt(retryData, 10);
        } catch {
          return errorResponse("Invalid retry scoring response", 502);
        }
      }

      if (Number.isNaN(llama_score)) {
        return errorResponse("AI scoring failed after retries", 502);
      }

      console.log({ is_valid_question, llama_score });

      // =========================================
      // SCORE QUESTION
      // =========================================

      let score, quban_score, foundKeywords;

      try {
        ({ score, quban_score, foundKeywords } = await scoreQuestion(
          processed_question,
          llama_score,
        ));
      } catch (err) {
        console.error("Scoring failed:", err);
        return errorResponse("Failed to score question", 500);
      }

      // =========================================
      // SUBMIT QUESTION
      // =========================================

      try {
        if (category === QuestionCategory.General) {
          if (userId === "") {
            await submitQuestionToDatabase(
              uid,
              processed_question,
              score,
              quban_score,
              llama_score,
              category,
              tid,
              cid,
              true,
              foundKeywords,
            );
          } else {
            await submitQuestionToDatabase(
              userId,
              processed_question,
              score,
              quban_score,
              llama_score,
              category,
              tid,
              cid,
              anonymity,
              foundKeywords,
            );
          }
        } else if (category === QuestionCategory.Palta) {
          if (userId === "") {
            await submitPaltaQToDatabase(
              uid,
              processed_question,
              quesID,
              "",
              cid,
              score,
              quban_score,
              llama_score,
              true,
              foundKeywords,
            );
          } else {
            await submitPaltaQToDatabase(
              userId,
              processed_question,
              quesID,
              "",
              cid,
              score,
              quban_score,
              llama_score,
              anonymity,
              foundKeywords,
            );
          }
        } else if (category === QuestionCategory.PaltaPalta) {
          if (userId === "" && paltaQuesID) {
            await submitPaltaQToDatabase(
              uid,
              processed_question,
              quesID,
              paltaQuesID,
              cid,
              score,
              quban_score,
              llama_score,
              true,
              foundKeywords,
              "paltapalta",
            );
          } else {
            await submitPaltaQToDatabase(
              userId,
              processed_question,
              quesID,
              paltaQuesID,
              cid,
              score,
              quban_score,
              llama_score,
              anonymity,
              foundKeywords,
              "paltapalta",
            );
          }
        }
      } catch (err) {
        console.error("Database write failed:", err);
        return errorResponse("Failed to save question", 500);
      }

      // =========================================
      // SUCCESS RESPONSE
      // =========================================

      return new Response(
        JSON.stringify({ message: `${score} Points Awarded!` }),
        { status: 200 },
      );
    } catch (error: any) {
      console.error("POST /general-question failed:", error);

      return errorResponse(
        "Failed to submit question",
        500,
        process.env.NODE_ENV === "development" ? error.message : undefined,
      );
    }
  }

  return errorResponse("Method not allowed", 405);
}

export { postHandler as POST };
