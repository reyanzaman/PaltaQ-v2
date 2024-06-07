import { NextApiRequest, NextApiResponse } from 'next';
import { validateQuestion, scoreQuestion } from '@/app/utils/questionUtils'; // Import your validation and scoring functions
import { submitQuestionToDatabase } from '@/app/utils/databaseUtils'; // Import your function to submit the question to the database
import { getToken } from 'next-auth/jwt';
import { getUserIDFromDatabase } from '@/app/utils/userUtils';

const secret = process.env.SECRET;

async function postHandler(req: Request, res: NextApiResponse) {
  if (req.method === 'POST') {

    try {
      // Get the session
      const token = await getToken({ req, secret });

      // Extract question data from the request body
      const { question } = await req.json();
      console.log("Question: ", question);

      // Validate the question
      const isValid = await validateQuestion(question);

      if (!isValid) {
        return new Response("",{
          status: 400,
          statusText: "Invalid Question!"
        })
      }

      // Score the question
      const score = await scoreQuestion(question);

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

      // Submit the question to the database
      await submitQuestionToDatabase(userId, question, score);

      // Return success response
      return new Response("",{
        status: 200,
        statusText: "Question successfully recorded"
      })

    } catch (error) {
      console.error('Failed to submit question:', error);
      return res.status(500).json({ error: 'Failed to submit question' });
    }

  } else {
    // Return error for unsupported methods
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

export { postHandler as POST };