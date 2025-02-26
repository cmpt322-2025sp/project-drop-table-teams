<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { generateMaze } from '$lib/Maze';
	import type { Cell } from '$lib/Maze';
	import {
		generateRandomProblem,
		generateRandomPlaceValueProblem,
		type MathProblem
	} from '$lib/mathproblems';

	// Maze settings
	const rows = 10;
	const cols = 10;
	const cellSize = 40; // Path size in pixels
	const wallThickness = 40;

	let goalCell: Cell;
	let maze: Cell[][] = [];
	let canvas: HTMLCanvasElement;

	// Math problem state
	let showMathProblem = false;
	let currentProblem: MathProblem | null = null;
	let userAnswer = '';
	let attemptedCell: Cell | null = null;
	let problemResult: 'correct' | 'incorrect' | null = null;

	// Player starting position (center of maze for now).
	let targetRow = Math.floor(rows / 2);
	let targetCol = Math.floor(cols / 2);
	// The "displayed" position is used for animation (in grid units, as a float).
	let displayedRow = targetRow;
	let displayedCol = targetCol;

	// Zoom setting: this is how much we want to zoom into the maze.
	const zoom = 3;
	// We'll compute offsets based on the full canvas dimensions.
	let canvasWidth = 0;
	let canvasHeight = 0;
	// These wil be used in the transform style.
	let offsetX = 0;
	let offsetY = 0;

	// Animation settings.
	const animationSpeed = 0.2; // Adjust between 0 (slow) and 1 (instant).
	let animating = false;

	onMount(() => {
		if (typeof window !== 'undefined') {
			const mazeData = generateMaze(rows, cols);
			maze = mazeData.maze;
			goalCell = mazeData.goal;
			draw();
			updateTransform();
			window.addEventListener('keydown', handleKeyDown);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKeyDown);
		}
	});

	// Draws the entire maze and the player.
	function draw() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Calculate overall canvas dimensions.
		// There will be an extra wall on each boundry:
		canvasWidth = cols * cellSize + (cols + 1) * wallThickness;
		canvasHeight = rows * cellSize + (rows + 1) * wallThickness;
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

		// Draw the entire canvas filled iwth walls.
		ctx.fillStyle = 'black';
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);

		// Draw each cell's path (white rectangle, green for goal, or brown for intersections).
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const cell = maze[r][c];
				const x = wallThickness + c * (cellSize + wallThickness);
				const y = wallThickness + r * (cellSize + wallThickness);

				if (cell.isGoal) {
					ctx.fillStyle = 'green';
				} else if (cell.isIntersection && !cell.mathProblemSolved) {
					ctx.fillStyle = 'brown'; // Mark unsolved intersections as brown
				} else {
					ctx.fillStyle = 'white';
				}
				ctx.fillRect(x, y, cellSize, cellSize);
			}
		}

		// Remove walls where passages exist.
		// For each cell, check the maze data.
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const cell = maze[r][c];
				const x = wallThickness + c * (cellSize + wallThickness);
				const y = wallThickness + r * (cellSize + wallThickness);
				// Remove the right wall if there is a passage to the adjacent cell.
				if (!cell.walls.right && c < cols - 1) {
					ctx.fillRect(x + cellSize, y, wallThickness, cellSize);
				}
				// Remove the bottom wall if there is a passage to the adjacent cell.
				if (!cell.walls.bottom && r < rows - 1) {
					ctx.fillRect(x, y + cellSize, cellSize, wallThickness);
				}
			}
		}
		drawPlayer(ctx);
	}

	// Draws a red square representing the player.
	function drawPlayer(ctx: CanvasRenderingContext2D) {
		// Compute the top-left corner of the player's cell.
		const x = wallThickness + displayedCol * (cellSize + wallThickness);
		const y = wallThickness + displayedRow * (cellSize + wallThickness);

		// Size of player square.
		const playerSize = cellSize * 0.8;
		const inset = (cellSize - playerSize) / 2;

		ctx.fillStyle = 'red';
		ctx.fillRect(x + inset, y + inset, playerSize, playerSize);
	}

	function updateTransform() {
		// Check if window exists (i.e. code is running in the browser)
		if (typeof window === 'undefined') return;

		// Compute the center of the player's cell in the full maze (in canvas pixels).
		// We add half the cell's width/height to center within the cell.
		const playerCenterX = wallThickness + displayedCol * (cellSize + wallThickness) + cellSize / 2;
		const playerCenterY = wallThickness + displayedRow * (cellSize + wallThickness) + cellSize / 2;

		// Define the viewport dimensions. Here we use 80% of the window dimensions.
		const viewportWidth = window.innerWidth * 0.8;
		const viewportHeight = window.innerHeight * 0.8;

		// To center the player in the viewport computer the offset needed.
		// Note: Because we apply a scale transform, we need to divide the offset
		// by the zoom factor.
		offsetX = (viewportWidth / 2 - playerCenterX * zoom) / zoom;
		offsetY = (viewportHeight / 2 - playerCenterY * zoom) / zoom;

		if (canvas) {
			canvas.style.transform = `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`;
		}
	}

	// Animate the transition from the current displayed position to the target.
	function animate() {
		// Linear interpolation helper.
		const lerp = (start: number, end: number, t: number) => start + (end - start) * t;

		// Update displayed positions.
		displayedRow = lerp(displayedRow, targetRow, animationSpeed);
		displayedCol = lerp(displayedCol, targetCol, animationSpeed);

		// Redraw and update transform.
		draw();
		updateTransform();

		// If the displayed position is nearly at the target, finish animating.
		if (Math.abs(displayedRow - targetRow) < 0.01 && Math.abs(displayedCol - targetCol) < 0.01) {
			displayedRow = targetRow;
			displayedCol = targetCol;
			animating = false;
		} else {
			requestAnimationFrame(animate);
		}
	}

	// Check if the move is valid based on walls
	function isMoveValid(newRow: number, newCol: number): boolean {
		if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= cols) {
			return false; // Out of bounds
		}

		const currentCell = maze[targetRow][targetCol];
		if (newRow < targetRow && currentCell.walls.top) return false; // Moving up
		if (newRow > targetRow && currentCell.walls.bottom) return false; // Moving down
		if (newCol < targetCol && currentCell.walls.left) return false; // Moving left
		if (newCol > targetCol && currentCell.walls.right) return false; // Moving right

		return true; // Move is valid
	}

	// Generate a math problem for the intersection
	function generateMathProblem(): MathProblem {
		// Randomly choose between regular math problems and place value problems
		return Math.random() < 0.5 ? generateRandomProblem() : generateRandomPlaceValueProblem();
	}

	// Check the user's answer to the math problem
	function checkAnswer() {
		if (!currentProblem || !attemptedCell) return;

		// Convert both to strings for comparison (handles both number and string answers)
		const isCorrect = userAnswer.trim() === currentProblem.answer.toString();

		if (isCorrect) {
			problemResult = 'correct';
			// Mark the problem as solved
			if (attemptedCell) {
				attemptedCell.mathProblemSolved = true;
				// Allow movement to the cell
				targetRow = attemptedCell.row;
				targetCol = attemptedCell.col;

				// Check if player reached the goal
				if (attemptedCell.isGoal) {
					setTimeout(() => {
						alert('Congratulations! You reached the goal!');
					}, 500);
				}

				// Start animating
				if (!animating) {
					animating = true;
					requestAnimationFrame(animate);
				}

				// Close the math problem modal after a short delay
				setTimeout(() => {
					showMathProblem = false;
					currentProblem = null;
					userAnswer = '';
					attemptedCell = null;
					problemResult = null;
				}, 1000);
			}
		} else {
			problemResult = 'incorrect';
			// Clear the answer for another attempt
			userAnswer = '';
		}
	}

	// Handle arrow keys or WASD key presses to move the player.
	function handleKeyDown(e: KeyboardEvent) {
		// If math problem is showing, don't allow movement
		if (showMathProblem) return;

		let newRow = targetRow;
		let newCol = targetCol;
		if (e.key === 'ArrowUp' || e.key === 'w') {
			newRow = targetRow - 1;
		} else if (e.key === 'ArrowDown' || e.key === 's') {
			newRow = targetRow + 1;
		} else if (e.key === 'ArrowLeft' || e.key === 'a') {
			newCol = targetCol - 1;
		} else if (e.key === 'ArrowRight' || e.key === 'd') {
			newCol = targetCol + 1;
		}

		// Check boundaries and wall collision
		if (isMoveValid(newRow, newCol)) {
			const targetCell = maze[newRow][newCol];

			// Check if the cell has an unsolved math problem
			if (targetCell.hasMathProblem && !targetCell.mathProblemSolved) {
				// Show math problem
				showMathProblem = true;
				currentProblem = generateMathProblem();
				attemptedCell = targetCell;
				userAnswer = '';
				problemResult = null;
			} else {
				// Normal movement
				targetRow = newRow;
				targetCol = newCol;

				// Check if player reached the goal
				if (targetCell.isGoal) {
					alert('Congratulations! You reached the goal!');
				}

				// Start animating if not already.
				if (!animating) {
					animating = true;
					requestAnimationFrame(animate);
				}
			}
		}
	}
