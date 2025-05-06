// Define the shape of a math problem.

// src/lib/MathProblems.ts

// Define the shape of a math problem.
export interface MathProblem {
	question: string;
	answer: number | string;
	type?: 'addition' | 'subtraction' | 'placevalue';
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
		answer: a + b,
		type: 'addition'
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
		answer: a - b,
		type: 'subtraction'
	};
}

/**
 * Generates a random math problem (either addition or subtraction).
 * @returns A MathProblem with a question and the correct answer.
 */
export function generateRandomProblem(): MathProblem {
	return Math.random() < 0.5 ? generateAdditionProblem() : generateSubtractionProblem();
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
	const placeValues = ['ones', 'tens', 'hundreds', 'thousands'];

	if (Math.random() < 0.5) {
		// Place value question (What is the digit in the X place?)
		// Only use place values that actually exist in the current number
		const maxPlaceIndex = Math.min(numberStr.length - 1, placeValues.length - 1);
		const index = Math.floor(Math.random() * (maxPlaceIndex + 1));
		const place = placeValues[index];

		let answer: number = 0;
		switch (place) {
			case 'ones':
				answer = number % 10;
				break;
			case 'tens':
				answer = Math.floor((number / 10) % 10);
				break;
			case 'hundreds':
				answer = Math.floor((number / 100) % 10);
				break;
			case 'thousands':
				answer = Math.floor((number / 1000) % 10);
				break;
		}

		return {
			question: `What is the digit in the ${place} place of ${number}?`,
			answer: answer.toString(),
			type: 'placevalue'
		};
	} else {
		// Number place identification question (What number place is this?)
		// First randomly select a place value (ones, tens, hundreds, etc.)
		const maxPlaceIndex = Math.min(numberStr.length - 1, placeValues.length - 1);
		const placeIndex = Math.floor(Math.random() * (maxPlaceIndex + 1));
		const place = placeValues[placeIndex];

		// Then calculate which digit position corresponds to that place value
		// Example: for "ones" in "123", we want index 2
		//          for "tens" in "123", we want index 1
		//          for "hundreds" in "123", we want index 0
		const digitIndex = numberStr.length - placeIndex - 1;

		// Create our display as HTML with precise positioning
		// We'll use a table-like structure to ensure alignment
		// It's important to use a pre tag to preserve our spacing
		const alignedDisplay = `<div class="number-place-display">
  <pre>
${numberStr
	.split('')
	.map((digit, i) => `<span class="digit${i === digitIndex ? ' highlight' : ''}">${digit}</span>`)
	.join('')}
${numberStr
	.split('')
	.map((digit, i) => `<span class="digit">${i === digitIndex ? '⬆' : ' '}</span>`)
	.join('')}
  </pre>
</div>`;

		return {
			question: `What number place is this?\n${alignedDisplay}`,
			answer: place, // Answer is "ones", "tens", "hundreds", or "thousands"
			type: 'placevalue'
		};
	}
}
