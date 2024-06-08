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