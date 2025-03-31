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
	import { EventBus, type MazeScene } from '$lib/game';
	import type { PlayerMovedEvent, InvalidMoveEvent, ShowMathProblemEvent, GoalReachedEvent } from '$lib/game/EventBus';
	import PhaserGameComponent from '$lib/game/PhaserGame.svelte';
	import type { TPhaserRef } from '$lib/game/PhaserGame.svelte';
	import { theme, nextTheme, getThemeColors } from '$lib/stores/theme';

	// Maze settings
	const rows = 6;
	const cols = 6;

	let goalCell: Cell;
	let maze: Cell[][] = [];
	// Phaser game references
	let phaserRef: TPhaserRef = { game: null, scene: null };

	// Math problem state
	let showMathProblem = false;
	let currentProblem: MathProblem | null = null;
	let userAnswer = '';
	let attemptedCell: Cell | null = null;
	let problemResult: 'correct' | 'incorrect' | null = null;
	let answerInput: HTMLInputElement;

	// Player starting position (center of maze for now)
	let targetRow = Math.floor(rows / 2);
	let targetCol = Math.floor(cols / 2);

	// Add movement buttons for kids (in addition to keyboard controls)
	let showControls = true;

	// Add celebration visuals
	let showCelebration = false;
	let celebrationMessage = 'Great job solving the maze!';

	// Theme comes from the Svelte store
	let currentTheme: string; // For binding the UI

	// Subscribe to theme changes
	const unsubscribeTheme = theme.subscribe((value) => {
		currentTheme = value;
	});

	// Handle Phaser scene when it's ready
	function handleSceneReady(scene: MazeScene) {
		console.log('Maze scene is ready', scene);
		
		// Now we can interact with the scene directly
		if (scene) {
			// Set the maze data in the scene
			if (maze.length > 0 && goalCell) {
				scene.setMaze(maze, goalCell);
			}
			
			// Make sure theme is set
			scene.setTheme(currentTheme);
			
			// Connect player movement events
			EventBus.on('player-moved', (data: PlayerMovedEvent) => {
				console.log('Player moved:', data.direction, data.position);
				// Update player position in our state if needed
			});
			
			// Connect invalid move events
			EventBus.on('invalid-move', (data: InvalidMoveEvent) => {
				console.log('Invalid move:', data.direction);
				// Show invalid move indicator
				const invalidMove = document.getElementById('invalid-move');
				if (invalidMove) {
					invalidMove.classList.add('show');
					setTimeout(() => {
						invalidMove.classList.remove('show');
					}, 1500);
				}
			});
			
			// Connect math problem events
			EventBus.on('show-math-problem', (data: ShowMathProblemEvent) => {
				console.log('Math problem at cell:', data.cell);
				// Show the math problem modal
				attemptedCell = data.cell;
				currentProblem = generateMathProblem();
				showMathProblem = true;
				
				// Focus the answer input if available
				setTimeout(() => {
					if (answerInput) {
						answerInput.focus();
					}
				}, 100);
			});
			
			// Connect goal reached events
			EventBus.on('goal-reached', (_data: GoalReachedEvent) => {
				console.log('Goal reached!');
				// Count how many math problems were solved
				let solvedProblems = 0;
				let totalProblems = 0;
				
				for (let r = 0; r < maze.length; r++) {
					for (let c = 0; c < maze[0].length; c++) {
						const cell = maze[r][c];
						if (cell.isIntersection) {
							totalProblems++;
							if (cell.mathProblemSolved) {
								solvedProblems++;
							}
						}
					}
				}
				
				// Always show celebration when goal is reached
				showCelebration = true;
				
				// Update the celebration message based on solved problems
				if (solvedProblems === totalProblems) {
					celebrationMessage = `Perfect! You solved all ${totalProblems} math problems!`;
				} else {
					celebrationMessage = `Good job! You solved ${solvedProblems} out of ${totalProblems} math problems.`;
				}
				
				setTimeout(() => {
					showCelebration = false;
				}, 5000);
			});
		}
	}
	
	onMount(() => {
		if (typeof window !== 'undefined') {
			// Generate the maze
			const mazeData = generateMaze(rows, cols);
			maze = mazeData.maze;
			goalCell = mazeData.goal;
			
			// Add keyboard event listener for the game controls
			window.addEventListener('keydown', handleKeyDown);
			
			// If we already have a scene reference, immediately set maze and theme
			if (phaserRef.scene) {
				phaserRef.scene.setMaze(maze, goalCell);
				phaserRef.scene.setTheme(currentTheme);
			}
			
			// Return cleanup function
			return () => {
				window.removeEventListener('keydown', handleKeyDown);
			};
		}
	});

	onDestroy(() => {
		// Clean up subscriptions
		unsubscribeTheme();
		
		// Clean up EventBus listeners
		EventBus.removeAllListeners('player-moved');
		EventBus.removeAllListeners('invalid-move');
		EventBus.removeAllListeners('show-math-problem');
		EventBus.removeAllListeners('goal-reached');
	});

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
				
				// Refresh the maze to show the solved state immediately
				if (phaserRef.scene) {
					phaserRef.scene.refreshMaze();
				}

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
		// Forward the move to the Phaser scene
		if (phaserRef.scene) {
			phaserRef.scene.movePlayer(direction);
		} else {
			console.log(`Scene not ready, can't move player ${direction}`);
		}
	}

	// Handle arrow keys or WASD key presses to move the player
	function handleKeyDown(e: KeyboardEvent) {
		// Avoid processing keys if we're in a text input
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
			return;
		}

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
		console.log('Changing theme from:', currentTheme);
		
		// Store current theme
		const oldTheme = currentTheme;
		
		// Update the theme in the store
		nextTheme(); 
		
		// Don't directly call scene methods - scene may not be fully initialized
		// Just let the subscription in PhaserGame handle the update
		console.log('Theme updated in store, PhaserGame will handle the update');
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

	<!-- Phaser game container -->
	<div class="viewport {currentTheme}-viewport">
		<!-- PhaserGame Svelte component -->
		<PhaserGameComponent 
			bind:phaserRef={phaserRef} 
			onSceneReady={handleSceneReady}
		/>
		
		<!-- This block helps ensure theme and maze are properly set -->
		{#if maze.length > 0 && currentTheme}
			<!-- Force reactivity when maze and theme are ready -->
		{/if}

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
			message={celebrationMessage}
			buttonText="Play Again"
			onButtonClick={() => window.location.reload()}
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

	/* Viewport container */
	.viewport {
		width: 95vw;
		height: 75vh;
		max-height: calc(100vh - 150px); /* Ensure it doesn't overflow the screen */
		overflow: hidden;
		border-radius: 16px;
		margin: auto;
		position: relative;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
		background: rgba(255, 255, 255, 0.1);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	/* Theme-specific viewport enhancements */
	.space-viewport {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 40px rgba(41, 121, 255, 0.4);
	}
  
	.ocean-viewport {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 188, 212, 0.4);
	}
  
	.jungle-viewport {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 40px rgba(139, 195, 74, 0.4);
	}
  
	.candy-viewport {
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 40px rgba(233, 30, 99, 0.4);
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
			margin-bottom: 0.5rem;
		}

		.viewport {
			width: 98vw;
			height: 65vh;
			margin-top: 0.5rem;
		}

		.question {
			font-size: 1.4rem;
		}

		.control-buttons {
			bottom: 0.5rem;
			right: 0.5rem;
		}
	}

	@media (max-width: 480px) {
		.game-title {
			font-size: 1.7rem;
			margin-bottom: 0.5rem;
		}

		.viewport {
			width: 98vw;
			height: 60vh;
			border-radius: 12px;
		}

		.question {
			font-size: 1.2rem;
		}

		.control-buttons {
			transform: scale(0.9);
			transform-origin: bottom right;
		}

		input {
			width: 120px;
			font-size: 1rem;
		}
	}
</style>