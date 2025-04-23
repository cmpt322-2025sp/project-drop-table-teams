import { test, expect } from 'bun:test';
import {
	generateAdditionProblem,
	generateSubtractionProblem,
	generateRandomPlaceValueProblem,
	generateRandomProblem
} from '$lib/mathproblems';

// Test addition problem generator
test('generateAdditionProblem creates a valid math problem', () => {
	const problem = generateAdditionProblem(1, 10);

	// Check if the question is formatted correctly
	expect(problem.question).toMatch(/\d+ \+ \d+ = \?/);

	// Check if the answer is correct
	const [a, b] = problem.question.split(' + ').map((num) => parseInt(num));
	expect(problem.answer).toBe(a + b);
});
// Test subtraction problem generator
test('generateSubtractionProblem creates a valid math problem', () => {
	const problem = generateSubtractionProblem(1, 10);

	// Check if the question is formatted correctly
	expect(problem.question).toMatch(/\d+ - \d+ = \?/);

	// Extract numbers from the question
	const [a, b] = problem.question.split(' - ').map((num) => parseInt(num));

	// Ensure a >= b (since subtraction should not give negative values)
	expect(a).toBeGreaterThanOrEqual(b);

	// Check if the answer is correct
	expect(problem.answer).toBe(a - b);
});
test('generateRandomPlaceValueProblem creates a valid question', () => {
	const problem = generateRandomPlaceValueProblem();

	// Validate the format of the question
	if (problem.question.includes('What is the digit in the')) {
		// Place value identification question
		expect(problem.question).toMatch(
			/What is the digit in the (ones|tens|hundreds|thousands) place of \d+\?/
		);

		const place = problem.question.match(/(ones|tens|hundreds|thousands)/)?.[0];
		const number = parseInt(problem.question.match(/\d+/)?.[0] || '0');

		// Verify the answer is correct
		let expectedAnswer: string;
		switch (place) {
			case 'ones':
				expectedAnswer = (number % 10).toString();
				break;
			case 'tens':
				expectedAnswer = Math.floor((number / 10) % 10).toString();
				break;
			case 'hundreds':
				expectedAnswer = Math.floor((number / 100) % 10).toString();
				break;
			case 'thousands':
				expectedAnswer = Math.floor((number / 1000) % 10).toString();
				break;
			default:
				expectedAnswer = '';
		}

		expect(problem.answer).toBe(expectedAnswer);
	} else {
		// Number place identification question
		expect(problem.question).toMatch(/What number place is this\?/);
		expect(problem.question).toContain('<div class="number-place-display">');
		expect(problem.question).toContain('<span class="digit highlight">');
		expect(problem.question).toContain('⬆');

		// Answer should be one of the valid place values
		expect(['ones', 'tens', 'hundreds', 'thousands']).toContain(problem.answer);
	}
});
test('manual log: generate random problems for inspection', () => {
	console.log('🔢 Basic math problems:');
	for (let i = 0; i < 5; i++) {
		const prob = generateRandomProblem('2'); // If you add difficulty, pass it here
		console.log(prob.question, '=>', prob.answer);
	}

	console.log('\n🧠 Place value problems:');
	for (let i = 0; i < 5; i++) {
		const prob = generateRandomPlaceValueProblem(100, 9999);
		console.log(prob.question, '=>', prob.answer);
	}
});
test('generateRandomProblem returns easy problems within range', () => {
	for (let i = 0; i < 10; i++) {
		const problem = generateRandomProblem('1');
		const numbers = problem.question.match(/\d+/g)?.map(Number) ?? [];

		expect(numbers.every((n) => n >= 0 && n <= 10)).toBe(true);
	}
});

function extractNumbersFromQuestion(q: string): number[] {
	// Extracts digits like 123, 45 etc., ignores symbols
	return (q.match(/\d+/g) ?? []).map(Number);
}

test('generateRandomProblem returns level 1 problems within range', () => {
	for (let i = 0; i < 10; i++) {
		const problem = generateRandomProblem('1');
		const numbers = extractNumbersFromQuestion(problem.question);

		expect(numbers.every((n) => n >= 0 && n <= 10)).toBe(true);
	}
});

test('generateRandomProblem returns medium problems within range', () => {
	for (let i = 0; i < 10; i++) {
		const problem = generateRandomProblem('2');
		const numbers = problem.question.match(/\d+/g)?.map(Number) ?? [];

		expect(numbers.every((n) => n >= 0 && n <= 50)).toBe(true);
	}
});

test('generateRandomProblem returns hard problems within range', () => {
	for (let i = 0; i < 10; i++) {
		const problem = generateRandomProblem('3');
		const numbers = problem.question.match(/\d+/g)?.map(Number) ?? [];

		expect(numbers.every((n) => n >= 0 && n <= 200)).toBe(true);
	}
});




