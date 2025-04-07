<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { generateMaze } from '$lib/Maze';
	import type { Cell } from '$lib/Maze';
	import {
		generateRandomProblem,
		generateRandomPlaceValueProblem,
		type MathProblem
	} from '$lib/mathproblems';
	import { Button, Modal } from '$lib/components';
	import Celebration from '$lib/components/Celebration.svelte';
	import { MazeRenderer } from '$lib/game/MazeRenderer';
	import { theme, nextTheme, getThemeColors } from '$lib/stores/theme';

	// Maze settings
	const rows = 5;
	const cols = 5;
	const cellSize = 70; // Larger cells for better visibility and higher resolution
	const wallThickness = 40;

	let goalCell: Cell;
	let maze: Cell[][] = [];
	let canvas: HTMLCanvasElement;
	let mazeRenderer: MazeRenderer;

	// Math problem state
	let showMathProblem = false;
	let currentProblem: MathProblem | null = null;
	let userAnswer = '';
	let attemptedCell: Cell | null = null;
	let problemResult: 'correct' | 'incorrect' | null = null;
	let answerInput: HTMLInputElement;

	// Player starting position (center of maze for now).
	let targetRow = Math.floor(rows / 2);
	let targetCol = Math.floor(cols / 2);
	// The "displayed" position is used for animation (in grid units, as a float).
	let displayedRow = targetRow;
	let displayedCol = targetCol;

	// Zoom setting: this is how much we want to zoom into the maze.
	const zoom = 2;
	// We'll compute offsets based on the full canvas dimensions.
	let canvasWidth = 0;
	let canvasHeight = 0;
	// These will be used in the transform style.
	let offsetX = 0;
	let offsetY = 0;

	// Animation settings.
	const animationSpeed = 0.15; // Slightly slower for kids to follow
	let animating = false;

	// Add movement buttons for kids (in addition to keyboard controls)
	let showControls = true;

	// Add celebration visuals
	let showCelebration = false;

	// Theme comes from the Svelte store
	let currentTheme; // For binding the UI

	// Subscribe to theme changes
	const unsubscribeTheme = theme.subscribe((value) => {
		currentTheme = value;
	});

	onMount(() => {
		if (typeof window !== 'undefined') {
			const mazeData = generateMaze(rows, cols);
			maze = mazeData.maze;
			goalCell = mazeData.goal;

			// Initialize the maze renderer with high-res support
			const pixelRatio = window.devicePixelRatio || 1;

			mazeRenderer = new MazeRenderer(canvas, cellSize, wallThickness);
			const dimensions = mazeRenderer.calculateCanvasDimensions(rows, cols);

			// Set the canvas's display size
			canvas.style.width = `${dimensions.width}px`;
			canvas.style.height = `${dimensions.height}px`;

			// Set the canvas's drawing buffer size
			canvas.width = dimensions.width * pixelRatio;
			canvas.height = dimensions.height * pixelRatio;

			// Store logical dimensions for calculations
			canvasWidth = dimensions.width;
			canvasHeight = dimensions.height;

			// Scale the context for high-resolution display
			const ctx = canvas.getContext('2d');
			if (ctx) {
				ctx.scale(pixelRatio, pixelRatio);
			}

			// Initial render
			draw();
			updateTransform();

			window.addEventListener('keydown', handleKeyDown);
		}
	});

	onDestroy(() => {
		if (typeof window !== 'undefined') {
			window.removeEventListener('keydown', handleKeyDown);
		}

		// Clean up subscriptions
		unsubscribeTheme();

		// Clean up MazeRenderer resources
		if (mazeRenderer) {
			mazeRenderer.destroy();
		}
	});

	// Draw the maze and player using the MazeRenderer
	function draw() {
		if (!canvas || !mazeRenderer) return;
		mazeRenderer.render(maze, displayedRow, displayedCol);
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

		// To center the player in the viewport compute the offset needed.
		// Note: Because we apply a scale transform, we need to divide the offset
		// by the zoom factor.
		offsetX = (viewportWidth / 2 - playerCenterX * zoom) / zoom;
		offsetY = (viewportHeight / 2 - playerCenterY * zoom) / zoom;

		if (canvas) {
			canvas.style.transform = `scale(${zoom}) translate(${offsetX}px, ${offsetY}px)`;
		}
	}

	// Animate the transition from the current displayed position to the target.
	function animate(onComplete?: () => void) {
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

			// Call the completion callback if provided
			if (onComplete) onComplete();
		} else {
			requestAnimationFrame(() => animate(onComplete));
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

				// Immediately redraw the maze to update the block appearance
				draw();

				// Handle goal check and close math problem
				const isGoalCell = attemptedCell.isGoal;

				// Display goal message if needed (after closing the problem dialog)
				if (isGoalCell) {
					showCelebration = true;
					setTimeout(() => {
						showCelebration = false;
					}, 3000);
				}

				// Close the math problem modal after a short delay
				setTimeout(() => {
					showMathProblem = false;
					currentProblem = null;
					userAnswer = '';
					attemptedCell = null;
					problemResult = null;
					// Redraw one more time to ensure everything is updated
					draw();
				}, 1000);
			}
		} else {
			problemResult = 'incorrect';

			// Show the correct answer and generate a new problem after a delay
			setTimeout(() => {
				// Generate a new problem after showing the correct answer
				currentProblem = generateMathProblem();
				userAnswer = '';
				problemResult = null;
			}, 1500);
		}
	}

	// Handle movement with direction buttons or keyboard
	function movePlayer(direction: 'up' | 'down' | 'left' | 'right') {
		// If math problem is showing or currently animating, don't allow movement
		if (showMathProblem || animating) return;

		let newRow = targetRow;
		let newCol = targetCol;

		if (direction === 'up') {
			newRow = targetRow - 1;
		} else if (direction === 'down') {
			newRow = targetRow + 1;
		} else if (direction === 'left') {
			newCol = targetCol - 1;
		} else if (direction === 'right') {
			newCol = targetCol + 1;
		}

		// Check boundaries and wall collision
		if (isMoveValid(newRow, newCol)) {
			const targetCell = maze[newRow][newCol];

			// Normal movement first, then check for special cases after animation
			targetRow = newRow;
			targetCol = newCol;

			// Start animating
			animating = true;

			// Handle math problems or goal after animation completes
			requestAnimationFrame(() =>
				animate(() => {
					// After animation completes, check if cell has math problem
					if (targetCell.hasMathProblem && !targetCell.mathProblemSolved) {
						// Show math problem after movement completes
						showMathProblem = true;
						currentProblem = generateMathProblem();
						attemptedCell = targetCell;
						userAnswer = '';
						problemResult = null;

						// Focus the input element after the modal opens
						setTimeout(() => {
							if (answerInput) answerInput.focus();
						}, 100);
					}
					// Check if player reached the goal after animation completes
					else if (targetCell.isGoal) {
						showCelebration = true;
						setTimeout(() => {
							showCelebration = false;
						}, 3000);
					}
				})
			);
		} else {
			// Give visual feedback when trying to move through walls
			const invalidMove = document.getElementById('invalid-move');
			if (invalidMove) {
				invalidMove.classList.add('show');
				setTimeout(() => {
					invalidMove.classList.remove('show');
				}, 500);
			}
		}
	}

	// Handle arrow keys or WASD key presses to move the player
	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === 'ArrowUp' || e.key === 'w') {
			movePlayer('up');
		} else if (e.key === 'ArrowDown' || e.key === 's') {
			movePlayer('down');
		} else if (e.key === 'ArrowLeft' || e.key === 'a') {
			movePlayer('left');
		} else if (e.key === 'ArrowRight' || e.key === 'd') {
			movePlayer('right');
		}
	}

	// Change the maze theme
	function changeTheme() {
		nextTheme(); // Use the store's function to change the theme
		draw();
	}
