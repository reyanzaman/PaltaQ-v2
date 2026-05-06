import { NextApiResponse } from "next";
import prisma from "@/app/lib/prisma";

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

// ✅ Helper for consistent error responses
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

export async function getHandler(req: Request, res: NextApiResponse) {
  if (req.method === "GET") {
    const url = req?.url ? new URL(req.url) : null;
    const cid = url?.searchParams.get("cid");
    const tid = url?.searchParams.get("tid");

    try {
      if (cid && tid) {
        const questions = await prisma.question.findMany({
          where: {
            classId: cid,
            topicId: tid,
          },
          include: {
            user: true,
            likedBy: true,
            dislikedBy: true,
            paltaQBy: {
              select: {
                id: true,
                userId: true,
                user: true,
                paltaQ: true,
                questionId: true,
                parentId: true,
                score: true,
                likes: true,
                dislikes: true,
                likedBy: true,
                dislikedBy: true,
                isAnonymous: true,
                createdAt: true,
                parent: true,
                replies: true,
                questionType: true,
              },
            },
            topic: true,
            questionType: true,
          },
        });

        questions.forEach((question) => {
          question.paltaQBy.forEach((paltaQBy) => {
            (paltaQBy as any).repliesLength = paltaQBy.replies.length;
            (paltaQBy as any).replies = undefined;
          });
        });

        return new Response(JSON.stringify(questions), { status: 200 });
      } else if (cid) {
        const questions = await prisma.question.findMany({
          where: { classId: cid },
          include: {
            user: true,
            topic: true,
            likedBy: true,
            dislikedBy: true,
            paltaQBy: {
              select: {
                id: true,
                userId: true,
                user: true,
                paltaQ: true,
                questionId: true,
                parentId: true,
                score: true,
                likes: true,
                dislikes: true,
                likedBy: true,
                dislikedBy: true,
                isAnonymous: true,
                createdAt: true,
                parent: true,
                replies: true,
                questionType: true,
              },
            },
            questionType: true,
          },
        });

        questions.forEach((question) => {
          question.paltaQBy.forEach((paltaQBy) => {
            (paltaQBy as any).repliesLength = paltaQBy.replies.length;
            (paltaQBy as any).replies = undefined;
          });
        });

        return new Response(JSON.stringify(questions), { status: 200 });
      }

      return errorResponse("Missing required parameters (cid or tid)", 400);
    } catch (error: any) {
      console.error("GET /question failed:", error);

      return errorResponse(
        "Failed to fetch questions",
        500,
        process.env.NODE_ENV === "development" ? error.message : undefined,
      );
    }
  }

  return errorResponse("Method not allowed", 405);
}

