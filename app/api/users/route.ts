import prisma from '@/app/lib/prisma';
import { revalidateTag } from 'next/cache';

export async function GET() {
  revalidateTag('users');
  
  try {
    const users = await prisma.user.findMany({
      include: {
        userDetails: true,
        classes: true,
      },
    });
    return new Response(JSON.stringify(users), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500 });
  }
}