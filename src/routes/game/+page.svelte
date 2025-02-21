<script lang="ts">
  import { onMount } from 'svelte';
  import { generateMaze } from '$lib/Maze';
  import type { Cell } from '$lib/Maze';
  
  // Maze settings
  const rows = 10;
  const cols = 10;
  const cellSize = 40;
  const wallThickness = 40;

  let maze: Cell[][] = [];
  let canvas: HTMLCanvasElement;

  // Assume player's current position for testing.
  let playerRow = Math.floor(rows / 2);
  let playerCol = Math.floor(cols / 2);

  onMount(() => {
    maze = generateMaze(rows, cols);
    drawMaze();
  });

  function drawMaze() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate overall canvas dimensions.
    // There will be an extra wall on each boundry:
    const canvasWidth = cols * cellSize + (cols + 1) * wallThickness
    const canvasHeight = rows * cellSize + (rows + 1) * wallThickness
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
  }
</script>

<style>
  canvas {
    width: 100%;
    height: auto;
    border: 1px solid #333;
  }
</style>

<canvas bind:this={canvas}></canvas>
