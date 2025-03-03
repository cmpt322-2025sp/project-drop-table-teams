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
	const rows = 5;
	const cols = 5;
	const cellSize = 50; // Larger cells for better visibility
	const wallThickness = 30;

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
	
	// Add background theme
	const themes = ['space', 'ocean', 'jungle', 'candy'];
	let currentTheme = themes[Math.floor(Math.random() * themes.length)];

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

	// Get colors based on selected theme
	function getThemeColors() {
		switch (currentTheme) {
			case 'space':
				return {
					wallColor: '#2C3E50', // Deep blue
					pathColor: '#F9FAFB', // Off-white
					goalColor: '#FFD700', // Gold
					mathProblemColor: '#9B59B6', // Purple
					solvedColor: '#3498DB', // Blue
					playerColor: '#E74C3C' // Red
				};
			case 'ocean':
				return {
					wallColor: '#1E88E5', // Ocean blue
					pathColor: '#E3F2FD', // Light blue
					goalColor: '#FFEB3B', // Yellow
					mathProblemColor: '#26A69A', // Teal
					solvedColor: '#66BB6A', // Green
					playerColor: '#FF7043' // Orange
				};
			case 'jungle':
				return {
					wallColor: '#33691E', // Deep green
					pathColor: '#DCEDC8', // Light green
					goalColor: '#FFC107', // Amber
					mathProblemColor: '#FF9800', // Orange
					solvedColor: '#8BC34A', // Light green
					playerColor: '#7B1FA2' // Purple
				};
			case 'candy':
				return {
					wallColor: '#E91E63', // Pink
					pathColor: '#FCE4EC', // Light pink
					goalColor: '#FFEB3B', // Yellow
					mathProblemColor: '#AB47BC', // Purple
					solvedColor: '#26C6DA', // Teal
					playerColor: '#7CB342' // Green
				};
			default:
				return {
					wallColor: '#2C3E50',
					pathColor: '#F9FAFB',
					goalColor: '#FFD700',
					mathProblemColor: '#9B59B6',
					solvedColor: '#3498DB',
					playerColor: '#E74C3C'
				};
		}
	}

	// Draws the entire maze and the player.
	function draw() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		// Get theme colors
		const colors = getThemeColors();

		// Calculate overall canvas dimensions.
		// There will be an extra wall on each boundary:
		canvasWidth = cols * cellSize + (cols + 1) * wallThickness;
		canvasHeight = rows * cellSize + (rows + 1) * wallThickness;
		canvas.width = canvasWidth;
		canvas.height = canvasHeight;

		// Draw the entire canvas filled with walls.
		ctx.fillStyle = colors.wallColor;
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);

		// Add texture to walls based on theme
		if (currentTheme === 'space') {
			addStarsTexture(ctx);
		} else if (currentTheme === 'ocean') {
			addBubblesTexture(ctx);
		} else if (currentTheme === 'jungle') {
			addLeavesTexture(ctx);
		} else if (currentTheme === 'candy') {
			addSprinklesTexture(ctx);
		}

		// Draw each cell's path with theme colors
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const cell = maze[r][c];
				const x = wallThickness + c * (cellSize + wallThickness);
				const y = wallThickness + r * (cellSize + wallThickness);

				if (cell.isGoal) {
					// Draw goal with special design
					ctx.fillStyle = colors.goalColor;
					ctx.fillRect(x, y, cellSize, cellSize);
					
					// Draw a star in the goal cell
					drawStar(ctx, x + cellSize/2, y + cellSize/2, 5, cellSize/3, cellSize/6);
				} else if (cell.isIntersection && !cell.mathProblemSolved) {
					// Math problem cells get a special pattern
					ctx.fillStyle = colors.mathProblemColor;
					ctx.fillRect(x, y, cellSize, cellSize);
					
					// Add a question mark
					ctx.fillStyle = 'white';
					ctx.font = `bold ${cellSize/2}px 'Comic Sans MS', cursive`;
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillText('?', x + cellSize/2, y + cellSize/2);
				} else if (cell.isIntersection && cell.mathProblemSolved) {
					// Solved problems get a different color
					ctx.fillStyle = colors.solvedColor;
					ctx.fillRect(x, y, cellSize, cellSize);
					
					// Add a checkmark
					ctx.fillStyle = 'white';
					ctx.font = `bold ${cellSize/2}px 'Comic Sans MS', cursive`;
					ctx.textAlign = 'center';
					ctx.textBaseline = 'middle';
					ctx.fillText('✓', x + cellSize/2, y + cellSize/2);
				} else {
					// Regular path
					ctx.fillStyle = colors.pathColor;
					ctx.fillRect(x, y, cellSize, cellSize);
					
					// Add small decorations to some paths based on theme
					if (Math.random() > 0.7) {
						addPathDecoration(ctx, x, y, currentTheme);
					}
				}
				
				// Add rounded corners to all cells
				ctx.strokeStyle = colors.wallColor;
				ctx.lineWidth = 2;
				ctx.strokeRect(x, y, cellSize, cellSize);
			}
		}

		// Remove walls where passages exist
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const cell = maze[r][c];
				const x = wallThickness + c * (cellSize + wallThickness);
				const y = wallThickness + r * (cellSize + wallThickness);
				
				// Remove the right wall if there is a passage
				if (!cell.walls.right && c < cols - 1) {
					const nextCell = maze[r][c+1];
					let color;
					
					// Choose color based on cells being connected
					if (cell.isGoal || nextCell.isGoal) {
						color = colors.goalColor;
					} else if ((cell.isIntersection && !cell.mathProblemSolved) || 
							  (nextCell.isIntersection && !nextCell.mathProblemSolved)) {
						color = colors.mathProblemColor;
					} else if ((cell.isIntersection && cell.mathProblemSolved) || 
							  (nextCell.isIntersection && nextCell.mathProblemSolved)) {
						color = colors.solvedColor;
					} else {
						color = colors.pathColor;
					}
					
					ctx.fillStyle = color;
					ctx.fillRect(x + cellSize, y, wallThickness, cellSize);
				}
				
				// Remove the bottom wall if there is a passage
				if (!cell.walls.bottom && r < rows - 1) {
					const nextCell = maze[r+1][c];
					let color;
					
					// Choose color based on cells being connected
					if (cell.isGoal || nextCell.isGoal) {
						color = colors.goalColor;
					} else if ((cell.isIntersection && !cell.mathProblemSolved) || 
							  (nextCell.isIntersection && !nextCell.mathProblemSolved)) {
						color = colors.mathProblemColor;
					} else if ((cell.isIntersection && cell.mathProblemSolved) || 
							  (nextCell.isIntersection && nextCell.mathProblemSolved)) {
						color = colors.solvedColor;
					} else {
						color = colors.pathColor;
					}
					
					ctx.fillStyle = color;
					ctx.fillRect(x, y + cellSize, cellSize, wallThickness);
				}
			}
		}
		
		drawPlayer(ctx);
	}
	
	// Add texture to walls based on theme
	function addStarsTexture(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
		for (let i = 0; i < 100; i++) {
			const x = Math.random() * canvasWidth;
			const y = Math.random() * canvasHeight;
			const size = Math.random() * 2 + 1;
			ctx.beginPath();
			ctx.arc(x, y, size, 0, Math.PI * 2);
			ctx.fill();
		}
	}
	
	function addBubblesTexture(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
		for (let i = 0; i < 50; i++) {
			const x = Math.random() * canvasWidth;
			const y = Math.random() * canvasHeight;
			const size = Math.random() * 10 + 5;
			ctx.beginPath();
			ctx.arc(x, y, size, 0, Math.PI * 2);
			ctx.fill();
		}
	}
	
	function addLeavesTexture(ctx: CanvasRenderingContext2D) {
		ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
		for (let i = 0; i < 30; i++) {
			const x = Math.random() * canvasWidth;
			const y = Math.random() * canvasHeight;
			const size = Math.random() * 15 + 5;
			ctx.beginPath();
			ctx.ellipse(x, y, size, size/2, Math.random() * Math.PI, 0, Math.PI * 2);
			ctx.fill();
		}
	}
	
	function addSprinklesTexture(ctx: CanvasRenderingContext2D) {
		const sprinkleColors = ['#FF5252', '#FFEB3B', '#2196F3', '#4CAF50', '#9C27B0'];
		for (let i = 0; i < 100; i++) {
			const x = Math.random() * canvasWidth;
			const y = Math.random() * canvasHeight;
			const color = sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)];
			ctx.fillStyle = color;
			
			// Draw small rounded rectangles for sprinkles
			const width = Math.random() * 8 + 4;
			const height = Math.random() * 3 + 2;
			const angle = Math.random() * Math.PI;
			
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(angle);
			ctx.fillRect(-width/2, -height/2, width, height);
			ctx.restore();
		}
	}
	
	// Add small decorations to path cells based on theme
	function addPathDecoration(ctx: CanvasRenderingContext2D, x: number, y: number, theme: string) {
		const centerX = x + cellSize/2;
		const centerY = y + cellSize/2;
		
		if (theme === 'space') {
			// Small planet
			ctx.fillStyle = 'rgba(100, 100, 255, 0.2)';
			ctx.beginPath();
			ctx.arc(centerX, centerY, cellSize/6, 0, Math.PI * 2);
			ctx.fill();
		} else if (theme === 'ocean') {
			// Small fish or shell
			ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
			ctx.beginPath();
			ctx.ellipse(centerX, centerY, cellSize/8, cellSize/12, Math.PI/4, 0, Math.PI * 2);
			ctx.fill();
		} else if (theme === 'jungle') {
			// Small leaf
			ctx.fillStyle = 'rgba(100, 200, 100, 0.3)';
			ctx.beginPath();
			ctx.ellipse(centerX, centerY, cellSize/10, cellSize/5, Math.PI/3, 0, Math.PI * 2);
			ctx.fill();
		} else if (theme === 'candy') {
			// Small candy
			ctx.fillStyle = 'rgba(255, 150, 200, 0.3)';
			ctx.beginPath();
			ctx.arc(centerX, centerY, cellSize/8, 0, Math.PI * 2);
			ctx.fill();
		}
	}
	
	// Draw a star shape for the goal
	function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) {
		let rot = Math.PI / 2 * 3;
		let x = cx;
		let y = cy;
		let step = Math.PI / spikes;

		ctx.beginPath();
		ctx.moveTo(cx, cy - outerRadius);
		
		for (let i = 0; i < spikes; i++) {
			x = cx + Math.cos(rot) * outerRadius;
			y = cy + Math.sin(rot) * outerRadius;
			ctx.lineTo(x, y);
			rot += step;

			x = cx + Math.cos(rot) * innerRadius;
			y = cy + Math.sin(rot) * innerRadius;
			ctx.lineTo(x, y);
			rot += step;
		}
		
		ctx.lineTo(cx, cy - outerRadius);
		ctx.closePath();
		ctx.fillStyle = '#FFEE58';
		ctx.fill();
		ctx.strokeStyle = '#FFA000';
		ctx.lineWidth = 2;
		ctx.stroke();
	}

	// Draws an animated character representing the player
	function drawPlayer(ctx: CanvasRenderingContext2D) {
		// Get theme colors
		const colors = getThemeColors();
		
		// Compute the center of the player's cell
		const x = wallThickness + displayedCol * (cellSize + wallThickness) + cellSize/2;
		const y = wallThickness + displayedRow * (cellSize + wallThickness) + cellSize/2;
		
		// Size of player
		const playerSize = cellSize * 0.7;
		
		// Draw player based on theme
		if (currentTheme === 'space') {
			// Draw spaceship
			ctx.fillStyle = colors.playerColor;
			ctx.beginPath();
			ctx.arc(x, y, playerSize/2, 0, Math.PI * 2);
			ctx.fill();
			
			// Add spaceship details
			ctx.fillStyle = '#FFF';
			ctx.beginPath();
			ctx.arc(x, y - playerSize/6, playerSize/6, 0, Math.PI * 2);
			ctx.fill();
		} else if (currentTheme === 'ocean') {
			// Draw fish
			ctx.fillStyle = colors.playerColor;
			ctx.beginPath();
			ctx.ellipse(x, y, playerSize/2, playerSize/3, 0, 0, Math.PI * 2);
			ctx.fill();
			
			// Add tail
			ctx.beginPath();
			ctx.moveTo(x + playerSize/2, y);
			ctx.lineTo(x + playerSize/2 + playerSize/4, y - playerSize/4);
			ctx.lineTo(x + playerSize/2 + playerSize/4, y + playerSize/4);
			ctx.closePath();
			ctx.fill();
			
			// Add eye
			ctx.fillStyle = 'white';
			ctx.beginPath();
			ctx.arc(x - playerSize/6, y - playerSize/8, playerSize/8, 0, Math.PI * 2);
			ctx.fill();
			
			ctx.fillStyle = 'black';
			ctx.beginPath();
			ctx.arc(x - playerSize/6, y - playerSize/8, playerSize/16, 0, Math.PI * 2);
			ctx.fill();
		} else if (currentTheme === 'jungle') {
			// Draw monkey
			ctx.fillStyle = colors.playerColor;
			ctx.beginPath();
			ctx.arc(x, y, playerSize/2, 0, Math.PI * 2);
			ctx.fill();
			
			// Add ears
			ctx.beginPath();
			ctx.arc(x - playerSize/3, y - playerSize/3, playerSize/6, 0, Math.PI * 2);
			ctx.arc(x + playerSize/3, y - playerSize/3, playerSize/6, 0, Math.PI * 2);
			ctx.fill();
			
			// Add face
			ctx.fillStyle = '#F5D0A9';
			ctx.beginPath();
			ctx.arc(x, y, playerSize/3, 0, Math.PI * 2);
			ctx.fill();
			
			// Add eyes
			ctx.fillStyle = 'black';
			ctx.beginPath();
			ctx.arc(x - playerSize/8, y - playerSize/8, playerSize/12, 0, Math.PI * 2);
			ctx.arc(x + playerSize/8, y - playerSize/8, playerSize/12, 0, Math.PI * 2);
			ctx.fill();
			
			// Add smile
			ctx.beginPath();
			ctx.arc(x, y + playerSize/12, playerSize/8, 0, Math.PI);
			ctx.stroke();
		} else if (currentTheme === 'candy') {
			// Draw lollipop character
			ctx.fillStyle = colors.playerColor;
			ctx.beginPath();
			ctx.arc(x, y - playerSize/6, playerSize/2, 0, Math.PI * 2);
			ctx.fill();
			
			// Add stick
			ctx.fillStyle = '#8D6E63';
			ctx.fillRect(x - playerSize/16, y + playerSize/6, playerSize/8, playerSize/2);
			
			// Add face
			ctx.fillStyle = 'white';
			ctx.beginPath();
			ctx.arc(x - playerSize/6, y - playerSize/4, playerSize/10, 0, Math.PI * 2);
			ctx.arc(x + playerSize/6, y - playerSize/4, playerSize/10, 0, Math.PI * 2);
			ctx.fill();
			
			ctx.fillStyle = 'black';
			ctx.beginPath();
			ctx.arc(x - playerSize/6, y - playerSize/4, playerSize/20, 0, Math.PI * 2);
			ctx.arc(x + playerSize/6, y - playerSize/4, playerSize/20, 0, Math.PI * 2);
			ctx.fill();
			
			// Add smile
			ctx.beginPath();
			ctx.arc(x, y, playerSize/6, 0.2, Math.PI - 0.2);
			ctx.stroke();
		} else {
			// Default player (backup)
			ctx.fillStyle = colors.playerColor;
			ctx.beginPath();
			ctx.arc(x, y, playerSize/2, 0, Math.PI * 2);
			ctx.fill();
		}
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
		const nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
		currentTheme = themes[nextIndex];
		draw();
	}
