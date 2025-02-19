<script lang="ts">
  import { onMount } from 'svelte';
  import { generateMaze, Cell } from './Maze';

  let maze: Cell[][] = [];
  const rows = 10;
  const cols = 10;

  onMount(() => {
    maze = generateMaze(rows, cols);
  });
</script>

<style>
  .maze {
    display: grid;
    grid-template-columns: repeat(10, 30px);
    gap: 0;
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

<div class="maze">
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

