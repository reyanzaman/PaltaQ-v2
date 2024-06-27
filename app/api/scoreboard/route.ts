import { NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

export async function getHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'GET') {
        const url = req?.url ? new URL(req.url) : null;

        const id = url?.searchParams.get('id');

        try {
            if (id) {
                const user = await prisma.classEnrollment.findMany({
                    where: {
                        classId: id,
                    },
                    include: {
                        user: {
                            include: {
                                userDetails: true
                            }
                        },
                        class: true
                    }
                });
                return new Response(JSON.stringify(user), {
                    status: 200,
                })
            }

        } catch (error) {
            console.error('Failed to get class enrollments:', error);
            return new Response(JSON.stringify({ error: 'Failed to get class enrollments' }), {
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