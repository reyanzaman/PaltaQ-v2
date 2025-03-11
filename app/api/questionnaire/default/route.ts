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

        console.log({ ceid, type, uid });

        // Declare variables outside the if statement
        let studentId, age, schoolLocation, maritalStatus;
        let studyMotivation, studyCuriosity, questionsAsked, questionExample, subjectILike, dontEnjoyStudying, cgpa, extraCurricular, studyTime, leisureTime;
        let questionArises, courageToAsk, curiousToKnow, whyChildrenAskQuestions;
        let desireToLearn, askTeachers, askPeer, askMyself, askGPT, askResearch, askAvoid, motivatedToAsk;
        let multQuesAskStudents, multQuesAskGroup, multQuesAskMyself, multQuesAvoid, multQuesResearch, multQuesMemorize;
        let quesHelpsUnderstand, easierToMemorize, opinionAskingQues, opinionMemorizing, opinionPracticing;
        let interestPaltaQ, suggestionsPaltaQ;

        // Extract question data from the request body
        if (type == 'pre') {
            ({
                studentId, age, schoolLocation, maritalStatus,
                studyMotivation, studyCuriosity, questionsAsked, questionExample, subjectILike, dontEnjoyStudying, cgpa, extraCurricular, studyTime, leisureTime,
                questionArises, courageToAsk, curiousToKnow, whyChildrenAskQuestions,
                desireToLearn, askTeachers, askPeer, askMyself, askGPT, askResearch, askAvoid, motivatedToAsk,
                multQuesAskStudents, multQuesAskGroup, multQuesAskMyself, multQuesAvoid, multQuesResearch, multQuesMemorize,
                quesHelpsUnderstand, easierToMemorize, opinionAskingQues, opinionMemorizing, opinionPracticing
            } = await req.json());

        } else if (type == 'post') {
            ({
                studentId, interestPaltaQ, suggestionsPaltaQ,
                studyMotivation, studyCuriosity, questionsAsked, questionExample, subjectILike, dontEnjoyStudying, cgpa, extraCurricular, studyTime, leisureTime,
                questionArises, courageToAsk, curiousToKnow, whyChildrenAskQuestions,
                desireToLearn, askTeachers, askPeer, askMyself, askGPT, askResearch, askAvoid, motivatedToAsk,
                multQuesAskStudents, multQuesAskGroup, multQuesAskMyself, multQuesAvoid, multQuesResearch, multQuesMemorize,
                quesHelpsUnderstand, easierToMemorize, opinionAskingQues, opinionMemorizing, opinionPracticing
            } = await req.json());
        }

        // Variables are now accessible here
        console.log({
            studentId, age, schoolLocation, maritalStatus,
            studyMotivation, studyCuriosity, questionsAsked, questionExample, subjectILike, dontEnjoyStudying, cgpa, extraCurricular, studyTime, leisureTime,
            questionArises, courageToAsk, curiousToKnow, whyChildrenAskQuestions,
            desireToLearn, askTeachers, askPeer, askMyself, askGPT, askResearch, askAvoid, motivatedToAsk,
            multQuesAskStudents, multQuesAskGroup, multQuesAskMyself, multQuesAvoid, multQuesResearch, multQuesMemorize,
            quesHelpsUnderstand, easierToMemorize, opinionAskingQues, opinionMemorizing, opinionPracticing,
            interestPaltaQ, suggestionsPaltaQ
        });

        try {
            if (ceid && type) {
                // Pre Questionnaire
                if (type == 'pre') {
                    await prisma.preQuestionnaire.update({
                        data: {
                            isCompleted: true,
                            studentId: studentId,
                            age: age,
                            schoolLocation: schoolLocation,
                            maritalStatus: maritalStatus,
                            studyMotivation: studyMotivation,
                            studyCuriosity: studyCuriosity,
                            quesionsAsked: questionsAsked,
                            questionExample: questionExample,
                            subjectILike: subjectILike,
                            dontEnjoyStudying: dontEnjoyStudying,
                            cgpa: cgpa,
                            extraCurricular: extraCurricular,
                            studyTime: studyTime,
                            leisureTime: leisureTime,
                            questionArises: questionArises,
                            courageToAsk: courageToAsk,
                            curiousToKnow: curiousToKnow,
                            whyChildrenAskQuestions: whyChildrenAskQuestions,
                            desireToLearn: desireToLearn,
                            askTeacher: askTeachers,
                            askPeer: askPeer,
                            askMyself: askMyself,
                            askGPT: askGPT,
                            askResearch: askResearch,
                            askAvoid: askAvoid,
                            motivatedToAsk: motivatedToAsk,
                            multQuesAskStudents: multQuesAskStudents,
                            multQuesAskGroup: multQuesAskGroup,
                            multQuesAskMyself: multQuesAskMyself,
                            multQuesAvoid: multQuesAvoid,
                            multQuesResearch: multQuesResearch,
                            multQuesMemorize: multQuesMemorize,
                            quesHelpsUnderstand: quesHelpsUnderstand,
                            easierToMemorize: easierToMemorize,
                            opinionAskingQues: opinionAskingQues,
                            opinionMemorizing: opinionMemorizing,
                            opinionPracticing: opinionPracticing
                        },
                        where: {
                            userId: uid ?? undefined,
                            classId: ceid,
                        }
                    });
                } else if (type == 'post') {
                    // Post Questionnaire
                    await prisma.postQuestionnaire.update({
                        data: {
                            isCompleted: true,
                            studentId: studentId,
                            interestPaltaQ: interestPaltaQ,
                            suggestionsPaltaQ: suggestionsPaltaQ,
                            studyMotivation: studyMotivation,
                            studyCuriosity: studyCuriosity,
                            quesionsAsked: questionsAsked,
                            questionExample: questionExample,
                            subjectILike: subjectILike,
                            dontEnjoyStudying: dontEnjoyStudying,
                            cgpa: cgpa,
                            extraCurricular: extraCurricular,
                            studyTime: studyTime,
                            leisureTime: leisureTime,
                            questionArises: questionArises,
                            courageToAsk: courageToAsk,
                            curiousToKnow: curiousToKnow,
                            whyChildrenAskQuestions: whyChildrenAskQuestions,
                            desireToLearn: desireToLearn,
                            askTeacher: askTeachers,
                            askPeer: askPeer,
                            askMyself: askMyself,
                            askGPT: askGPT,
                            askResearch: askResearch,
                            askAvoid: askAvoid,
                            motivatedToAsk: motivatedToAsk,
                            multQuesAskStudents: multQuesAskStudents,
                            multQuesAskGroup: multQuesAskGroup,
                            multQuesAskMyself: multQuesAskMyself,
                            multQuesAvoid: multQuesAvoid,
                            multQuesResearch: multQuesResearch,
                            multQuesMemorize: multQuesMemorize,
                            quesHelpsUnderstand: quesHelpsUnderstand,
                            easierToMemorize: easierToMemorize,
                            opinionAskingQues: opinionAskingQues,
                            opinionMemorizing: opinionMemorizing,
                            opinionPracticing: opinionPracticing
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
                return new Response(JSON.stringify({ message: 'Questionnaire submitted'}), {
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
            console.error('Failed to submit questionnaire:', error);
            return new Response(JSON.stringify({ error: 'Failed to submit questionnaire' }), {
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
