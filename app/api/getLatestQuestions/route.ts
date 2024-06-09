import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const questions = await prisma.question.findMany({
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
