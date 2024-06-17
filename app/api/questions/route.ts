import { NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

export async function getHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'GET') {
        const url = req?.url ? new URL(req.url) : null;
        const cid = url?.searchParams.get('cid');

        try {
            if (cid) {
                const question = await prisma.question.findMany({
                    where: {
                        classId: cid,
                    },
                    include: {
                        user: true,
                        topic: true,
                        likedBy: true,
                        dislikedBy: true,
                        paltaQBy: true,
                        questionType: true
                        }
                    }
                );
            return new Response(JSON.stringify(question), {
                status: 200,
                statusText: `Question retrieved`
            })
        }
        } catch (error) {
        console.error('Failed to get question:', error);
        return new Response(JSON.stringify({ error: 'Failed to get question' }), {
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