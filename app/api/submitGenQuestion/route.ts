import { NextApiResponse } from 'next';
import { validateQuestion, scoreQuestion, updateRank } from '@/app/utils/questionUtils';
import { submitQuestionToDatabase, submitPaltaQToDatabase } from '@/app/utils/postUtils';
import { getToken } from 'next-auth/jwt';
import { getUserIDFromDatabase } from '@/app/utils/getUtils';
import { QuestionCategory } from '@/app/utils/postUtils';

const secret = process.env.SECRET;

// General Class ID
export const cid = 'ae9b5c88-e98e-4774-a606-790f71947591';
// General Topic ID
export const tid = 'e1566b05-fef2-4958-885b-2808695b7ba7';
// Guest User ID
export const uid = '03277337-f5ae-42c4-985c-4e35e64b3fc3';

async function postHandler(req: Request, res: NextApiResponse) {
  if (req.method === 'POST') {

    try {
      // Get the session
      const token = await getToken({ req: req as any, secret });

      // Extract question data from the request body
      const { question, category, quesID, paltaQuesID, anonymity } = await req.json();

      let processed_question = question.trim();
      processed_question =
        processed_question.charAt(0).toUpperCase() +
        processed_question.slice(1);

      let userId = "";

      // Check if the user is authenticated
      if (!token) {
        console.log("Guest User Detected");
      } else {
        // Extract user email from the token
        const userEmail = token?.email;
        userId = await getUserIDFromDatabase(userEmail ?? '');
      }

      // =========================================
      // TEMPORARILY DISABLED VALIDATION
      // =========================================

      /*
      const validText = await validateQuestion(
        processed_question,
        category,
        tid,
        cid
      );

      if (validText !== "Question validated") {
        return new Response(JSON.stringify({ message: `${validText}` }), {
          status: 400,
        });
      }
      */

      // =========================================
      // LLAMA-3 CHECKING + SCORING
      // =========================================

      const baseUrl = process.env.VERCEL_URL
        ? 'https://' + process.env.VERCEL_URL
        : 'http://localhost:3000';

      const llama_response = await fetch(
        `${baseUrl}/api/groq?question=${processed_question}&version=1`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const llama_response2 = await fetch(
        `${baseUrl}/api/groq?question=${processed_question}&version=2`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await llama_response.json();
      const is_valid_question = data.toLowerCase();

      let llama_score = parseInt(await llama_response2.json(), 10);

      while (Number.isNaN(llama_score)) {
        const retry_response = await fetch(
          `${baseUrl}/api/groq?question=${processed_question}&version=2`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );

        llama_score = parseInt(await retry_response.json(), 10);
      }

      console.log({ is_valid_question, llama_score });

      // =========================================
      // TEMPORARILY DISABLED QUESTION REJECTION
      // =========================================

      /*
      if (is_valid_question.includes("no")) {
        return new Response(
          JSON.stringify({ error: `Try asking a better question` }),
          {
            status: 400,
          }
        );
      }
      */

      // =========================================
      // SCORE QUESTION
      // =========================================

      const { score, quban_score, foundKeywords } =
        await scoreQuestion(processed_question, llama_score);

      // =========================================
      // SUBMIT QUESTION
      // =========================================

      if (category === QuestionCategory.General) {

        if (userId === "") {

          await submitQuestionToDatabase(
            uid,
            processed_question,
            score,
            quban_score,
            llama_score,
            category,
            tid,
            cid,
            true,
            foundKeywords
          );

        } else {

          await submitQuestionToDatabase(
            userId,
            processed_question,
            score,
            quban_score,
            llama_score,
            category,
            tid,
            cid,
            anonymity,
            foundKeywords
          );

        }

      } else if (category === QuestionCategory.Palta) {

        if (userId === "") {

          await submitPaltaQToDatabase(
            uid,
            processed_question,
            quesID,
            '',
            cid,
            score,
            quban_score,
            llama_score,
            true,
            foundKeywords
          );

        } else {

          await submitPaltaQToDatabase(
            userId,
            processed_question,
            quesID,
            '',
            cid,
            score,
            quban_score,
            llama_score,
            anonymity,
            foundKeywords
          );

        }

      } else if (category === QuestionCategory.PaltaPalta) {

        if (userId === "" && paltaQuesID) {

          await submitPaltaQToDatabase(
            uid,
            processed_question,
            quesID,
            paltaQuesID,
            cid,
            score,
            quban_score,
            llama_score,
            true,
            foundKeywords,
            'paltapalta'
          );

        } else {

          await submitPaltaQToDatabase(
            userId,
            processed_question,
            quesID,
            paltaQuesID,
            cid,
            score,
            quban_score,
            llama_score,
            anonymity,
            foundKeywords,
            'paltapalta'
          );

        }
      }

      // =========================================
      // SUCCESS RESPONSE
      // =========================================

      return new Response(
        JSON.stringify({ message: `${score} Points Awarded!` }),
        {
          status: 200,
        }
      );

    } catch (error) {

      console.error('Failed to submit question:', error);

      return new Response(
        JSON.stringify({ error: 'Failed to submit question' }),
        {
          status: 500,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

  } else {

    // Return error for unsupported methods
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

export { postHandler as POST };