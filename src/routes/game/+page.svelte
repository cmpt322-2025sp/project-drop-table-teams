<script lang="ts">
  import { onMount } from 'svelte';
  import { generateMaze } from '$lib/Maze';
  import type { Cell } from '$lib/Maze';
  

  let maze: Cell[][] = [];
  const rows = 10;
  const cols = 10;

  // Assume player's current position for testing.
  let playerRow = Math.floor(rows / 2);
  let playerCol = Math.floor(cols / 2);

  onMount(() => {
    maze = generateMaze(rows, cols);
  });

  // Calculate offset to center the player in the viewport
  const cellSize = 30;
  const scale = 8 // Zoom factor
  const viewportWidth = window.innerWidth * 0.8;
  const viewportHeight = window.innerHeight * 0.8;

  // Calculate the absolute pixel offset of the player.
  const playerX = playerCol * cellSize;
  const playerY = playerRow * cellSize;

  // Calculate the tranform offet to center the player.
  const offsetX = (viewportWidth / 2 - playerX * scale);
  const offsetY = (viewportHeight / 2 - playerY * scale);
</script>

<style>
  .viewport {
    width: 80vw;
    height: 80vw;
    overflow: hidden;
    border: 2px solid #333;
    position: relative;
    margin: auto;
  }

  .maze {
    display: grid;
    grid-template-columns: repeat(10, 30px);
    gap: 0;
    transform-origin: top left;
    transform: scale({scale}) translate({offsetX / scale}px, {offsetY / scale}px);
  }

  .cell {
    width: 30px;
    height: 30px;
    position: relative;
  }

  .wall {
    position: absolute;
    background: black;
  }

  .top {
    top: 0;
    left: 0;
    height: 2px;
    width: 100%;
  }

  .right {
    top: 0;
    right: 0;
    width: 2px;
    height: 100%;
  }

  .bottom {
    bottom: 0;
    left: 0;
    height: 2px;
    width: 100%;
  }

  .left {
    top: 0;
    left: 0;
    width: 2px;
    height: 100%;
  }
</style>

<div class="viewport">
  <div
    class="maze"
    style="transform: scale({scale}) translate({offsetX / scale}px, {offsetY / scale}px);"
  >
    {#each maze as row}
      {#each row as cell}
        <div class="cell">
          {#if cell.walls.top}
            <div class="wall top"></div>
          {/if}
          {#if cell.walls.right}
            <div class="wall right"></div>
          {/if}
          {#if cell.walls.bottom}
            <div class="wall bottom"></div>
          {/if}
          {#if cell.walls.left}
            <div class="wall left"></div>
          {/if}
        </div>
      {/each}
    {/each}
  </div>
</div>