</script>

<!-- Colorful background for the game page -->
<div class="game-container {currentTheme}-theme">
	<h1 class="game-title">Math Maze Adventure!</h1>

	<!-- Theme selection button -->
	<Button
		variant="primary"
		rounded={true}
		size="md"
		onClick={changeTheme}
		style="background-color: #FFEB3B; color: #333; font-family: 'Comic Sans MS', cursive, sans-serif; margin-bottom: 1rem;"
	>
		Change Theme
	</Button>

	<!-- Wrap the canvas in a viewport container -->
	<div class="viewport">
		<canvas bind:this={canvas} style="transform: scale({zoom}) translate({offsetX}px, {offsetY}px);"
		></canvas>

		<!-- On-screen controls for touchscreens or younger kids -->
		{#if showControls}
			<div class="control-buttons">
				<Button
					variant="default"
					onClick={() => movePlayer('up')}
					icon={true}
					style="background-color: rgba(255, 255, 255, 0.7); color: #333; margin-bottom: 0.5rem;"
					>↑</Button
				>
				<div class="control-row">
					<Button
						variant="default"
						onClick={() => movePlayer('left')}
						icon={true}
						style="background-color: rgba(255, 255, 255, 0.7); color: #333; margin-right: 1rem;"
						>←</Button
					>
					<Button
						variant="default"
						onClick={() => movePlayer('right')}
						icon={true}
						style="background-color: rgba(255, 255, 255, 0.7); color: #333;">→</Button
					>
				</div>
				<Button
					variant="default"
					onClick={() => movePlayer('down')}
					icon={true}
					style="background-color: rgba(255, 255, 255, 0.7); color: #333; margin-top: 0.5rem;"
					>↓</Button
				>
			</div>
		{/if}

		<!-- Invalid move indicator -->
		<div id="invalid-move" class="invalid-move">Can't go that way!</div>

		<!-- Math problem modal using the Modal component -->
		<Modal
			show={showMathProblem && currentProblem !== null}
			theme={currentTheme}
			disableBackdropClick={true}
			titleId="math-problem-title"
		>
			<div class="math-problem-content">
				<h2 id="math-problem-title" style="color: {getThemeColors(currentTheme).mathProblemColor}">
					Solve to Continue!
				</h2>
				{#if currentProblem}
					<p class="question">{@html currentProblem.question}</p>

					{#if currentProblem.answer === 'ones' || currentProblem.answer === 'tens' || currentProblem.answer === 'hundreds' || currentProblem.answer === 'thousands'}
						<!-- Multiple choice for place value questions -->
						<div class="multiple-choice">
							<Button
								variant="primary"
								size="md"
								rounded={true}
								style="background-color: #FFC107; color: #333; width: 200px; margin-bottom: 0.75rem;"
								onClick={() => {
									userAnswer = 'ones';
									checkAnswer();
								}}
							>
								Ones
							</Button>
							<Button
								variant="primary"
								size="md"
								rounded={true}
								style="background-color: #4CAF50; color: white; width: 200px; margin-bottom: 0.75rem;"
								onClick={() => {
									userAnswer = 'tens';
									checkAnswer();
								}}
							>
								Tens
							</Button>
							<Button
								variant="primary"
								size="md"
								rounded={true}
								style="background-color: #2196F3; color: white; width: 200px; margin-bottom: 0.75rem;"
								onClick={() => {
									userAnswer = 'hundreds';
									checkAnswer();
								}}
							>
								Hundreds
							</Button>
							<Button
								variant="primary"
								size="md"
								rounded={true}
								style="background-color: #9C27B0; color: white; width: 200px; margin-bottom: 0.75rem;"
								onClick={() => {
									userAnswer = 'thousands';
									checkAnswer();
								}}
							>
								Thousands
							</Button>
						</div>
					{:else}
						<!-- Regular input for other question types -->
						<div class="answer-section">
							<input
								type="text"
								bind:value={userAnswer}
								bind:this={answerInput}
								placeholder="Your answer"
								on:keydown={(e) => e.key === 'Enter' && checkAnswer()}
							/>
							<Button
								variant="primary"
								size="md"
								rounded={true}
								onClick={checkAnswer}
								style="background-color: #9C27B0; color: white; margin-left: 0.5rem;">Submit</Button
							>
						</div>
					{/if}

					{#if problemResult === 'correct'}
						<p class="result correct">
							<span class="emoji">🎉</span> Correct! <span class="emoji">🎉</span>
						</p>
					{:else if problemResult === 'incorrect'}
						<p class="result incorrect">
							<span class="emoji">😕</span> Try again! The answer is {currentProblem.answer}.
						</p>
					{/if}
				{/if}
			</div>
		</Modal>

		<!-- Celebration overlay when reaching the goal -->
		<Celebration
			show={showCelebration}
			title="You Did It!"
			message="Great job solving the maze!"
			buttonText="Back to Dashboard"
			onButtonClick={() => window.location.href = '/private/student/dashboard'}
		/>
	</div>
</div>

<style>
	/* Game container styles */
	.game-container {
		width: 100%;
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 1rem;
		box-sizing: border-box;
		font-family: 'Comic Sans MS', cursive, sans-serif;
		overflow: hidden;
		position: relative;
	}

	/* Different theme backgrounds */
	.space-theme {
		background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
		color: white;
	}

	.ocean-theme {
		background: linear-gradient(135deg, #1a237e, #0277bd, #00bcd4);
		color: white;
	}

	.jungle-theme {
		background: linear-gradient(135deg, #004d40, #00796b, #8bc34a);
		color: white;
	}

	.candy-theme {
		background: linear-gradient(135deg, #880e4f, #c2185b, #f06292);
		color: white;
	}

	/* Game title */
	.game-title {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		text-align: center;
		text-shadow: 3px 3px 5px rgba(0, 0, 0, 0.3);
		animation: rainbow 6s linear infinite;
		font-weight: bold;
	}

	@keyframes rainbow {
		0% {
			color: #ff5757;
		}
		15% {
			color: #ffbd59;
		}
		30% {
			color: #ffff47;
		}
		45% {
			color: #7cff73;
		}
		60% {
			color: #67d7ff;
		}
		75% {
			color: #ae86ff;
		}
		90% {
			color: #ff65e0;
		}
		100% {
			color: #ff5757;
		}
	}

	/* Theme button */
	.theme-button {
		background-color: #ffeb3b;
		color: #333;
		border: none;
		border-radius: 50px;
		padding: 0.75rem 1.5rem;
		font-size: 1.1rem;
		font-weight: bold;
		margin-bottom: 1rem;
		cursor: pointer;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
		transition: all 0.2s ease;
		font-family: 'Comic Sans MS', cursive, sans-serif;
		position: relative;
		overflow: hidden;
		z-index: 1;
	}

	.theme-button:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
	}

	.theme-button:active {
		transform: translateY(1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.theme-button::after {
		content: '';
		position: absolute;
		background: rgba(255, 255, 255, 0.3);
		width: 100%;
		height: 100%;
		left: -100%;
		top: 0;
		border-radius: 50px;
		z-index: -1;
		transition: all 0.4s ease;
	}

	.theme-button:hover::after {
		left: 0;
	}

	/* Viewport container */
	.viewport {
		width: 95vw;
		height: 90vh;
		overflow: hidden;
		border-radius: 16px;
		margin: auto;
		position: relative;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
		background: rgba(255, 255, 255, 0.1);
	}

	canvas {
		transform-origin: top left;
		transition: transform 0.3s ease;
		image-rendering: crisp-edges; /* For Firefox */
		image-rendering: -webkit-optimize-contrast; /* For Chrome/Safari */
		image-rendering: pixelated; /* Modern browsers */
		-ms-interpolation-mode: nearest-neighbor; /* For IE */
	}

	/* Control buttons for mobile/younger kids */
	.control-buttons {
		position: absolute;
		bottom: 1rem;
		right: 1rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		z-index: 5;
	}

	.control-row {
		display: flex;
		gap: 1rem;
	}

	.control-btn {
		width: 3.5rem;
		height: 3.5rem;
		border-radius: 50%;
		border: none;
		background-color: rgba(255, 255, 255, 0.7);
		color: #333;
		font-size: 1.5rem;
		font-weight: bold;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
		transition: all 0.2s ease;
	}

	.control-btn:hover {
		background-color: rgba(255, 255, 255, 0.9);
		transform: scale(1.1);
	}

	.control-btn:active {
		background-color: rgba(200, 200, 200, 0.9);
		transform: scale(0.95);
	}

	/* Invalid move indicator */
	.invalid-move {
		position: absolute;
		bottom: 5rem;
		left: 50%;
		transform: translateX(-50%) translateY(100px);
		background-color: #f44336;
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 50px;
		font-weight: bold;
		opacity: 0;
		transition: all 0.3s ease;
		pointer-events: none;
	}

	.invalid-move.show {
		transform: translateX(-50%) translateY(0);
		opacity: 1;
	}

	/* Math problem content styles */
	.math-problem-content {
		text-align: center;
		max-width: 500px;
		margin: 0 auto;
		/* Modal component handles background color and border */
	}

	.question {
		font-size: 1.6rem;
		margin: 1.5rem 0;
		white-space: pre-line; /* Preserves line breaks in questions */
		font-weight: bold;
		line-height: 1.4;
	}

	:global(.number-place-display) {
		display: inline-block;
		text-align: left;
		margin: 1rem auto;
	}

	:global(.number-place-display pre) {
		margin: 0;
		font-size: 2.5rem;
		line-height: 1.2;
		font-family: monospace;
	}

	:global(.digit) {
		display: inline-block;
		width: 1em;
		text-align: center;
	}

	:global(.highlight) {
		color: #ff3e00;
		font-weight: bold;
		animation: pulse 1s infinite alternate;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		100% {
			transform: scale(1.2);
		}
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

	input {
		padding: 0.75rem 1rem;
		font-size: 1.2rem;
		border: 3px solid #9c27b0;
		border-radius: 50px;
		outline: none;
		text-align: center;
		width: 150px;
		font-family: 'Comic Sans MS', cursive, sans-serif;
	}

	:global(.space-theme) input {
		border-color: #3f51b5;
	}
	:global(.ocean-theme) input {
		border-color: #0288d1;
	}
	:global(.jungle-theme) input {
		border-color: #388e3c;
	}
	:global(.candy-theme) input {
		border-color: #d81b60;
	}

	input:focus {
		box-shadow: 0 0 0 3px rgba(156, 39, 176, 0.3);
	}

	.result {
		font-weight: bold;
		margin-top: 1.5rem;
		font-size: 1.3rem;
		padding: 0.75rem;
		border-radius: 50px;
		animation: fadeIn 0.5s;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.correct {
		color: white;
		background-color: #4caf50;
	}

	.incorrect {
		color: white;
		background-color: #f44336;
	}

	.emoji {
		font-size: 1.5rem;
		display: inline-block;
		animation: bounce 0.5s infinite alternate;
	}

	@keyframes bounce {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-5px);
		}
	}

	/* Responsive adjustments */
	@media (max-width: 768px) {
		.game-title {
			font-size: 2rem;
		}

		.viewport {
			width: 95vw;
			height: 65vh;
		}

		.question {
			font-size: 1.4rem;
		}

		.control-btn {
			width: 3rem;
			height: 3rem;
			font-size: 1.2rem;
		}
	}

	@media (max-width: 480px) {
		.game-title {
			font-size: 1.8rem;
		}

		.question {
			font-size: 1.2rem;
		}
	}
</style>