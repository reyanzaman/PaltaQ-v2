import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';
import { revalidateTag } from 'next/cache';

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    revalidateTag('paltaQ');

    const url = req?.url ? new URL(req.url) : null;
    const pqid = url?.searchParams.get('pqid');

    try {
      const pquestions = await prisma.paltaQ.findMany({
        where: {
          parentId: pqid,
        },
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: true,
          likedBy: true,
          dislikedBy: true,
          replies: true,
          questionType: true,
        },
      });

      // Calculate replies length for each paltaQBy and set replies to undefined
      pquestions.forEach(paltaQ => {
          (paltaQ as any).repliesLength = paltaQ.replies.length;
          (paltaQ as any).replies = undefined; // Set replies to undefined
      });

      return new Response(JSON.stringify(pquestions), {
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