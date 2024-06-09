import { NextApiResponse } from 'next';
import { validateQuestion, scoreQuestion } from '@/app/utils/questionUtils'; // Import your validation and scoring functions
import { submitQuestionToDatabase } from '@/app/utils/postUtils'; // Import your function to submit the question to the database
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
      const { question } = await req.json();
      console.log("Question: ", question);

      let userId = "";

      // Check if the user is authenticated
      if (!token) {
        console.log("Guest User Detected");
      } else {
        // Extract user email from the token
        const userEmail = token?.email;
        console.log("Authenticated User:", userEmail);

        userId = await getUserIDFromDatabase(userEmail ?? '');
        console.log("User ID: ", userId)
      }

      // Validate the question
      const validText = await validateQuestion(question, QuestionCategory.General, '24acf3e5-9d5a-4b62-8eb7-c9ce0dfaaf5b', 'dc29b163-38b9-48d6-ba4a-59fe07f4b7f5');

      if (validText !== "Question validated") {
        return new Response("", {
          status: 400,
          statusText: validText
        })
      }

      // Score the question
      const score = await scoreQuestion(question);

      // Submit the question to the database
      if (userId === "") {
        await submitQuestionToDatabase(
          '2940290a-b299-4dba-8d2a-7510d5674625',
          question, 
          score, 
          QuestionCategory.General, 
          '24acf3e5-9d5a-4b62-8eb7-c9ce0dfaaf5b', 
          'dc29b163-38b9-48d6-ba4a-59fe07f4b7f5',
          true
        );
      } else {
        await submitQuestionToDatabase(
          userId,
          question, 
          score, 
          QuestionCategory.General,
          '24acf3e5-9d5a-4b62-8eb7-c9ce0dfaaf5b', 
          'dc29b163-38b9-48d6-ba4a-59fe07f4b7f5',
          false
        );
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