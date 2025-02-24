import { test, expect } from "bun:test";
import { generateAdditionProblem, generateSubtractionProblem, generateRandomPlaceValueProblem} from "$lib/mathproblems";

// Test addition problem generator
test("generateAdditionProblem creates a valid math problem", () => {
  const problem = generateAdditionProblem(1, 10);
  
  // Check if the question is formatted correctly
  expect(problem.question).toMatch(/\d+ \+ \d+ = \?/);
  
  // Check if the answer is correct
  const [a, b] = problem.question.split(" + ").map(num => parseInt(num));
  expect(problem.answer).toBe(a + b);
});
// Test subtraction problem generator
test("generateSubtractionProblem creates a valid math problem", () => {
    const problem = generateSubtractionProblem(1, 10);
  
    // Check if the question is formatted correctly
    expect(problem.question).toMatch(/\d+ - \d+ = \?/);
  
    // Extract numbers from the question
    const [a, b] = problem.question.split(" - ").map(num => parseInt(num));
  
    // Ensure a >= b (since subtraction should not give negative values)
    expect(a).toBeGreaterThanOrEqual(b);
  
    // Check if the answer is correct
    expect(problem.answer).toBe(a - b);
  });
  test("generateRandomPlaceValueProblem creates a valid question", () => {
    const problem = generateRandomPlaceValueProblem();
  
    expect(problem.question).toMatch(/What is the digit in the (ones|tens|hundreds) place of \d+\?|What number place is this\?\n\d+\n\s*\^/);
  
    const numberMatch = problem.question.match(/\d+/);
    expect(numberMatch).not.toBeNull();
  
    const number = numberMatch![0];
    
    if (problem.question.includes("What number place is this?")) {
      const caretIndex = problem.question.split("\n")[2].indexOf("^");
      const expectedPlace = ["ones", "tens", "hundreds"][number.length - caretIndex - 1];
      expect(problem.answer).toBe(expectedPlace);
    } else {
      let expectedAnswer: string;
      if (problem.question.includes("ones")) {
        expectedAnswer = (parseInt(number) % 10).toString();
      } else if (problem.question.includes("tens")) {
        expectedAnswer = Math.floor((parseInt(number) / 10) % 10).toString();
      } else if (problem.question.includes("hundreds")) {
        expectedAnswer = Math.floor((parseInt(number) / 100)).toString();
      }
      
    }
  });