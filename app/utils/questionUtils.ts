export async function validateQuestion(question: string): Promise<boolean> {
    try {
      if (!question) {
        return false;
      }

      question = question.toLowerCase().trim();

      if (!question.endsWith('?')) {
        return false;
      }

      if (!question.startsWith('what') && !question.startsWith('why') &&
       !question.startsWith('when') && !question.startsWith('how') && 
       !question.startsWith('where') && !question.startsWith('who') &&
       !question.startsWith('which') && !question.startsWith('whom') &&
       !question.startsWith('whose') && !question.startsWith('is') &&
       !question.startsWith('are') && !question.startsWith('do') &&
       !question.startsWith('does') && !question.startsWith('can') &&
       !question.startsWith('could') && !question.startsWith('will') &&
       !question.startsWith('would') && !question.startsWith('should') &&
       !question.startsWith('shall') && !question.startsWith('may') &&
       !question.startsWith('might') && !question.startsWith('must') &&
       !question.startsWith('have') && !question.startsWith('has') &&
       !question.startsWith('had') && !question.startsWith('am') &&
       !question.startsWith('was') && !question.startsWith('were')) {
        return false;
      }

      const englishRegex = /^[a-zA-Z0-9?.,'"\s]+$/;

      if (!englishRegex.test(question)) {
        return false;
      }

      console.log('Question validation complete:');
      return true;
    } catch (error) {
      // Handle database error
      console.error('Failed to validate question', error);
      return false;
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