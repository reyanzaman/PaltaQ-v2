import { NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

export async function getHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'GET') {

        const url = req?.url ? new URL(req.url) : null;
        const cid = url?.searchParams.get('id');

        try {
            const topics = await prisma.topic.findMany({
                where: {
                    classId: cid || undefined
                }
            });
            return new Response(JSON.stringify(topics), {
                status: 200,
            })
        } catch (error) {
            console.error('Failed to get topics:', error);
            return new Response(JSON.stringify({ error: 'Failed to get topics' }), {
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