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

    const englishRegex = /^[a-zA-Z0-9?.,'"\s@\-!#$%^&*()+={}[\]\\|;:'"<>\?]+$/;

    if (!englishRegex.test(question)) {
      return "Invalid characters in question";
    }

    // Check for more than one question mark
    if ((question.match(/\?/g) || []).length > 1) {
      return "Compound questions not allowed";
    }

    // Check if there are any existing questions for the same topic, class, and category
    const existingQuestions = await prisma.question.findMany({
      where: {
        topicId: topicID,
        classId: classID,
        category: category
      }
    });

    // If no existing questions, skip similarity check
    if (existingQuestions.length === 0) {
      console.log('No existing questions found for the same topic, class, and category.');
      console.log('Question validation complete');
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

export async function scoreQuestion(question: string): Promise<number> {
  try {
    const calculatedScore = calculateScore(question);
    return calculatedScore;
  } catch (error) {
    // Handle database error
    console.error('Failed to score question', error);
    throw new Error('Failed to score question');
  }
}

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

function calculateScore(question: string): number {
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

  console.log("Score is:", totalScore);
  return totalScore;
}
