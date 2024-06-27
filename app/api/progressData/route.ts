import { NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { getUserIDFromDatabase } from '@/app/utils/getUtils';

const secret = process.env.SECRET;

export async function getHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'GET') {
        const url = req?.url ? new URL(req.url) : null;

        const id = url?.searchParams.get('id');

        // Get the session
        const token = await getToken({ req: req as any, secret });

        let userId = "";

        // Check if the user is authenticated
        if (!token) {
            return new Response(JSON.stringify({ error: 'Failed to get user details' }), {
                status: 500,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } else {
            // Extract user email from the token
            const userEmail = token?.email;
            userId = await getUserIDFromDatabase(userEmail ?? '');
        }

        try {
            if (id && userId) {
                const user = await prisma.classEnrollment.findUnique({
                    where: {
                        userId_classId: {
                            classId: id,
                            userId: userId
                        },
                    },
                    include: {
                        user: {
                            include: {
                                userDetails: true
                            }
                        },
                    }
                });
                return new Response(JSON.stringify(user), {
                    status: 200,
                })
            }

        } catch (error) {
            console.error('Failed to get progress data:', error);
            return new Response(JSON.stringify({ error: 'Failed to get progress data' }), {
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