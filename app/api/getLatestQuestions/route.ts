import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';
import { cid, tid } from '@/app/api/submitGenQuestion/route';
import { revalidateTag } from 'next/cache';

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    revalidateTag('questions');
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 14);

      const questions = await prisma.question.findMany({
        where: {
          classId: cid,
          topicId: tid,
          createdAt: {
            gte: sevenDaysAgo,
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
            },
          },
        },
      });

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