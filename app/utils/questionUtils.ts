import prisma from '@/app/lib/prisma';
import { QuestionCategory } from '@/app/utils/postUtils';
import {
  bloom_remembering,
  bloom_analyzing,
  bloom_applying,
  bloom_creating,
  bloom_evaluating,
  bloom_understanding
} from '@/app/utils/taxonomy';

export async function validateQuestion(question: string, category: QuestionCategory, topicID: string, classID: string): Promise<string> {
  try {
    if (!question) {
      return "Invalid question";
    }

    question = question.toLowerCase().trim();

    if (!question.endsWith('?')) {
      return "Question must end with a question mark";
    }

    const validStartWords = [
      'what', 'why', 'when', 'how', 'where', 'who', 'which', 'whom',
      'whose', 'is', 'are', 'do', 'does', 'can', 'could', 'will',
      'would', 'should', 'shall', 'may', 'might', 'must', 'have',
      'has', 'had', 'am', 'was', 'were'
    ];

    if (!validStartWords.some(word => question.startsWith(word))) {
      return "Invalid question format";
    }

    const englishRegex = /^[a-zA-Z0-9?.,'"\/\s@\-!#$%^&*()+={}\[\]\\|;:'"<>\?]+$/;

    if (!englishRegex.test(question)) {
      return "Invalid characters in question";
    }

    // Check for compound questions
    const segments = question.split('?').filter(segment => segment.trim().length > 0);
    if (segments.length > 1) {
      return "Compound questions not allowed";
    }

    // Check if there are any existing questions for the same topic, class, and category
    const existingQuestions = await prisma.question.findMany({
      where: {
        topicId: topicID,
        classId: classID,
      }
    });

    const existingPaltaQs = await prisma.paltaQ.findMany({
      where: {
        OR: [
          {
            question: {
              topicId: topicID,
              classId: classID,
            }
          },
          {
            parentMQ: {
              topicId: topicID,
              classId: classID,
            }
          }
        ]
      }
    });

    // If no existing questions and no PaltaQ comments, skip similarity check
    if (existingQuestions.length === 0 && existingPaltaQs.length === 0) {
      return "Question validated";
    }

    // Check if a similar question exists in the same category using cosine similarity
    const similarityThreshold = 0.7;

    // Iterate through existing questions and calculate cosine similarity
    for (const existingQuestion of existingQuestions) {
      const similarity = CosineSimilarity(question, existingQuestion.question);

      if (similarity >= similarityThreshold) {
        console.log('Similar question found:', existingQuestion.question);
        return "Similar question exists";
      }
    }
    
    // Check similarity in existing PaltaQ comments
    for (const existingPaltaQ of existingPaltaQs) {
      const similarity = CosineSimilarity(question, existingPaltaQ.paltaQ);

      if (similarity >= similarityThreshold) {
        console.log('Similar PaltaQ found:', existingPaltaQ.paltaQ);
        return "Similar question exists in PaltaQ";
      }
    }

    console.log('Question validation complete');
    return "Question validated";
  } catch (error) {
    // Handle database error
    console.error('Failed to validate question', error);
    return "Question validation failed";
  }
}

function CosineSimilarity(question: string, question1: string): number {
  // Step 1: Tokenize the strings
  const tokens1 = question.toLowerCase().split(/\W+/).filter(token => token.length > 0);
  const tokens2 = question1.toLowerCase().split(/\W+/).filter(token => token.length > 0);

  // Step 2: Create a frequency vector for each string
  const vector1 = tokensToVector(tokens1);
  const vector2 = tokensToVector(tokens2);

  // Step 3: Compute the dot product
  let dotProduct = 0;
  for (const token in vector1) {
      if (vector2[token]) {
          dotProduct += vector1[token] * vector2[token];
      }
  }

  // Step 4: Compute the magnitudes
  const magnitude1 = Math.sqrt(Object.values(vector1).reduce((acc, val) => acc + val * val, 0));
  const magnitude2 = Math.sqrt(Object.values(vector2).reduce((acc, val) => acc + val * val, 0));

  // Step 5: Compute the cosine similarity
  const similarity = dotProduct / (magnitude1 * magnitude2);

  return similarity;
}

// Helper function to convert tokens to a frequency vector
function tokensToVector(tokens: string[]): { [key: string]: number } {
  const vector: { [key: string]: number } = {};
  tokens.forEach(token => {
      if (vector[token]) {
          vector[token]++;
      } else {
          vector[token] = 1;
      }
  });
  return vector;
}

export async function scoreQuestion(question: string, llama_score: number): Promise<{ score: number, foundKeywords: { [key: string]: boolean } }> {
  try {
    const calculatedScore = calculateScore(question, llama_score);
    return calculatedScore;
  } catch (error) {
    // Handle database error
    console.error('Failed to score question', error);
    throw new Error('Failed to score question');
  }
}

// Constants and functions related to scoring and taxonomy
const keywordScoreMap: { [key: string]: number } = {
  'bloom_remembering': 10,
  'bloom_understanding': 20,
  'bloom_applying': 20,
  'bloom_analyzing': 25,
  'bloom_evaluating': 35,
  'bloom_creating': 40
};

const bloomKeywords: string[][] = [
  bloom_remembering,
  bloom_understanding,
  bloom_applying,
  bloom_analyzing,
  bloom_evaluating,
  bloom_creating
];

function calculateScore(question: string, llama_score: number): { score: number, foundKeywords: { [key: string]: boolean } } {
  let totalScore = 0;
  let foundKeywords: { [key: string]: boolean } = {};

  bloomKeywords.forEach((levels, index) => {
    let found = false;
    levels.forEach(keyword => {
      if (!foundKeywords[`bloom_${["remembering", "understanding", "applying", "analyzing", "evaluating", "creating"][index]}`] &&
        question.toLowerCase().includes(keyword)) {
        totalScore += keywordScoreMap[`bloom_${["remembering", "understanding", "applying", "analyzing", "evaluating", "creating"][index]}`];
        foundKeywords[`bloom_${["remembering", "understanding", "applying", "analyzing", "evaluating", "creating"][index]}`] = true;
        found = true;
      }
    });
    if (found) {
      return; // exit the forEach loop early if a keyword is found
    }
  });

  const average_score = Math.round(totalScore + llama_score / 2);

  console.log('Blooms score:', totalScore, 'Llama score:', llama_score, 'Average score:', average_score);

  return { score: average_score, foundKeywords };
}

export async function updateRank(userId: string, classId: string): Promise<string> {
  try {
    const classEnrollment = await prisma.classEnrollment.findUnique({
      where: {
        userId_classId: {
          userId: userId,
          classId: classId
        }
      }
    });

    if (!classEnrollment) {
      return "Class enrollment not found";
    }

    const currentRank = classEnrollment.rank;
    let rank = "Novice Inquirer";

    const score = classEnrollment.score;
    
    if (score >= 551 && score <= 1500) {
      rank = "Apprentice Inquirer";
    } else if (score > 1500 && score <= 3000) {
      rank = "Adept Inquirer";
    } else if (score > 3000 && score <= 5000) {
      rank = "Expert Inquirer";
    } else if (score > 5000 && score <= 7000) {
      rank = "Master Inquirer";
    } else if (score > 7000 && score <= 15000) {
      rank = "Legendary Inquirer";
    } else if (score > 15000 && score <= 25000) {
      rank = "Mythical Inquirer";
    } else if (score > 25000 && score <= 35000) {
      rank = "Outstanding Inquirer";
    } else if (score > 35000 && score <= 50000) {
      rank = "Master of Queries";
    } else if (score > 50000) {
      rank = "Grand Inquisitor";
    }

    await prisma.classEnrollment.update({
      where: {
        userId_classId: {
          userId: userId,
          classId: classId
        }
      },
      data: {
        rank: rank,
      }
    });

    if (currentRank === rank) {
      return "Rank unchanged";
    } else {
      return `You have been promoted to ${rank}!`;
    
    }
  } catch (error) {
    // Handle database error
    console.error('Failed to update rank', error);
    return "Failed to update rank";
  }
}