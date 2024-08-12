import { NextApiResponse } from 'next';

async function postHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'POST') {
      try {
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
        return new Response(JSON.stringify({ message: improvement_message, improvement_suggestion }), {
          status: 200,
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