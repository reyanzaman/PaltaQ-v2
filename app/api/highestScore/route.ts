import { NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

export async function getHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'GET') {
        const url = req?.url ? new URL(req.url) : null;
        const uids = url?.searchParams.get('uids')?.split(',');

        try {
            let highestScores: { [key: string]: any } = {};
            if (uids && uids.length > 0) {
                const enrollments = await prisma.classEnrollment.findMany({
                    where: {
                        userId: {
                            in: uids,
                        },
                    },
                });

                uids.forEach(uid => {
                    const userEnrollments = enrollments.filter(e => e.userId === uid);
                    highestScores[uid] = userEnrollments.length > 0 ? Math.max(...userEnrollments.map(e => e.score)) : null;
                });
            }

            return new Response(JSON.stringify(highestScores), {
                status: 200,
            });

        } catch (error) {
            console.error('Failed to get ranks:', error);
            return new Response(JSON.stringify({ error: 'Failed to get ranks' }), {
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