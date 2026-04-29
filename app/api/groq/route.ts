import { NextApiResponse } from 'next';
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Verify if the text is a question
export async function getGroqChatCompletion1(question: string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Leniently check if this is a proper question? Reply with only 'yes' or 'no'. Here is the question: '${question}'`,
      },
    ],
    model: "llama-3.1-8b-instant",
  });
}

// Scoring
export async function getGroqChatCompletion2(question: string) {
    return groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Score the question from 0 to 150, ensuring that low-level or low IQ questions receive below 50, mid-level or moderate questions between 50 to 100, and high-level and intelligent questions between 100 to 150. Only give me the score. For example: 50. Here is the question: '${question}'`,
        },
      ],
      model: "llama-3.1-8b-instant",
    });
  }

  // Suggestions
  export async function getGroqChatCompletion3(question: string) {
    return groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `For this question, please give tips on how to improve the question while keeping the response limited to 2 short sentences. DO NOT directly provide an improved question or suggestion an improved version. NEVER give the answer. NEVER provide an example. Here is the question: '${question}'`,
        },
      ],
      model: "llama-3.1-8b-instant",
    });
  }

  // Topic Detection
  export async function getGroqChatCompletion4(question: string, topic: string) {
    return groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `Leniently check if this question belong to the '${topic}' topic. Only reply with 'yes' or 'no'. Here is the question: '${question}'`,
        },
      ],
      model: "llama-3.1-8b-instant",
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
                response = await getGroqChatCompletion1(question);
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