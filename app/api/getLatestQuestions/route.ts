import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';
import { cid, tid } from '@/app/api/submitGenQuestion/route';
import { revalidateTag } from 'next/cache';

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    revalidateTag('questions');
    try {
      const DaysAgo = new Date();
      DaysAgo.setDate(DaysAgo.getDate() - 7);
      DaysAgo.setHours(0, 0, 0, 0);

      let questions = await prisma.question.findMany({
        where: {
          classId: cid,
          topicId: tid,
          createdAt: {
            gte: DaysAgo.toISOString(),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: true,
          likedBy: {
            select: {
              id: true,
              userId: true,
              questionId: true,
            },
          },
          dislikedBy: {
            select: {
              id: true,
              userId: true,
              questionId: true,
            },
          },
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

      // If no questions in the last 7 days, fetch the latest 10 questions
      if (questions.length <= 10) {
        questions = await prisma.question.findMany({
          where: {
            classId: cid,
            topicId: tid,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Get the latest 10 questions
          include: {
            user: true,
            likedBy: {
              select: {
                id: true,
                userId: true,
                questionId: true,
              },
            },
            dislikedBy: {
              select: {
                id: true,
                userId: true,
                questionId: true,
              },
            },
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
      }

      // Calculate replies length for each paltaQBy and set replies to undefined
      questions.forEach(question => {
        question.paltaQBy.forEach(paltaQBy => {
          (paltaQBy as any).repliesLength = paltaQBy.replies.length;
          (paltaQBy as any).replies = undefined; // Set replies to undefined
        });
      });

      return new Response(JSON.stringify(questions), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch questions' }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }
  } else {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export { getHandler as GET };