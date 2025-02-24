import { test, expect } from "bun:test";
import { generateAdditionProblem } from "./mathproblems";

// Test addition problem generator
test("generateAdditionProblem creates a valid math problem", () => {
  const problem = generateAdditionProblem(1, 10);
  
  // Check if the question is formatted correctly
  expect(problem.question).toMatch(/\d+ \+ \d+ = \?/);
  
  // Check if the answer is correct
  const [a, b] = problem.question.split(" + ").map(num => parseInt(num));
  expect(problem.answer).toBe(a + b);
});
