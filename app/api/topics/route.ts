import { Question } from '@prisma/client';
import { NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

export async function getHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'GET') {
        const url = req?.url ? new URL(req.url) : null;
        const cid = url?.searchParams.get('cid');

        try {
            if (cid) {
                const topics = await prisma.topic.findMany({
                    where: {
                        classId: cid,
                    },
                    include: {
                        _count: {
                            select: { questions: true }
                        },
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
                );

                // Transform the data to include only the count of questions
                const topicsWithQuestionCount = topics.map(topic => ({
                    ...topic,
                    questions: topic._count.questions
                }));

                return new Response(JSON.stringify(topicsWithQuestionCount), {
                    status: 200,
                    statusText: `Topics retrieved`
                })
            }
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

export async function postHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { classId, topicName } = await req.json();
        console.log('name:', classId, 'facultyId:', topicName);

        try {
            await prisma.topic.create({
                data: {
                    name: topicName,
                    classId: classId,
                }
            });

            return new Response('', {
                status: 200,
                statusText: `Topic created`
            })
        } catch (error: any) {
            if (error.code === 'P2002') {
                // Unique constraint error
                console.error('Failed to create topic due to unique constraint:', error.meta.target);

                return new Response(JSON.stringify({ error: `Topic with this ${error.meta.target} already exists` }), {
                    status: 409, // Conflict status code
                    statusText: `Topic name must be unique within a class`,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                console.error('Failed to create topic:', error);
                return new Response(JSON.stringify({ error: 'Failed to create topic' }), {
                    status: 500,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        }
    } else {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
};

export async function deleteHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const url = req?.url ? new URL(req.url) : null;
        const id = url?.searchParams.get('id');

        try {
            if(id) {
                await prisma.topic.delete({
                    where: {
                        id: id,
                    }
                });
                return new Response('', {
                    status: 200,
                    statusText: `Topic deleted`
                })
            }
        } catch (error) {
            console.error('Failed to delete topic:', error);
            return new Response(JSON.stringify({ error: 'Failed to delete topic' }), {
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

export async function patchHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'PATCH') {
        const url = req?.url ? new URL(req.url) : null;
        const topicId = url?.searchParams.get('tid');
        const topicName = url?.searchParams.get('name');

        if (!topicId || !topicName) {
            return new Response(JSON.stringify({ error: 'Topic ID is required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        try {
            const updatedTopic = await prisma.topic.update({
                where: {
                    id: topicId,
                },
                data: {
                    name: topicName,
                }
            });

            return new Response(JSON.stringify(updatedTopic), {
                status: 200,
                statusText: `Topic updated`
            })
        } catch (error: any) {
            if (error.code === 'P2002') {
                return new Response(JSON.stringify({ error: 'Conflict' }), {
                    status: 409,
                    statusText: 'Topic name already exists in this class',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }

            console.error('Failed to update topic:', error);
            return new Response(JSON.stringify({ error: 'Failed to update topic' }), {
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
export { postHandler as POST };
export { deleteHandler as DELETE };
export { patchHandler as PATCH};