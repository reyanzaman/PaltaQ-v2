import { NextApiResponse } from 'next';
import { env } from 'process';

async function query(data: any) {
    const response = await fetch(
        "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B",
        {
            headers: {
                Authorization: `Bearer ${env.HUGGINGFACE_API_KEY}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify(data),
        }
    );
    const result = await response.json();
    return result;
}

async function postHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'POST') {
        // Get data from the request body
        const data = req.body;
        let responseText = null;

        console.log("Token", env.HUGGINGFACE_API_KEY);
        console.log("Data", data);

        try {
            if (!data) {
                throw new Error('No data provided');
            }
            
            query({ "inputs": data }).then((response) => {
                console.log(JSON.stringify(response));
                responseText = response;
            });

            // Return the response
            return new Response(JSON.stringify({ message: responseText }), {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Failed to get AI response:', error);
            return new Response(JSON.stringify({ error: 'Failed to get response from HuggingFace' }), {
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