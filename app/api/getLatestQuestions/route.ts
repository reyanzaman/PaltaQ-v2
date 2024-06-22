import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

import { cid, tid } from '@/app/api/submitGenQuestion/route';

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const questions = await prisma.question.findMany({
        where: {
          classId: cid,
          topicId: tid,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 6,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
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
              score: true,
              likes: true,
              dislikes: true,
              likedBy: true,
              dislikedBy: true,
              isAnonymous: true,
              createdAt: true,
            },
          }
        },
      });

      return new Response(JSON.stringify(questions), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
      });
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      return new Response(JSON.stringify({ error: 'Failed to fetch questions' }), {
        status: 500,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    }
  } else {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
          'Content-Type': 'application/json'
      }
  });
  }
}

export { getHandler as GET };
