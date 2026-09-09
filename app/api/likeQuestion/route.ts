import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';import { getToken } from "next-auth/jwt";
import { getUserIDFromDatabase } from "@/app/utils/getUtils";

const secret = process.env.SECRET;

export async function postHandler(req: Request, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    let body: any;
    try {
        body = await req.json();
    } catch {
        return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
    }

    const { userId, questionId, type } = body;
    if (!userId || !questionId || (type !== "question" && type !== "palta")) {
        return new Response(JSON.stringify({ error: "Invalid reaction request" }), { status: 400 });
    }

    const token = await getToken({ req: req as any, secret });
    if (!token?.email) {
        return new Response(JSON.stringify({ error: "Authentication required" }), { status: 401 });
    }

    let authenticatedUserId: string;
    try {
        authenticatedUserId = await getUserIDFromDatabase(String(token.email));
    } catch {
        return new Response(JSON.stringify({ error: "Authenticated user not found" }), { status: 401 });
    }

    if (authenticatedUserId !== userId) {
        return new Response(JSON.stringify({ error: "User identity does not match session" }), { status: 403 });
    }

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