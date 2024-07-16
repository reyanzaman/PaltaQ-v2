import { NextApiResponse } from 'next';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getGroqChatCompletion(question: string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `'${question}' Is the following text a question? Only reply with 'yes' or 'no'`,
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
          content: `'${question}' Strictly score the question out of 150, strictly adhering to the full range. Only give me the score. For example: 50`,
        },
      ],
      model: "llama3-8b-8192",
    });
  }

  export async function getGroqChatCompletion3(question: string) {
    return groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `'${question}' Give tips to improve the question without using bullet points. Keep the response limited to 2 short sentences. DO NOT suggest rephrased questions or give examples.`,
        },
      ],
      model: "llama3-8b-8192",
    });
  }

  export async function getGroqChatCompletion4(question: string, topic: string) {
    return groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `'${question}' Does this question clearly belong to the topic '${topic}'? Only reply with 'yes' or 'no'`,
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
        const topic = url?.searchParams.get('topic') || '';

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
            } else if (version == '3') {
                response = await getGroqChatCompletion3(question);
            } else if (version == '4') {
                response = await getGroqChatCompletion4(question, topic);
            }

            console.log("Tokens Used:", response?.usage?.total_tokens);

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