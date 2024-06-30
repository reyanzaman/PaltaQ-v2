import prisma from '@/app/lib/prisma';
import { uid, cid } from '@/app/api/submitGenQuestion/route';

export enum QuestionCategory {
  General = 'General',
  Topic = 'Topic',
  Palta = 'Palta',
  PaltaPalta = 'PaltaPalta',
}

export async function submitQuestionToDatabase(userId: string, question: string, score: number, category: QuestionCategory, topicId: string, classId: string, isAnonymous: boolean, foundKeywords: { [key: string]: boolean }, from: string = "general"): Promise<void> {
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

    let scoreToUpdate = 0;

    // if (from === "general") {
    //   if (score <= 50) {
    //     scoreToUpdate = 2;
    //   } else if (score <= 100) {
    //     scoreToUpdate = 5;
    //   } else if (score <= 150) {
    //     scoreToUpdate = 10;
    //   }
    // } else {
    //   scoreToUpdate = score;
    // }

    scoreToUpdate = score;

    await prisma.userDetails.update({
      where: {
        userId: userId,
      },
      data: {
        questionsAsked: {
          increment: 1,
        },
        totalScore: {
          increment: scoreToUpdate,
        },
      },
    });

    if (category !== QuestionCategory.General) {
      await prisma.classEnrollment.update({
        where: {
          userId_classId: {
            userId: userId,
            classId: classId,
          },
        },
        data: {
          questionCount: {
            increment: 1,
          },
          score: {
            increment: scoreToUpdate,
          },
        },
      });
    }

  } catch (error) {
    // Handle database error
    console.error('Failed to submit question to database:', error);
    throw new Error('Failed to submit question to database');
  }
}

export async function submitPaltaQToDatabase(userId: string, question: string, questionId: string, paltaQId: string = '', classId: string, score: number, isAnonymous: boolean, foundKeywords: { [key: string]: boolean }, from: string = "general"): Promise<void> {
  try {

    // Insert the question into the database using Prisma
    let createdQuestion;

    if (from === "paltapalta") {

      createdQuestion = await prisma.paltaQ.create({
        data: {
          userId: userId,
          paltaQ: question,
          parentId: questionId,
          mainQuestionID: paltaQId,
          score: score,
          isAnonymous: isAnonymous,
        },
      });

      // Increment the palta question count in the question record
      await prisma.question.update({
        where: {
          id: paltaQId as string,
        },
        data: {
          paltaQ: {
            increment: 1, // Increment the paltaQ count by 1
          },
        },
      });

    } else {

      createdQuestion = await prisma.paltaQ.create({
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

    }

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

    let scoreToUpdate = 0;

    scoreToUpdate = score + (0.1 * score);

    await prisma.userDetails.update({
      where: {
        userId: userId,
      },
      data: {
        paltaQAsked: {
          increment: 1,
        },
        totalScore: {
          increment: scoreToUpdate,
        },
      },
    });

    if (from !== "general" && from !== "paltapalta") {
      await prisma.classEnrollment.update({
        where: {
          userId_classId: {
            userId: userId,
            classId: classId,
          },
        },
        data: {
          paltaQCount: {
            increment: 1,
          },
          score: {
            increment: scoreToUpdate,
          },
        },
      });
    }

    if (from === "general") {
      await prisma.classEnrollment.update({
        where: {
          userId_classId: {
            userId: uid,
            classId: cid,
          },
        },
        data: {
          paltaQCount: {
            increment: 1,
          },
          score: {
            increment: scoreToUpdate,
          },
        },
      });
    }

  } catch (error) {
    // Handle database error
    console.error('Failed to submit paltaQ to database:', error);
    throw new Error('Failed to submit paltaQ to database');
  }
}