async function postHandler(req: Request, res: NextApiResponse) {
  if (req.method === "POST") {
    try {
      const token = await getToken({ req: req as any, secret });

      if (!token) {
        return errorResponse("Authentication required", 401);
      }

      let body;
      try {
        body = await req.json();
      } catch {
        return errorResponse("Invalid JSON body", 400);
      }

      const { isAnonymous, category } = body;

      const url = req?.url ? new URL(req.url) : null;
      const cid = url?.searchParams.get("cid") || "";
      const tid = url?.searchParams.get("tid") || "";
      let question = url?.searchParams.get("question") || "";
      const qid = url?.searchParams.get("qid") || "";
      const Mqid = url?.searchParams.get("Mqid") || "";
      const tname = url?.searchParams.get("tname") || "";
      const cCode = url?.searchParams.get("cCode") || "";

      if (!cid || !question) {
        return errorResponse(
          "Missing required parameters (cid, question)",
          400,
        );
      }

      question = question.trim();
      question = question.charAt(0).toUpperCase() + question.slice(1);

      const userEmail = token?.email;
      const userId = await getUserIDFromDatabase(userEmail ?? "");

      const validText = await validateQuestion(question, category, tid, cid);

      if (validText !== "Question validated") {
        return errorResponse(validText, 400);
      }

      const baseUrl = process.env.VERCEL_URL
        ? "https://" + process.env.VERCEL_URL
        : "http://localhost:3000";

      // ✅ Llama v1
      const llama_response = await fetch(
        `${baseUrl}/api/groq?question=${question}&version=1`,
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

      // ✅ Topic check
      let llama_response4 = new Response(JSON.stringify("yes"));

      try {
        const classRecord = cid
          ? await prisma.classes.findUnique({ where: { id: cid } })
          : null;

        const topicCheckEnabled = (classRecord as any)?.topicCheck ?? true;

        if (topicCheckEnabled && cCode !== "FBA6B9") {
          llama_response4 = await fetch(
            `${baseUrl}/api/groq?question=${question}&version=4&topic=${tname}`,
            { method: "POST", headers: { "Content-Type": "application/json" } },
          );
        }
      } catch (e) {
        console.error("Error checking class topicCheck flag:", e);

        if (cCode !== "FBA6B9") {
          llama_response4 = await fetch(
            `${baseUrl}/api/groq?question=${question}&version=4&topic=${tname}`,
            { method: "POST", headers: { "Content-Type": "application/json" } },
          );
        }
      }

      let is_validTopic: any;

      try {
        is_validTopic = await llama_response4.json();
        is_validTopic = String(is_validTopic).toLowerCase();
      } catch {
        return errorResponse("Invalid topic validation response", 502);
      }

      const is_valid_question = String(data || "").toLowerCase();

      if (is_valid_question.trim().startsWith("no")) {
        return errorResponse("Question is off-topic", 400, {
          improvement_suggestion:
            "Your question does not match the classroom topic. Please ask something relevant.",
        });
      }

      // normalize safety
      if (
        !is_valid_question.includes("yes") &&
        !is_valid_question.includes("no")
      ) {
        return errorResponse("AI validation failed", 502);
      }

      // ❌ rejected question with reason support
      if (is_valid_question.startsWith("no")) {
        const reason = is_valid_question.split(":")[1]?.trim();

        return errorResponse(
          reason ||
            "Your question was rejected because it does not meet quality guidelines.",
          400,
          {
            type: "validation_error",
          },
        );
      }

      // ✅ Llama scoring
      const llama_response2 = await fetch(
        `${baseUrl}/api/groq?question=${question}&version=2`,
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

      const llama_score = parseInt(rawScore, 10);

      if (isNaN(llama_score)) {
        return errorResponse("AI scoring returned invalid value", 502);
      }

      const { score, quban_score, foundKeywords } = await scoreQuestion(
        question,
        llama_score,
      );

      try {
        if (category === QuestionCategory.Topic) {
          await submitQuestionToDatabase(
            userId,
            question,
            score,
            quban_score,
            llama_score,
            category,
            tid,
            cid,
            isAnonymous,
            foundKeywords,
            "topic",
          );
        } else if (category === QuestionCategory.Palta) {
          await submitPaltaQToDatabase(
            userId,
            question,
            qid,
            "",
            cid,
            score,
            quban_score,
            llama_score,
            isAnonymous,
            foundKeywords,
            "topic",
          );
        } else if (category === QuestionCategory.PaltaPalta) {
          await submitPaltaQToDatabase(
            userId,
            question,
            qid,
            Mqid,
            cid,
            score,
            quban_score,
            llama_score,
            isAnonymous,
            foundKeywords,
            "paltapalta",
          );
        }
      } catch (err) {
        console.error("DB write failed:", err);
        return errorResponse("Failed to save question", 500);
      }

      let status;
      try {
        status = await updateRank(userId, cid);
      } catch (err) {
        console.error("Rank update failed:", err);
        return errorResponse("Failed to update rank", 500);
      }

      return new Response(
        JSON.stringify({ message: `${score} Points Awarded!|${status}` }),
        { status: 200 },
      );
    } catch (error: any) {
      console.error("POST /question failed:", error);

      return errorResponse(
        "Failed to submit question",
        500,
        process.env.NODE_ENV === "development" ? error.message : undefined,
      );
    }
  }

  return errorResponse("Method not allowed", 405);
}

export { getHandler as GET };
export { postHandler as POST };
