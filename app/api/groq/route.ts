import { NextApiResponse } from 'next';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getGroqChatCompletion(question: string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `'${question}' Is this a question? Score the question according to bloom's taxonomy out of 150. ONLY reply with yes or no followed by an underscore and the score. For example, yes_100.`,
      },
    ],
    model: "llama3-8b-8192",
  });
}

export async function getGroqChatCompletion2(question: string) {
    return groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `'${question}' Suggest how to improve the question. Keep the response short. DO NOT suggest rephrased or alternate versions of the question. DO NOT GIVE EXAMPLES.`,
        },
      ],
      model: "llama3-8b-8192",
    });
  }

export async function postHandler(req: Request, res: NextApiResponse) {
    if (req.method === 'POST') {
        const url = req?.url ? new URL(req.url) : null;
        const question = url?.searchParams.get('question');
        const version = url?.searchParams.get('version');

        try {

            if (!question || !version) {
                return new Response(JSON.stringify({ error: 'No data provided' }), {
                    status: 400,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            }

            let response;
            
            if (version == '1') {
                response = await getGroqChatCompletion(question);
            } else if (version == '2') {
                response = await getGroqChatCompletion2(question);
            }

            console.log(response);

            return new Response(JSON.stringify(response?.choices[0]?.message?.content || "No response"), {
                status: 200,
            });
        } catch (error) {
            console.error('Failed to get response:', error);
            return new Response(JSON.stringify({ error: 'Failed to get response' }), {
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