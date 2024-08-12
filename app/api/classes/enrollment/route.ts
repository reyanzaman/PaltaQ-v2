import { NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

export async function getHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'GET') {
        const url = req?.url ? new URL(req.url) : null;
        const code = url?.searchParams.get('code');
        const uid = url?.searchParams.get('uid');

        try {
            if (code && uid) {
                // First, find the class with the given code
                const classData = await prisma.classes.findUnique({
                    where: {
                        code: code,
                    },
                });

                if (!classData) {
                    throw new Error('Class not found');
                }

                // Then, find the enrollment using the class ID and user ID
                const enrollment = await prisma.classEnrollment.findUnique({
                    where: {
                        userId_classId: {
                            userId: uid,
                            classId: classData.id,
                        },
                    },
                    include: {
                        preQuestionnaire: true,
                        postQuestionnaire: true,
                        class: true,
                    },
                });

                return new Response(JSON.stringify(enrollment), {
                    status: 200,
                })
            } else {
                return new Response(JSON.stringify({ error: 'Data Missing' }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
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