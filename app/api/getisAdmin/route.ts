// pages/api/getUserId/route.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { getUserIDFromDatabase, getisAdmin } from '@/app/utils/getUtils';

export async function getHandler(req: NextApiRequest, res: NextApiResponse) {
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
    const isAdmin = await getisAdmin(email as string);

    if (isAdmin) {
      return new Response('', {
        status: 200,
        statusText: 'true',
        headers: {
            'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response('', {
        status: 200,
        statusText: 'false',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    }
  } catch (error) {
    console.error('Error fetching user admin status:', error);
    return new Response(JSON.stringify({ error: `Error fetching user admin status: ${error}` }), {
      status: 500,
      headers: {
          'Content-Type': 'application/json'
      }
    });
  }
}

export { getHandler as GET };
