<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { generateMaze } from '$lib/Maze';
	import type { Cell } from '$lib/Maze';

	// Maze settings
	const rows = 10;
	const cols = 10;
	const cellSize = 40; // Path size in pixels
	const wallThickness = 40;

	let maze: Cell[][] = [];
	let canvas: HTMLCanvasElement;

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
			maze = generateMaze(rows, cols);
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

		// Draw each cell's path (white rectangle).
		ctx.fillStyle = 'white';
		for (let r = 0; r < rows; r++) {
			for (let c = 0; c < cols; c++) {
				const x = wallThickness + c * (cellSize + wallThickness);
				const y = wallThickness + r * (cellSize + wallThickness);
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

	// Handle arrow keys or WASD key presses to move the player.
	function handleKeyDown(e: KeyboardEvent) {
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
			targetRow = newRow;
			targetCol = newCol;

			// Start animating if not already.
			if (!animating) {
				animating = true;
				requestAnimationFrame(animate);
			}
		}
	}
</script>

<!-- Wrap the canvas in a viewport container -->
<div class="viewport">
	<canvas bind:this={canvas} style="transform: scale({zoom}) translate({offsetX}px, {offsetY}px);"
	></canvas>
</div>

<style>
	.viewport {
		width: 80vw;
		height: 80vh;
		overflow: hidden;
		border: 2px solid #333;
		margin: auto;
	}
	canvas {
		transform-origin: top left;
	}
</style>
