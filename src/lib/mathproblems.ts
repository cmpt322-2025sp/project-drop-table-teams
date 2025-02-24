// Define the shape of a math problem.

// src/lib/MathProblems.ts

// Define the shape of a math problem.
export interface MathProblem {
  question: string;
  answer: number;
}

/**
 * Generates an addition problem.
 * @param min - The minimum number to add (default is 0).
 * @param max - The maximum number to add (default is 100).
 * @returns A MathProblem with a question and the correct answer.
 */
export function generateAdditionProblem(min = 0, max = 100): MathProblem {
  const a = Math.floor(Math.random() * (max - min + 1)) + min;
  const b = Math.floor(Math.random() * (max - min + 1)) + min;
  return {
    question: `${a} + ${b} = ?`,
    answer: a + b
  };
}

/**
 * Generates a subtraction problem.
 * @param min - The minimum number (default is 0).
 * @param max - The maximum number (default is 100).
 * @returns A MathProblem with a question and the correct answer.
 */
export function generateSubtractionProblem(min = 0, max = 100): MathProblem {
  // Ensure we subtract the smaller number from the larger one.
  let a = Math.floor(Math.random() * (max - min + 1)) + min;
  let b = Math.floor(Math.random() * (max - min + 1)) + min;
  if (a < b) [a, b] = [b, a];
  return {
    question: `${a} - ${b} = ?`,
    answer: a - b
  };
}

/**
 * Generates a random math problem (either addition or subtraction).
 * @returns A MathProblem with a question and the correct answer.
 */
export function generateRandomProblem(): MathProblem {
  return Math.random() < 0.5 
    ? generateAdditionProblem() 
    : generateSubtractionProblem();
}
