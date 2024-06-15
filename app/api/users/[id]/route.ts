import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

export async function putHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'PUT') {
        const url = req?.url ? new URL(req.url) : null;
        const pathname = url?.pathname;
        const parts = pathname?.split('/') ?? [];
        const userId = parts[parts.length - 1];

        try {
            const { isAdmin, isFaculty } = await req.json();

            await prisma.user.update({
                where: {
                    id: userId,
                },
                data: {
                    is_Admin: isAdmin || false,
                    is_Faculty: isFaculty || false,
                },
            });

            return new Response("", {
                status: 200,
                statusText: `User updated`
            })
        } catch (error) {
            console.error('Failed to update user:', error);
            return new Response(JSON.stringify({ error: 'Failed to update user' }), {
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
};

export async function getHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'GET') {
        const url = req?.url ? new URL(req.url) : null;
        const pathname = url?.pathname;
        const parts = pathname?.split('/') ?? [];
        const email = parts[parts.length - 1];

        try {
            const user = await prisma.user.findUnique({
                where: {
                    email: email,
                }
            });

            return new Response(JSON.stringify(user), {
                status: 200,
                statusText: `User retrieved`
            })
        } catch (error) {
            console.error('Failed to get user:', error);
            return new Response(JSON.stringify({ error: 'Failed to get user' }), {
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

export { putHandler as PUT };
export { getHandler as GET };