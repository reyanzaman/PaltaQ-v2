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
        console.log('name:', className, 'facultyId:', facultyId);

        try {
            const newClass = await prisma.classes.create({
                data: {
                    name: className,
                    code: code,
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

            return new Response('', {
                status: 200,
                statusText: `Class created with code ${code}`
            })
        } catch (error: any) {
            if (error.code === 'P2002') {
                // Unique constraint error
                console.error('Failed to create class due to unique constraint:', error.meta.target);
        
                return new Response(JSON.stringify({ error: `Class with this ${error.meta.target} already exists` }), {
                    status: 409, // Conflict status code
                    statusText: `Class name must be unique`,
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
                    statusText: `Class retrieved`
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
                return new Response(JSON.stringify(user), {
                    status: 200,
                    statusText: `Class deleted`
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
                return new Response(JSON.stringify({ error: 'Class not found' }), {
                    status: 404,
                    statusText: 'Class not found',
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

            return new Response('', {
                status: 200,
                statusText: `Class joined`,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error: any) {
            if (error.code === 'P2002') {
                return new Response(JSON.stringify({ error: 'Conflict' }), {
                    status: 409,
                    statusText: 'User is already enrolled in this class',
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

export { postHandler as POST };
export { getHandler as GET };
export { deleteHandler as DELETE };
export { putHandler as PUT };