</script>

<!-- Wrap the canvas in a viewport container -->
<div class="viewport">
	<canvas bind:this={canvas} style="transform: scale({zoom}) translate({offsetX}px, {offsetY}px);"
	></canvas>

	<!-- Math problem modal -->
	{#if showMathProblem && currentProblem}
		<div class="math-problem-modal">
			<div class="math-problem-content">
				<h2>Solve this problem to continue</h2>
				<p class="question">{currentProblem.question}</p>

				{#if currentProblem.answer === "ones" || currentProblem.answer === "tens" || currentProblem.answer === "hundreds"}
					<!-- Multiple choice for place value questions -->
					<div class="multiple-choice">
						<button class="choice-btn" on:click={() => { userAnswer = "ones"; checkAnswer(); }}>
							Ones
						</button>
						<button class="choice-btn" on:click={() => { userAnswer = "tens"; checkAnswer(); }}>
							Tens
						</button>
						<button class="choice-btn" on:click={() => { userAnswer = "hundreds"; checkAnswer(); }}>
							Hundreds
						</button>
					</div>
				{:else}
					<!-- Regular input for other question types -->
					<div class="answer-section">
						<input
							type="text"
							bind:value={userAnswer}
							placeholder="Your answer"
							on:keydown={(e) => e.key === 'Enter' && checkAnswer()}
							autofocus
						/>
						<button on:click={checkAnswer}>Submit</button>
					</div>
				{/if}

				{#if problemResult === 'correct'}
					<p class="result correct">Correct! You may proceed.</p>
				{:else if problemResult === 'incorrect'}
					<p class="result incorrect">Incorrect. Try again.</p>
				{/if}
			</div>
		</div>
	{/if}
</div>

<style>
	.viewport {
		width: 80vw;
		height: 80vh;
		overflow: hidden;
		border: 2px solid #333;
		margin: auto;
		position: relative;
	}
	canvas {
		transform-origin: top left;
	}

	.math-problem-modal {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 10;
	}

	.math-problem-content {
		background-color: white;
		padding: 2rem;
		border-radius: 8px;
		width: 80%;
		max-width: 500px;
		text-align: center;
	}

	.question {
		font-size: 1.5rem;
		margin: 1.5rem 0;
		white-space: pre-line; /* Preserves line breaks in questions */
	}

	.answer-section {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin: 1.5rem 0;
	}

	.multiple-choice {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		margin: 1.5rem 0;
	}

	.choice-btn {
		width: 200px;
		padding: 0.75rem 1rem;
		font-size: 1.1rem;
	}

	input {
		padding: 0.5rem;
		font-size: 1rem;
		border: 1px solid #ccc;
		border-radius: 4px;
	}

	button {
		padding: 0.5rem 1rem;
		background-color: #4caf50;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
	}

	button:hover {
		background-color: #45a049;
	}

	.result {
		font-weight: bold;
		margin-top: 1rem;
	}

	.correct {
		color: green;
	}

	.incorrect {
		color: red;
	}
</style>