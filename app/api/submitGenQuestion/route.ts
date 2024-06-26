import { NextApiResponse } from 'next';
import { validateQuestion, scoreQuestion, updateRank } from '@/app/utils/questionUtils'; // Import your validation and scoring functions
import { submitQuestionToDatabase, submitPaltaQToDatabase } from '@/app/utils/postUtils'; // Import your function to submit the question to the database
import { getToken } from 'next-auth/jwt';
import { getUserIDFromDatabase } from '@/app/utils/getUtils';
import { QuestionCategory } from '@/app/utils/postUtils';

const secret = process.env.SECRET;

// General Class ID
export const cid = 'ae9b5c88-e98e-4774-a606-790f71947591';
// General Topic ID
export const tid = 'e1566b05-fef2-4958-885b-2808695b7ba7';
// Guest User ID
export const uid = '03277337-f5ae-42c4-985c-4e35e64b3fc3'

async function postHandler(req: Request, res: NextApiResponse) {
  if (req.method === 'POST') {

    try {
      // Get the session
      const token = await getToken({ req: req as any, secret });

      // Extract question data from the request body
      const { question, category, quesID } = await req.json();

      let userId = "";

      // Check if the user is authenticated
      if (!token) {
        console.log("Guest User Detected");
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

      // Score the question
      const { score, foundKeywords } = await scoreQuestion(question);

      // Submit the question to the database
      if (category === QuestionCategory.General) {
        if (userId === "") {
          await submitQuestionToDatabase(
            uid,
            question,
            score,
            category,
            tid,
            cid,
            true,
            foundKeywords
          );
        } else {
          await submitQuestionToDatabase(
            userId,
            question,
            score,
            category,
            tid,
            cid,
            false,
            foundKeywords
          );
        }
      } else if (category === QuestionCategory.Palta) {
        if (userId === "") {
          await submitPaltaQToDatabase(
            uid,
            question,
            quesID,
            cid,
            score,
            true,
            foundKeywords
          );
        } else {
          await submitPaltaQToDatabase(
            userId,
            question,
            quesID,
            cid,
            score,
            false,
            foundKeywords
          );
        }
      }

      // if (userId !== "") {
      //   const status = await updateRank(userId, cid);
      //   // Return success response
      //   return new Response('', {
      //     status: 200,
      //     statusText: `${score} Points Awarded!|${status}`,
      //   })
      // }

      // Return success response
      return new Response(JSON.stringify({ message: `${score} Points Awarded!` }), {
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

export { postHandler as POST };