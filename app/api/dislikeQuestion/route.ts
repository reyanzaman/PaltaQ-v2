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
        // Check if the user has already disliked the question
        var existingDislike;
        if (type === 'question') {
            existingDislike = await prisma.dislikes.findFirst({
                where: {
                    questionId: questionId as string,
                    userId: userId as string,
                },
            });
        } else if (type === 'palta') {
            existingDislike = await prisma.dislikes.findFirst({
                where: {
                    paltaQId: questionId as string,
                    userId: userId as string,
                },
            });
        }

        if (existingDislike) {
            // If like exists, delete it
            await prisma.dislikes.delete({
                where: {
                    id: existingDislike.id,
                },
            });

            // Decrement the dislikes count in the question record
            if (type === 'question') {
                const updatedQuestion = await prisma.question.update({
                    where: {
                        id: questionId as string,
                    },
                    data: {
                        dislikes: {
                            decrement: 1, // Decrement the dislikes count by 1
                        },
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                        likedBy: {
                            select: {
                                id: true,
                                userId: true,
                                questionId: true,
                            },
                        },
                        dislikedBy: {
                            select: {
                                id: true,
                                userId: true,
                                questionId: true,
                            },
                        },
                        paltaQBy: {
                            select: {
                              id: true,
                              userId: true,
                              user: true,
                              paltaQ: true,
                              questionId: true,
                              score: true,
                              likes: true,
                              dislikes: true,
                              likedBy: true,
                              dislikedBy: true,
                              isAnonymous: true,
                              createdAt: true,
                            },
                          }
                    },
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
                        dislikes: {
                            decrement: 1, // Decrement the dislikes count by 1
                        },
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                        likedBy: {
                            select: {
                                id: true,
                                userId: true,
                                questionId: true,
                            },
                        },
                        dislikedBy: {
                            select: {
                                id: true,
                                userId: true,
                                questionId: true,
                            },
                        },
                    },
                });

                return new Response(JSON.stringify(updatedQuestion), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        }

        // Create a new dislike record
        if (type === 'question') {
            if (!existingDislike) {
                await prisma.dislikes.create({
                    data: {
                        questionId: questionId as string,
                        userId: userId as string,
                    },
                });

                // Increment the dislikes count in the question record
                const updatedQuestion = await prisma.question.update({
                    where: {
                        id: questionId as string,
                    },
                    data: {
                        dislikes: {
                            increment: 1,
                        },
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                        likedBy: {
                            select: {
                                id: true,
                                userId: true,
                                questionId: true,
                            },
                        },
                        dislikedBy: {
                            select: {
                                id: true,
                                userId: true,
                                questionId: true,
                            },
                        }
                    },
                });

                return new Response(JSON.stringify(updatedQuestion), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        } else if (type === 'palta') {
            if (!existingDislike) {
                await prisma.dislikes.create({
                    data: {
                        paltaQId: questionId as string,
                        userId: userId as string,
                    },
                });

                // Increment the dislikes count in the question record
                const updatedQuestion = await prisma.paltaQ.update({
                    where: {
                        id: questionId as string,
                    },
                    data: {
                        dislikes: {
                            increment: 1,
                        },
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                image: true,
                            },
                        },
                        likedBy: {
                            select: {
                                id: true,
                                userId: true,
                                questionId: true,
                            },
                        },
                        dislikedBy: {
                            select: {
                                id: true,
                                userId: true,
                                questionId: true,
                            },
                        }
                    },
                });

                return new Response(JSON.stringify(updatedQuestion), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }
        }

    } catch (error) {
        console.error('Error disliking question:', error);
        return new Response(JSON.stringify({ error: `Internal Server Error: ${error}` }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }
}

export { postHandler as POST };