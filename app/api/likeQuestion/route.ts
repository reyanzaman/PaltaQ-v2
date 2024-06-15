import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

export async function postHandler(req: Request, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    const body = await req.json();

    const { userId, questionId, type } = body;

    try {
        // Check if the user has already liked the question
        var existingLike;
        if (type === 'question') {
            existingLike = await prisma.likes.findFirst({
                where: {
                    questionId: questionId as string,
                    userId: userId as string,
                },
            });
        } else if (type === 'palta') {
            existingLike = await prisma.likes.findFirst({
                where: {
                    paltaQId: questionId as string,
                    userId: userId as string,
                },
            });
        }

        if (existingLike) {
            // If like exists, delete it
            await prisma.likes.delete({
                where: {
                    id: existingLike.id,
                },
            });

            // Decrement the likes count in the question record
            if (type === 'question') {
                const updatedQuestion = await prisma.question.update({
                    where: {
                        id: questionId as string,
                    },
                    data: {
                        likes: {
                            decrement: 1, // Decrement the likes count by 1
                        },
                    }
                });

                return new Response(JSON.stringify(updatedQuestion), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else if (type === 'palta'){
                const updatedQuestion = await prisma.paltaQ.update({
                    where: {
                        id: questionId as string,
                    },
                    data: {
                        likes: {
                            decrement: 1, // Decrement the likes count by 1
                        },
                    }
                });

                return new Response('-1', {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        }

        // Create a new like record
        if (type === 'question') {
            if (!existingLike) {
                await prisma.likes.create({
                    data: {
                        questionId: questionId as string,
                        userId: userId as string,
                    },
                });

                // Increment the likes count in the question record
                const updatedQuestion = await prisma.question.update({
                    where: {
                        id: questionId as string,
                    },
                    data: {
                        likes: {
                            increment: 1,
                        },
                    },
                });

                return new Response('+1', {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        } else if (type === 'palta') {
            if (!existingLike) {
                await prisma.likes.create({
                    data: {
                        paltaQId: questionId as string,
                        userId: userId as string,
                    },
                });

                // Increment the likes count in the question record
                const updatedQuestion = await prisma.paltaQ.update({
                    where: {
                        id: questionId as string,
                    },
                    data: {
                        likes: {
                            increment: 1,
                        },
                    }
                });

                return new Response('+1', {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        }

    } catch (error) {
        console.error('Error liking question:', error);
        return new Response(JSON.stringify({ error: `Internal Server Error: ${error}` }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

export { postHandler as POST };