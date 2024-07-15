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

        const { className, facultyId } = await req.json();

        const currentDate = new Date();
        const endsAtDate = new Date(currentDate.setDate(currentDate.getDate() + 100));

        try {
            const newClass = await prisma.classes.create({
                data: {
                    name: className,
                    code: code,
                    creatorId: facultyId,
                    endsAt: endsAtDate
                }
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
                                        }
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

        if (!cid || (!cname && !cdate)) {
            return new Response(JSON.stringify({ error: 'cid and cname/cdate are required' }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } else {
            try {
                if(cname && cid && cdate) {
                    // Attempt to parse the date string
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

                    const endsAt = new Date(parsedDate).toISOString();

                    const user = await prisma.classes.update({
                        where: {
                            id: cid,
                        },
                        data: {
                            name: cname,
                            endsAt: endsAt
                        }
                    });
                    return new Response(JSON.stringify({ message: 'Class details updated' }), {
                        status: 200,
                    })
                }
            } catch (error: any) {
                console.error('Failed to update class:', error);

                if (error.code === 'P2002' && error.meta?.target.includes('name')) {
                    // Handle unique constraint violation specifically for 'name' field
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