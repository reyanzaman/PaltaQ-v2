import { cid } from './../../submitGenQuestion/route';
import { NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

export async function getHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'GET') {
        const url = req?.url ? new URL(req.url) : null;
        const uids = url?.searchParams.get('uids')?.split(',');
        const cid = url?.searchParams.get('cid');

        try {
            if (uids && cid && cid.length > 0 && uids.length > 0) {
                const enrollments = await prisma.classEnrollment.findMany({
                    where: {
                        userId: {
                            in: uids,
                        },
                        classId: cid,
                    },
                });

                let highestScores: { [key: string]: number } = {};
                enrollments.forEach(enrollment => {
                    highestScores[enrollment.userId] = enrollment.score;
                }); 

                return new Response(JSON.stringify(highestScores), {
                    status: 200,
                });
            } else {
                return new Response(JSON.stringify({ error: 'Invalid request' }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
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