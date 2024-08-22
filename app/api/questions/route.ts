import { NextApiResponse } from 'next';
import prisma from '@/app/lib/prisma';

import { validateQuestion, scoreQuestion, updateRank } from '@/app/utils/questionUtils'; // Import your validation and scoring functions
import { submitQuestionToDatabase, submitPaltaQToDatabase } from '@/app/utils/postUtils'; // Import your function to submit the question to the database
import { getToken } from 'next-auth/jwt';
import { getUserIDFromDatabase } from '@/app/utils/getUtils';
import { QuestionCategory } from '@/app/utils/postUtils';

const secret = process.env.SECRET;

export async function getHandler(req: Request, res: NextApiResponse) {
  if (req.method === 'GET') {
    const url = req?.url ? new URL(req.url) : null;
    const cid = url?.searchParams.get('cid');
    const tid = url?.searchParams.get('tid');

    try {
      if (cid && tid) {
        const questions = await prisma.question.findMany({
          where: {
            classId: cid,
            topicId: tid,
          },
          include: {
            user: true,
            likedBy: true,
            dislikedBy: true,
            paltaQBy: {
              select: {
                id: true,
                userId: true,
                user: true,
                paltaQ: true,
                questionId: true,
                parentId: true,
                score: true,
                likes: true,
                dislikes: true,
                likedBy: true,
                dislikedBy: true,
                isAnonymous: true,
                createdAt: true,
                parent: true,
                replies: true,
              }
            },
            topic: true,
          }
        });
        // Calculate replies length for each paltaQBy and set replies to undefined
        questions.forEach(question => {
          question.paltaQBy.forEach(paltaQBy => {
            (paltaQBy as any).repliesLength = paltaQBy.replies.length;
            (paltaQBy as any).replies = undefined; // Set replies to undefined
          });
        });
        return new Response(JSON.stringify(questions), {
          status: 200,
        })
      } else if (cid) {
        const questions = await prisma.question.findMany({
          where: {
            classId: cid,
          },
          include: {
            user: true,
            topic: true,
            likedBy: true,
            dislikedBy: true,
            paltaQBy: {
              select: {
                id: true,
                userId: true,
                user: true,
                paltaQ: true,
                questionId: true,
                parentId: true,
                score: true,
                likes: true,
                dislikes: true,
                likedBy: true,
                dislikedBy: true,
                isAnonymous: true,
                createdAt: true,
                parent: true,
                replies: true,
              }
            },
            questionType: true
          }
        }
        );
        // Calculate replies length for each paltaQBy and set replies to undefined
        questions.forEach(question => {
          question.paltaQBy.forEach(paltaQBy => {
            (paltaQBy as any).repliesLength = paltaQBy.replies.length;
            (paltaQBy as any).replies = undefined; // Set replies to undefined
          });
        });
        return new Response(JSON.stringify(questions), {
          status: 200,
        })
      }
    } catch (error) {
      console.error('Failed to get question:', error);
      return new Response(JSON.stringify({ error: 'Failed to get question' }), {
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

async function postHandler(req: Request, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Get the session
      const token = await getToken({ req: req as any, secret });

      // Extract question data from the request body
      const { isAnonymous, category } = await req.json();

      const url = req?.url ? new URL(req.url) : null;
      const cid = url?.searchParams.get('cid') || '';
      const tid = url?.searchParams.get('tid') || '';
      let question = url?.searchParams.get('question') || '';
      const qid = url?.searchParams.get('qid') || '';
      const Mqid = url?.searchParams.get('Mqid') || '';
      const tname = url?.searchParams.get('tname') || '';

      question = question.trim();
      question = question.charAt(0).toUpperCase() + question.slice(1);

      let userId = "";

      // Check if the user is authenticated
      if (!token) {
        console.log("User not authenticated");
      } else {
        // Extract user email from the token
        const userEmail = token?.email;
        userId = await getUserIDFromDatabase(userEmail ?? '');
      }

      // Validate the question
      const validText = await validateQuestion(question, category, tid, cid);

      if (validText !== "Question validated") {
        return new Response(JSON.stringify({ message: `${validText}` }), {
          status: 400,
        })
      }

      // Llama-3
      const baseUrl = process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'

      // Check if the question is valid
      const llama_response = await fetch(`${baseUrl}/api/groq?question=${question}&version=1`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
      });

      // Check if the question is off-topic
      const llama_response4 = await fetch(`${baseUrl}/api/groq?question=${question}&version=4&topic=${tname}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
      });

      const data = await llama_response.json();
      const is_valid_question = data.toLowerCase();
      const is_validTopic = await llama_response4.json();

      if (is_validTopic.includes("no")) {
        return new Response(JSON.stringify({ message: `Question is off-topic`, improvement_suggestion: 'Our system has detected that your question does not match the selected classroom topic. Please try asking a question that is relevant to the topic.' }), {
          status: 400,
        })
      }

      if (is_valid_question.includes("no")) {
        return new Response(JSON.stringify({ message: `Try asking a better question` }), {
          status: 400,
        })
      }

      // Score the question using Llama-3
      const llama_response2 = await fetch(`${baseUrl}/api/groq?question=${question}&version=2`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
      });

      const llama_score = parseInt(await llama_response2.json(), 10);

      console.log({ is_valid_question, is_validTopic, llama_score });

      // Score the question
      const { score, quban_score, foundKeywords } = await scoreQuestion(question, llama_score);

      // Submit the question to the database
      if (category === QuestionCategory.Topic) {
        await submitQuestionToDatabase(
          userId,
          question,
          score,
          quban_score,
          llama_score,
          category,
          tid,
          cid,
          isAnonymous,
          foundKeywords,
          'topic'
        );
      } else if (category === QuestionCategory.Palta) {
        await submitPaltaQToDatabase(
          userId,
          question,
          qid,
          '',
          cid,
          score,
          quban_score,
          llama_score,
          isAnonymous,
          foundKeywords,
          'topic'
        );
      } else if (category === QuestionCategory.PaltaPalta) {
        await submitPaltaQToDatabase(
          userId,
          question,
          qid,
          Mqid,
          cid,
          score,
          quban_score,
          llama_score,
          isAnonymous,
          foundKeywords,
          'paltapalta'
        );
      }

      const status = await updateRank(userId, cid);

      // Return success response
      return new Response(JSON.stringify({ message: `${score} Points Awarded!|${status}` }), {
        status: 200,
      })

    } catch (error) {
      console.error('Failed to submit question:', error);
      return new Response(JSON.stringify({ error: 'Failed to submit question' }), {
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

export { getHandler as GET };
export { postHandler as POST };