</script>

<!-- Colorful background for the game page -->
<div class="game-container {currentTheme}-theme">
	<h1 class="game-title">Math Maze Adventure!</h1>
	
	<!-- Theme selection button -->
	<button class="theme-button" on:click={changeTheme}>
		Change Theme
	</button>
	
	<!-- Wrap the canvas in a viewport container -->
	<div class="viewport">
		<canvas bind:this={canvas} style="transform: scale({zoom}) translate({offsetX}px, {offsetY}px);"></canvas>
		
		<!-- On-screen controls for touchscreens or younger kids -->
		{#if showControls}
			<div class="control-buttons">
				<button class="control-btn up-btn" on:click={() => movePlayer('up')}>↑</button>
				<div class="control-row">
					<button class="control-btn left-btn" on:click={() => movePlayer('left')}>←</button>
					<button class="control-btn right-btn" on:click={() => movePlayer('right')}>→</button>
				</div>
				<button class="control-btn down-btn" on:click={() => movePlayer('down')}>↓</button>
			</div>
		{/if}
		
		<!-- Invalid move indicator -->
		<div id="invalid-move" class="invalid-move">
			Can't go that way!
		</div>

		<!-- Math problem modal -->
		{#if showMathProblem && currentProblem}
			<div class="math-problem-modal">
				<div class="math-problem-content {currentTheme}-theme">
					<h2>Solve to Continue!</h2>
					<p class="question">{@html currentProblem.question}</p>

					{#if currentProblem.answer === 'ones' || currentProblem.answer === 'tens' || currentProblem.answer === 'hundreds' || currentProblem.answer === 'thousands'}
						<!-- Multiple choice for place value questions -->
						<div class="multiple-choice">
							<button
								class="choice-btn ones-btn"
								on:click={() => {
									userAnswer = 'ones';
									checkAnswer();
								}}
							>
								Ones
							</button>
							<button
								class="choice-btn tens-btn"
								on:click={() => {
									userAnswer = 'tens';
									checkAnswer();
								}}
							>
								Tens
							</button>
							<button
								class="choice-btn hundreds-btn"
								on:click={() => {
									userAnswer = 'hundreds';
									checkAnswer();
								}}
							>
								Hundreds
							</button>
							<button
								class="choice-btn thousands-btn"
								on:click={() => {
									userAnswer = 'thousands';
									checkAnswer();
								}}
							>
								Thousands
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
							<button class="submit-btn" on:click={checkAnswer}>Submit</button>
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
				</div>
			</div>
		{/if}
		
		<!-- Celebration overlay when reaching the goal -->
		{#if showCelebration}
			<div class="celebration">
				<div class="celebration-content">
					<h2>You Did It!</h2>
					<div class="stars">
						<div class="star">⭐</div>
						<div class="star">⭐</div>
						<div class="star">⭐</div>
					</div>
					<p>Great job solving the maze!</p>
					<button class="new-game-btn" on:click={() => window.location.reload()}>
						Play Again
					</button>
				</div>
			</div>
		{/if}
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
		background: linear-gradient(135deg, #1A237E, #0277BD, #00BCD4);
		color: white;
	}
	
	.jungle-theme {
		background: linear-gradient(135deg, #004D40, #00796B, #8BC34A);
		color: white;
	}
	
	.candy-theme {
		background: linear-gradient(135deg, #880E4F, #C2185B, #F06292);
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
		0% { color: #ff5757; }
		15% { color: #ffbd59; }
		30% { color: #ffff47; }
		45% { color: #7cff73; }
		60% { color: #67d7ff; }
		75% { color: #ae86ff; }
		90% { color: #ff65e0; }
		100% { color: #ff5757; }
	}
	
	/* Theme button */
	.theme-button {
		background-color: #FFEB3B;
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
		width: 85vw;
		height: 70vh;
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
		background-color: #F44336;
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

	/* Math problem modal */
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
		backdrop-filter: blur(5px);
	}

	.math-problem-content {
		background-color: white;
		padding: 2rem;
		border-radius: 20px;
		width: 90%;
		max-width: 500px;
		text-align: center;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		border: 6px solid #9C27B0;
		position: relative;
		overflow: hidden;
	}
	
	/* Different theme styles for math problem modals */
	.math-problem-content.space-theme {
		border-color: #3F51B5;
		background-color: #E8EAF6;
	}
	
	.math-problem-content.ocean-theme {
		border-color: #0288D1;
		background-color: #E1F5FE;
	}
	
	.math-problem-content.jungle-theme {
		border-color: #388E3C;
		background-color: #E8F5E9;
	}
	
	.math-problem-content.candy-theme {
		border-color: #D81B60;
		background-color: #FCE4EC;
	}
	
	.math-problem-content h2 {
		font-size: 1.8rem;
		margin-bottom: 1rem;
		color: #673AB7;
	}
	
	.math-problem-content.space-theme h2 { color: #3F51B5; }
	.math-problem-content.ocean-theme h2 { color: #0288D1; }
	.math-problem-content.jungle-theme h2 { color: #388E3C; }
	.math-problem-content.candy-theme h2 { color: #D81B60; }

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
		0% { transform: scale(1); }
		100% { transform: scale(1.2); }
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
		border-radius: 50px;
		border: none;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		font-family: 'Comic Sans MS', cursive, sans-serif;
	}
	
	.ones-btn { background-color: #FFC107; color: #333; }
	.tens-btn { background-color: #4CAF50; color: white; }
	.hundreds-btn { background-color: #2196F3; color: white; }
	.thousands-btn { background-color: #9C27B0; color: white; }
	
	.choice-btn:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
	}
	
	.choice-btn:active {
		transform: translateY(1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	input {
		padding: 0.75rem 1rem;
		font-size: 1.2rem;
		border: 3px solid #9C27B0;
		border-radius: 50px;
		outline: none;
		text-align: center;
		width: 150px;
		font-family: 'Comic Sans MS', cursive, sans-serif;
	}
	
	.space-theme input { border-color: #3F51B5; }
	.ocean-theme input { border-color: #0288D1; }
	.jungle-theme input { border-color: #388E3C; }
	.candy-theme input { border-color: #D81B60; }
	
	input:focus {
		box-shadow: 0 0 0 3px rgba(156, 39, 176, 0.3);
	}

	.submit-btn {
		padding: 0.75rem 1.5rem;
		background-color: #9C27B0;
		color: white;
		border: none;
		border-radius: 50px;
		cursor: pointer;
		font-size: 1.2rem;
		font-weight: bold;
		transition: all 0.2s ease;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
		font-family: 'Comic Sans MS', cursive, sans-serif;
	}
	
	.space-theme .submit-btn { background-color: #3F51B5; }
	.ocean-theme .submit-btn { background-color: #0288D1; }
	.jungle-theme .submit-btn { background-color: #388E3C; }
	.candy-theme .submit-btn { background-color: #D81B60; }
	
	.submit-btn:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
	}
	
	.submit-btn:active {
		transform: translateY(1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
		from { opacity: 0; transform: translateY(10px); }
		to { opacity: 1; transform: translateY(0); }
	}

	.correct {
		color: white;
		background-color: #4CAF50;
	}

	.incorrect {
		color: white;
		background-color: #F44336;
	}
	
	.emoji {
		font-size: 1.5rem;
		display: inline-block;
		animation: bounce 0.5s infinite alternate;
	}
	
	@keyframes bounce {
		from { transform: translateY(0); }
		to { transform: translateY(-5px); }
	}
	
	/* Celebration overlay */
	.celebration {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 20;
		animation: fadeIn 0.5s;
		backdrop-filter: blur(5px);
	}
	
	.celebration-content {
		background: linear-gradient(135deg, #FF9800, #F44336);
		padding: 2rem;
		border-radius: 20px;
		text-align: center;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
		color: white;
		border: 6px solid #FFC107;
		max-width: 400px;
		width: 90%;
	}
	
	.celebration-content h2 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		animation: celebrate 1s infinite alternate;
	}
	
	@keyframes celebrate {
		0% { transform: scale(1); }
		100% { transform: scale(1.1); }
	}
	
	.stars {
		display: flex;
		justify-content: center;
		margin: 1rem 0;
	}
	
	.star {
		font-size: 3rem;
		margin: 0 0.5rem;
		animation: spin 2s infinite linear;
	}
	
	.star:nth-child(2) {
		animation-delay: 0.3s;
	}
	
	.star:nth-child(3) {
		animation-delay: 0.6s;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg) scale(1); }
		50% { transform: rotate(180deg) scale(1.2); }
		100% { transform: rotate(360deg) scale(1); }
	}
	
	.celebration-content p {
		font-size: 1.3rem;
		margin-bottom: 1.5rem;
	}
	
	.new-game-btn {
		background-color: #FFEB3B;
		color: #333;
		border: none;
		border-radius: 50px;
		padding: 0.75rem 1.5rem;
		font-size: 1.2rem;
		font-weight: bold;
		cursor: pointer;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
		transition: all 0.2s ease;
		font-family: 'Comic Sans MS', cursive, sans-serif;
	}
	
	.new-game-btn:hover {
		transform: translateY(-3px);
		box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
	}
	
	.new-game-btn:active {
		transform: translateY(1px);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
		
		.math-problem-content {
			width: 90%;
			padding: 1.5rem;
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
		
		.choice-btn {
			width: 180px;
		}
		
		.math-problem-content h2 {
			font-size: 1.5rem;
		}
		
		.question {
			font-size: 1.2rem;
		}
		
		.celebration-content h2 {
			font-size: 2rem;
		}
	}
</style>