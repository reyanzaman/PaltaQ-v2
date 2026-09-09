import prisma from "@/app/lib/prisma";
import { GENERAL_CLASS_ID, GENERAL_TOPIC_ID } from "@/app/lib/constants";

const homepageUserSelect = {
  id: true,
  name: true,
  image: true,
  is_Faculty: true,
} as const;

const questionInclude = {
  user: { select: homepageUserSelect },
  likedBy: {
    select: { id: true, userId: true, questionId: true },
  },
  dislikedBy: {
    select: { id: true, userId: true, questionId: true },
  },
  paltaQBy: {
    select: {
      id: true,
      userId: true,
      user: { select: homepageUserSelect },
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
      _count: { select: { replies: true } },
      questionType: true,
    },
  },
  questionType: true,
} as const;

export async function GET(req: Request) {
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const questions = await prisma.question.findMany({
      where: {
        classId: GENERAL_CLASS_ID,
        topicId: GENERAL_TOPIC_ID,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 100,
      include: questionInclude,
    });

    const responseQuestions = questions.map((question) => ({
      ...question,
      paltaQBy: question.paltaQBy.map((paltaQ) => {
        const { _count, ...responsePaltaQ } = paltaQ;
        return {
          ...responsePaltaQ,
          repliesLength: _count.replies,
        };
      }),
    }));

    return new Response(JSON.stringify(responseQuestions), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Failed to fetch homepage questions:", error);
    return new Response(JSON.stringify({ error: "Failed to fetch questions" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}