import { NextApiResponse } from 'next';
import { validateQuestion, scoreQuestion } from '@/app/utils/questionUtils'; // Import your validation and scoring functions
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
      const validText = await validateQuestion(question, category, '24acf3e5-9d5a-4b62-8eb7-c9ce0dfaaf5b', 'dc29b163-38b9-48d6-ba4a-59fe07f4b7f5');

      if (validText !== "Question validated") {
        return new Response("", {
          status: 400,
          statusText: validText
        })
      }

      // Score the question
      const { score, foundKeywords } = await scoreQuestion(question);

      // Submit the question to the database
      if(category === QuestionCategory.General){
        if (userId === "") {
          await submitQuestionToDatabase(
            '2940290a-b299-4dba-8d2a-7510d5674625',
            question, 
            score, 
            category, 
            '24acf3e5-9d5a-4b62-8eb7-c9ce0dfaaf5b', 
            'dc29b163-38b9-48d6-ba4a-59fe07f4b7f5',
            true,
            foundKeywords
          );
        } else {
          await submitQuestionToDatabase(
            userId,
            question, 
            score, 
            category,
            '24acf3e5-9d5a-4b62-8eb7-c9ce0dfaaf5b', 
            'dc29b163-38b9-48d6-ba4a-59fe07f4b7f5',
            false,
            foundKeywords
          );
        }
      } else if (category === QuestionCategory.Palta) {
        if (userId === "") {
          await submitPaltaQToDatabase(
            '2940290a-b299-4dba-8d2a-7510d5674625',
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

      // Return success response
      return new Response("", {
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