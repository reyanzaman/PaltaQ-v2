import prisma from '@/app/lib/prisma';

export enum QuestionCategory {
  General = 'General',
  Topic = 'Topic',
  Palta = 'Palta'
}

export async function submitQuestionToDatabase(userId: string, question: string, score: number, category: QuestionCategory, topicId: string, classId: string, isAnonymous: boolean, foundKeywords: { [key: string]: boolean }): Promise<void> {
    try {
        // Insert the question into the database using Prisma
        const createdQuestion = await prisma.question.create({
            data: {
              userId: userId,
              question: question,
              score: score,
              category: category,
              isAnonymous: isAnonymous,
              topicId: topicId,
              classId: classId
            },
        });

        // Create QuestionType entry based on foundKeywords
        await prisma.questionType.create({
          data: {
            questionId: createdQuestion.id,
            remembering: foundKeywords.bloom_remembering ?? false,
            understanding: foundKeywords.bloom_understanding ?? false,
            applying: foundKeywords.bloom_applying ?? false,
            analyzing: foundKeywords.bloom_analyzing ?? false,
            evaluating: foundKeywords.bloom_evaluating ?? false,
            creating: foundKeywords.bloom_creating ?? false
          },
        });

    } catch (error) {
      // Handle database error
      console.error('Failed to submit question to database:', error);
      throw new Error('Failed to submit question to database');
    }
}

export async function submitPaltaQToDatabase(userId: string, question: string, questionId: string, score: number, isAnonymous: boolean, foundKeywords: { [key: string]: boolean }): Promise<void> {
  try {
      // Insert the question into the database using Prisma
      const createdQuestion = await prisma.paltaQ.create({
          data: {
            userId: userId,
            paltaQ: question,
            questionId: questionId,
            score: score,
            isAnonymous: isAnonymous,
          },
      });

      // Increment the palta question count in the question record
      await prisma.question.update({
        where: {
            id: questionId as string,
        },
        data: {
            paltaQ: {
                increment: 1, // Increment the paltaQ count by 1
            },
        },
      });

      // Create QuestionType entry based on foundKeywords
      await prisma.questionType.create({
        data: {
          paltaQId: createdQuestion.id,
          remembering: foundKeywords.bloom_remembering ?? false,
          understanding: foundKeywords.bloom_understanding ?? false,
          applying: foundKeywords.bloom_applying ?? false,
          analyzing: foundKeywords.bloom_analyzing ?? false,
          evaluating: foundKeywords.bloom_evaluating ?? false,
          creating: foundKeywords.bloom_creating ?? false
        },
      });

  } catch (error) {
    // Handle database error
    console.error('Failed to submit question to database:', error);
    throw new Error('Failed to submit question to database');
  }
}