import { NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

export async function deleteHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const url = req?.url ? new URL(req.url) : null;
        const uid = url?.searchParams.get('uid');
        const cid = url?.searchParams.get('cid');

        try {
            if (uid && cid) {
                await prisma.classEnrollment.delete({
                    where: {
                        userId_classId: {
                            userId: uid,
                            classId: cid
                        }
                    }
                });
                await prisma.classFaculty.delete({
                    where: {
                        classId_userId: {
                            classId: cid,
                            userId: uid
                        }
                    }
                });
                return new Response('', {
                    status: 200,
                })
            }
        } catch (error) {
            console.error('Failed to remove user:', error);
            return new Response(JSON.stringify({ error: 'Failed to remove user' }), {
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

export async function getHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'GET') {
        const url = req?.url ? new URL(req.url) : null;
        const id = url?.searchParams.get('id');

        const include = url?.searchParams.get('include');

        try {
            if (include == "UD") {
                if (id) {
                    const user = await prisma.classEnrollment.findMany({
                        where: {
                            userId: id,
                        },
                        include: {
                            user: {
                                include: {
                                    userDetails: true
                                }
                            },
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
            } else {
                if (id) {
                    const user = await prisma.classEnrollment.findMany({
                        where: {
                            userId: id,
                        },
                        include: {
                            user: {
                                include: {
                                    userDetails: true
                                }
                            },
                            class: {
                                include: {
                                    faculties: {
                                        include: {
                                            user: true
                                        },
                                        orderBy: {
                                            createdAt: 'asc'
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

export { deleteHandler as DELETE };
export { getHandler as GET };