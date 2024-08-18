import { NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

export async function postHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'POST') {
        const url = req?.url ? new URL(req.url) : null;
        const ceid = url?.searchParams.get('ceid');
        const uid = url?.searchParams.get('uid');
        const type = url?.searchParams.get('type');

        try {
            if (ceid && uid && type) {
                if (type == 'pre') {
                    await prisma.preQuestionnaire.create({
                        data: {
                            userId: uid,
                            classId: ceid,
                        }
                    });
                } else if (type == 'post') {
                    await prisma.postQuestionnaire.create({
                        data: {
                            userId: uid,
                            classId: ceid,
                        }
                    });
                } else {
                    return new Response(JSON.stringify({ error: 'Invalid Type' }), {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }

                return new Response('', {
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

export async function patchHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'PATCH') {
        const url = req?.url ? new URL(req.url) : null;
        const ceid = url?.searchParams.get('ceid');
        const type = url?.searchParams.get('type');
        const uid = url?.searchParams.get('uid');

        console.log({ceid, type, uid});

        // Extract question data from the request body
        const { univID, section, age, gender, curiosity, smallQues, nowQues, enjoyStudies, confidence, motivation } = await req.json();

        try {
            if (ceid && type) {
                if (type == 'pre') {
                    await prisma.preQuestionnaire.update({
                        data: {
                            isCompleted: true,
                            universityId: univID,
                            section: section,
                            currentAge: age,
                            gender: gender,
                            curiosity: parseInt(curiosity),
                            questionsAtAge4: smallQues,
                            questionsYesterday: nowQues,
                            enjoyStudies: parseInt(enjoyStudies),
                            confidentStudies: parseInt(confidence),
                            motivatedStudies: motivation
                        },
                        where: {
                            userId: uid ?? undefined,
                            classId: ceid,
                        }
                    });
                } else if (type == 'post') {
                    await prisma.postQuestionnaire.update({
                        data: {
                            // Add the properties you want to update here
                        },
                        where: {
                            classId: ceid,
                        }
                    });
                } else {
                    return new Response(JSON.stringify({ error: 'Invalid Type' }), {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }

                // Return success response
                return new Response(JSON.stringify({ message: 'Pre-Questionnaire submitted'}), {
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

export { postHandler as POST };
export { patchHandler as PATCH };
