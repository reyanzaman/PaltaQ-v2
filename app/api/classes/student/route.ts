import { NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

export async function deleteHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'DELETE') {
        const url = req?.url ? new URL(req.url) : null;
        const uid = url?.searchParams.get('uid');
        const cid = url?.searchParams.get('cid');

        try {
            if(uid && cid) {
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
                    statusText: `User Removed`
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

export { deleteHandler as DELETE };