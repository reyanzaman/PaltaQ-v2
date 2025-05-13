import { NextApiResponse } from 'next';

// Helper to parse cookies
function parseCookies(header: string | null): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;

  header.split(';').forEach(cookie => {
    const [key, value] = cookie.trim().split('=');
    if (key && value) cookies[key] = decodeURIComponent(value);
  });
  return cookies;
}

const RATE_LIMIT_MS = 30 * 60 * 1000; // 30 minutes

async function postHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'POST') {
      try {
        // Check for rate limiting
        const cookies = parseCookies(req.headers.get('cookie'));
        const now = Date.now();
        const lastTime = parseInt(cookies['last_request_time'] || '0');

        if (lastTime && now - lastTime < RATE_LIMIT_MS) {
          const remaining = RATE_LIMIT_MS - (now - lastTime);
          const minutes = Math.floor(remaining / 60000);
          const seconds = Math.floor((remaining % 60000) / 1000)
          return new Response(JSON.stringify({ message: 'AI Response Successful', improvement_suggestion: `You have exceeded your AI Quota. Please wait before submitting another request try again in ${minutes}m ${seconds}s.` }), {
            status: 200,
          })
        }

        // Extract question data from the request body
        const { question } = await req.json();
  
        // Llama-3
        const baseUrl = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'
        const llama_response3 = await fetch(`${baseUrl}/api/groq?question=${question}&version=3`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          }
        });
  
        let improvement_suggestion = await llama_response3.json();
  
        // Capitalize the first letter of improvement_suggestion
        if (improvement_suggestion) {
          improvement_suggestion = improvement_suggestion.charAt(0).toUpperCase() + improvement_suggestion.slice(1);
        } else {
          improvement_suggestion = ''; // Handle case where there's no improvement suggestion
        }
  
        console.log({ improvement_suggestion });

        let improvement_message = '';
  
        // Return success response
        if (improvement_suggestion === '') {
          improvement_message = 'No improvement suggestions';
        } else {
          improvement_message = `AI Response Successful`;
        }

        // Set the last request time cookie
        const responseHeaders = new Headers({
          'Set-Cookie': `last_request_time=${now}; Path=/; Max-Age=${RATE_LIMIT_MS / 1000}; HttpOnly`,
          'Content-Type': 'application/json',
        });

        return new Response(JSON.stringify({ message: improvement_message, improvement_suggestion }), {
          status: 200,
          headers: responseHeaders,
        })
  
      } catch (error) {
        console.error('Failed to get AI response:', error);
        return new Response(JSON.stringify({ error: 'Failed to get AI response' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
  
    } else {
      // Return error for unsupported methods
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }

  export { postHandler as POST };