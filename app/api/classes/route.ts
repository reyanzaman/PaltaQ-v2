import { NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

import { generateUniqueCode } from '@/app/utils/classUtils';

export async function postHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'POST') {
        let code;
        let codeExists;
        
        do {
            code = await generateUniqueCode();

            codeExists = await prisma.classes.findFirst({
                where: { code: code }
            });
        } while (codeExists);

    const { className, facultyId, startTime, endTime, activeDays } = await req.json();

        const currentDate = new Date();
        const endsAtDate = new Date(currentDate.setDate(currentDate.getDate() + 100));

        try {
                const newClass = await prisma.classes.create({
                data: {
                    name: className,
                    code: code,
                    creatorId: facultyId,
                    endsAt: endsAtDate,
                    questionnaire: false,
                    status: true,
                    startTime: startTime ?? null,
                    endTime: endTime ?? null,
                    activeDays: Array.isArray(activeDays) ? activeDays : []
                } as any
            });

            await prisma.classFaculty.create({
                data: {
                    userId: facultyId,
                    classId: newClass.id
                }
            });

            await prisma.classEnrollment.create({
                data: {
                    userId: facultyId,
                    classId: newClass.id
                }
            });

            return new Response(JSON.stringify({ message: `Class created with code ${code}` }), {
                status: 200,
            })

        } catch (error: any) {
            if (error.code === 'P2002') {
                // Unique constraint error
                console.error('Failed to create class due to unique constraint:', error.meta.target);
        
                return new Response(JSON.stringify({ error: `Class with this ${error.meta.target} already exists`, message: `Class name must be unique` }), {
                    status: 409,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                console.error('Failed to create class:', error);
                return new Response(JSON.stringify({ error: 'Failed to create class' }), {
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

export async function getHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'GET') {
        const url = req?.url ? new URL(req.url) : null;
        const id = url?.searchParams.get('id');

        try {
            if(id) {
                const user = await prisma.classFaculty.findMany({
                    where: {
                        userId: id,
                    },
                    include: {
                        class: {
                            include: {
                                enrollments: {
                                    include: {
                                        user: {
                                            include: {
                                                userDetails: true
                                            }
                                        },
                                        preQuestionnaire: true,
                                        postQuestionnaire: true
                                    }
                                }
                            }
                        }
                    }
                });
                return new Response(JSON.stringify(user), {
                    status: 200,
                })
            }
        } catch (error) {
            console.error('Failed to get class:', error);
            return new Response(JSON.stringify({ error: 'Failed to get class' }), {
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

export async function deleteHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const url = req?.url ? new URL(req.url) : null;
        const id = url?.searchParams.get('id');

        try {
            if(id) {
                const user = await prisma.classes.delete({
                    where: {
                        id: id,
                    }
                });
                return new Response(JSON.stringify({ message: 'Class deleted' }), {
                    status: 200,
                })
            }
        } catch (error) {
            console.error('Failed to delete class:', error);
            return new Response(JSON.stringify({ error: 'Failed to delete class' }), {
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

export async function putHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'PUT') {
        const url = req?.url ? new URL(req.url) : null;
        const code = url?.searchParams.get('code');
        const userId = url?.searchParams.get('uid');

        if (!code || !userId) {
            return new Response(JSON.stringify({ error: 'code and userId are required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        try {
            // Fetch the class by code
            const classData = await prisma.classes.findUnique({
                where: {
                    code: code
                }
            });

            if (!classData) {
                return new Response(JSON.stringify({ error: 'Class not found', message: 'Class does not exist' }), {
                    status: 404,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }

            const classId = classData.id;

            // Create a new enrollment
            await prisma.classEnrollment.create({
                data: {
                    userId: userId,
                    classId: classId
                }
            });

            // Create a new faculty
            await prisma.classFaculty.create({
                data: {
                    userId: userId,
                    classId: classId
                }
            });

            return new Response(JSON.stringify({ message: 'Class joined' }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error: any) {
            if (error.code === 'P2002') {
                return new Response(JSON.stringify({ error: 'Conflict', mesage: 'User is already enrolled in this class' }), {
                    status: 409,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }

            console.error('Failed to create class enrollment:', error);
            return new Response(JSON.stringify({ error: 'Failed to create class enrollment' }), {
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
    const cid = url?.searchParams.get('cid');
    const cname = url?.searchParams.get('cname');
    const cdate = url?.searchParams.get('cdate');
    const qstatus = url?.searchParams.get('qstatus');
    const topicCheck = url?.searchParams.get('topicCheck');
    const status = url?.searchParams.get('status');
    const cstart = url?.searchParams.get('cstart');
    const cend = url?.searchParams.get('cend');
    const cdays = url?.searchParams.get('cdays'); // comma separated days

        if (!cid) {
            return new Response(JSON.stringify({ error: 'cid is required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }

        try {
            // Build update data only for provided params
            const updateData: any = {};

            if (cname) updateData.name = cname;
            if (cdate) {
                const parsedDate = Date.parse(cdate);
                if (isNaN(parsedDate)) {
                    console.error('Invalid Date Format:', cdate);
                    return new Response(JSON.stringify({ error: 'Invalid Date Format' }), {
                        status: 400,
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                }
                updateData.endsAt = new Date(parsedDate).toISOString();
            }
            if (typeof qstatus === 'string') updateData.questionnaire = qstatus === 'true';
            if (typeof status === 'string') updateData.status = status === 'true';
            if (typeof topicCheck === 'string') updateData.topicCheck = topicCheck === 'true';
            if (cstart) updateData.startTime = cstart;
            if (cend) updateData.endTime = cend;
            if (cdays) updateData.activeDays = cdays.split(',');

            // If no updatable fields were provided, return bad request
            if (Object.keys(updateData).length === 0) {
                return new Response(JSON.stringify({ error: 'No updatable fields provided' }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }

            await prisma.classes.update({
                where: { id: cid },
                data: updateData as any,
            });

            return new Response(JSON.stringify({ message: 'Class details updated' }), {
                status: 200,
            });
        } catch (error: any) {
            console.error('Failed to update class:', error);

            if (error.code === 'P2002' && error.meta?.target.includes('name')) {
                return new Response(JSON.stringify({ error: 'Class Name must be unique' }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }

            return new Response(JSON.stringify({ error: 'Failed to update class' }), {
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
export { getHandler as GET };
export { deleteHandler as DELETE };
export { putHandler as PUT };
export { patchHandler as PATCH };