import prisma from '@/app/lib/prisma';

export enum QuestionCategory {
  General = 'General',
  Topic = 'Topic',
  Palta = 'Palta'
}

export async function submitQuestionToDatabase(userId: string, question: string, score: number, category: QuestionCategory, topicId: string, classId: string, isAnonymous: boolean): Promise<void> {
    try {
        // Insert the question into the database using Prisma
        await prisma.question.create({
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
    
        console.log('Question submitted to database:', question);
        console.log('Score:', score);
    } catch (error) {
      // Handle database error
      console.error('Failed to submit question to database:', error);
      throw new Error('Failed to submit question to database');
    }
}

export async function submitPaltaQToDatabase(userId: string, question: string, questionId: string, score: number, isAnonymous: boolean): Promise<void> {
  try {
      // Insert the question into the database using Prisma
      await prisma.paltaQ.create({
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
  
      console.log('Question submitted to database:', question);
      console.log('Score:', score);
  } catch (error) {
    // Handle database error
    console.error('Failed to submit question to database:', error);
    throw new Error('Failed to submit question to database');
  }
}