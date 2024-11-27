import { NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

export async function deleteHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'DELETE') {

        const url = req?.url ? new URL(req.url) : null;
        const cid = url?.searchParams.get('classId');
        const tid = url?.searchParams.get('topicId');

        try {

            // Fetch all questions linked to the topic and class
            const questions = await prisma.question.findMany({
                where: {
                    topicId: tid as string,
                    class: {
                        id: cid as string,
                    },
                },
            });

            if (questions.length === 0) {
                console.log("No questions found for the given topic and class.");
                return new Response(JSON.stringify(`0 Questions Deleted`), {
                    status: 200,
                })
            }

            // Updating Statistics
            for (const question of questions) {
                // Fetch PaltaQ records for the question
                const paltaQs = await prisma.paltaQ.findMany({
                    where: {
                        OR: [
                            { questionId: question.id },
                            { mainQuestionID: question.id },
                        ],
                    },
                });

                // Adjust Statistics for the PaltaQs
                for (const paltaQ of paltaQs) {
                    await prisma.userDetails.update({
                        where: { userId: paltaQ.userId },
                        data: {
                            totalScore: {
                                decrement: paltaQ.score,
                            },
                            paltaQAsked: {
                                decrement: 1,
                            },
                        },
                    });
                    await prisma.classEnrollment.updateMany({
                        where: {
                            classId: question.classId,
                            userId: question.userId,
                        },
                        data: {
                            score: {
                                decrement: paltaQ.score,
                            },
                            paltaQCount: {
                                decrement: 1,
                            },
                        },
                    });
                }

                // Adjust UserDetails for the main question
                await prisma.userDetails.update({
                    where: { userId: question.userId },
                    data: {
                        totalScore: {
                            decrement: question.score,
                        },
                        questionsAsked: {
                            decrement: 1,
                        },
                    },
                });

                // Update ClassEnrollment for the user
                await prisma.classEnrollment.updateMany({
                    where: {
                        classId: question.classId,
                        userId: question.userId,
                    },
                    data: {
                        score: {
                            decrement: question.score,
                        },
                        questionCount: {
                            decrement: 1,
                        },
                    },
                });

                // Delete all PaltaQ for this question
                await prisma.paltaQ.deleteMany({
                    where: {
                        OR: [
                            { questionId: question.id },
                            { mainQuestionID: question.id },
                        ],
                    },
                });
            }

            // Delete the questions
            const deletedQuestions = await prisma.question.deleteMany({
                where: {
                    topicId: tid as string,
                    class: {
                        id: cid as string,
                    },
                },
            });

            console.log(`${deletedQuestions.count} Questions Deleted`);
            return new Response(JSON.stringify(`${deletedQuestions.count} Questions Deleted`), {
                status: 200,
            })
        } catch (error) {
            console.error('Failed to delete questions:', error);
            return new Response(JSON.stringify({ error: 'Failed to delete questions' }), {
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

export { deleteHandler as DELETE };