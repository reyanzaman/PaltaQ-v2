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
              image: true
            }
          }
        }
      });

      return res.status(200).json(questions);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
      return res.status(500).json({ error: 'Failed to fetch questions' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

export { getHandler as GET };