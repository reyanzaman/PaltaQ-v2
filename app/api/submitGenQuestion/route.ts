import { NextApiResponse } from 'next';
import { validateQuestion, scoreQuestion, updateRank } from '@/app/utils/questionUtils'; // Import your validation and scoring functions
import { submitQuestionToDatabase, submitPaltaQToDatabase } from '@/app/utils/postUtils'; // Import your function to submit the question to the database
import { getToken } from 'next-auth/jwt';
import { getUserIDFromDatabase } from '@/app/utils/getUtils';
import { QuestionCategory } from '@/app/utils/postUtils';

const secret = process.env.SECRET;

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
      const validText = await validateQuestion(question, category, 'd732b110-22e2-4872-9cbb-47a4c695bdd0', '4267e78d-b166-4524-a1c2-7d32c2351283');

      if (validText !== "Question validated") {
        return new Response("", {
          status: 400,
          statusText: validText
        })
      }

      // Score the question
      const { score, foundKeywords } = await scoreQuestion(question);

      // Submit the question to the database
      if (category === QuestionCategory.General) {
        if (userId === "") {
          await submitQuestionToDatabase(
            '61740114-1ec2-4fad-90e8-8e16634954bb',
            question,
            score,
            category,
            'd732b110-22e2-4872-9cbb-47a4c695bdd0',
            '4267e78d-b166-4524-a1c2-7d32c2351283',
            true,
            foundKeywords
          );
        } else {
          await submitQuestionToDatabase(
            userId,
            question,
            score,
            category,
            'd732b110-22e2-4872-9cbb-47a4c695bdd0',
            '4267e78d-b166-4524-a1c2-7d32c2351283',
            false,
            foundKeywords
          );
        }
      } else if (category === QuestionCategory.Palta) {
        if (userId === "") {
          await submitPaltaQToDatabase(
            '61740114-1ec2-4fad-90e8-8e16634954bb',
            question,
            quesID,
            score,
            true,
            foundKeywords
          );
        } else {
          await submitPaltaQToDatabase(
            userId,
            question,
            quesID,
            score,
            false,
            foundKeywords
          );
        }
      }

      if (userId !== "") {
        const status = await updateRank(userId);
        // Return success response
        return new Response('', {
          status: 200,
          statusText: `${score} Points Awarded!|${status}`,
        })
      }

      // Return success response
      return new Response('', {
        status: 200,
        statusText: `${score} Points Awarded!`
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