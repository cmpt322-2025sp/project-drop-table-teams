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

  // Zoom setting: this is how much we want to zoom into the maze.
  const zoom = 3;

  // We'll compute offsets based on the full canvas dimensions.
  let canvasWidth = 0;
  let canvasHeight = 0;
  // These wil be used in the transform style.
  let offsetX = 0;
  let offsetY = 0;

  onMount(() => {
    maze = generateMaze(rows, cols);
    drawMaze();
    updateTransform();
  });

  function drawMaze() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate overall canvas dimensions.
    // There will be an extra wall on each boundry:
    canvasWidth = cols * cellSize + (cols + 1) * wallThickness
    canvasHeight = rows * cellSize + (rows + 1) * wallThickness
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

  function updateTransform() {
    // Compute the center of the player's cell in the full maze (in canvas pixels).
    // We add half the cell's width/height to center within the cell.
    const playerCenterX =
      wallThickness + playerCol * (cellSize + wallThickness) + cellSize / 2;
    const playerCenterY =
      wallThickness + playerRow * (cellSize + wallThickness) + cellSize / 2;

    // Define the viewport dimensions. Here we use 80% of the window dimensions.
    const viewportWidth = window.innerWidth * 0.8;
    const viewportHeight = window.innerHeight * 0.8;

    // To center the player in the viewport computer the offset needed.
    // Note: Because we apply a scale transform, we need to divide the offset
    // by the zoom factor.
    offsetX = (viewportWidth / 2 - playerCenterX * zoom) / zoom;
    offsetY = (viewportHeight / 2 - playerCenterY * zoom) / zoom;
  }
</script>

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

<!-- Wrap the canvas in a viewport container -->
<div class="viewport">
  <canvas
    bind:this={canvas}
    style="transform: scale({zoom}) translate({offsetX}px, {offsetY}px);"
  ></canvas>
</div>

