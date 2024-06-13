// pages/api/getUserId/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIDFromDatabase } from '@/app/utils/getUtils';

export async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  console.log(req.url);
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: {
          'Content-Type': 'application/json'
      }
    });
  }

  const url = req?.url ? new URL(req.url) : null;
  const searchParams = new URLSearchParams(url?.searchParams);

  const email = searchParams.get('email');

  try {
    const userId = await getUserIDFromDatabase(email as string);

    if (userId) {
      return new Response(JSON.stringify(userId), {
        status: 200,
        headers: {
            'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: {
            'Content-Type': 'application/json'
        }
    });
    }
  } catch (error) {
    console.error('Error fetching user ID:', error);
    return new Response(JSON.stringify({ error: `Error fetching user ID: ${error}` }), {
      status: 500,
      headers: {
          'Content-Type': 'application/json'
      }
    });
  }
}

export { getHandler as GET };
