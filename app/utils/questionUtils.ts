export async function validateQuestion(question: string): Promise<boolean> {
    try {
      if (!question) {
        throw new Error('Question cannot be empty');
      }
      console.log('Validated question:', question);
      return true;
    } catch (error) {
      // Handle database error
      console.error('Failed to validate question', error);
      throw new Error('Failed to validate question');
    }
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

function calculateScore(question: string): number {
  const score = Math.floor(Math.random() * 101);
  console.log("Score is:", score,); 
  return score;
}