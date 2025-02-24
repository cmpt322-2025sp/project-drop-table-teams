// Define the shape of a math problem.

// src/lib/MathProblems.ts

// Define the shape of a math problem.
export interface MathProblem {
  question: string;
  answer: number | string;
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
/**
 * Generates either a place value problem or a number place identification problem.
 * @param min - The minimum number (default is 10).
 * @param max - The maximum number (default is 999).
 * @returns A MathProblem object.
 */
export function generateRandomPlaceValueProblem(min = 10, max = 999): MathProblem {
  const number = Math.floor(Math.random() * (max - min + 1)) + min;
  const numberStr = number.toString();
  const placeValues = ["ones", "tens", "hundreds"];

  if (Math.random() < 0.5) {
    // Place value question (What is the digit in the X place?)
    const index = Math.floor(Math.random() * placeValues.length);
    const place = placeValues[index];

    let answer: number = 0;
    switch (place) {
      case "ones":
        answer = number % 10;
        break;
      case "tens":
        answer = Math.floor((number / 10) % 10);
        break;
      case "hundreds":
        answer = Math.floor(number / 100);
        break;
    }

    return {
      question: `What is the digit in the ${place} place of ${number}?`,
      answer: answer.toString(),
    };
  } else {
    // Number place identification question (What number place is this?)
    const digitIndex = Math.floor(Math.random() * numberStr.length); // Randomly select a digit
    const caretLine = " ".repeat(digitIndex) + "^"; // Create the ^ pointer below the digit

    const place = placeValues[numberStr.length - digitIndex - 1]; // Determine the place name

    return {
      question: `What number place is this?\n${numberStr}\n${caretLine}`,
      answer: place, // Answer is "ones", "tens", or "hundreds"
    };
  }
}