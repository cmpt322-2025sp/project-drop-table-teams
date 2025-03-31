<script context="module" lang="ts">
  import type { Game, Scene } from "phaser";
  import type { MazeScene } from "./MazeScene";

  export type TPhaserRef = {
    game: Phaser.Game | null,
    scene: MazeScene | null
  };
</script>

<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { PhaserGame } from "./PhaserGame";
  import { EventBus, type MazeSceneReadyEvent } from './EventBus';
  import type { Cell } from '$lib/Maze';

  // Expose the game and scene references to parent components
  export let phaserRef: TPhaserRef = {
    game: null,
    scene: null
  };

  // Callback when scene is ready and active
  export let onSceneReady: ((scene: MazeScene) => void) | undefined = undefined;
  
  // Container element reference
  let gameContainer: HTMLDivElement;
  
  // Game instance
  let gameInstance: PhaserGame;
  
  onMount(() => {
    // Initialize Phaser game
    gameInstance = new PhaserGame(gameContainer);
    gameInstance.init();
    
    // Store reference to the game
    if (gameInstance.game) {
      phaserRef.game = gameInstance.game;
    }
    
    // Listen for scene ready event
    EventBus.on('maze-scene-ready', (data: MazeSceneReadyEvent) => {
      phaserRef.scene = data.scene;
      
      if (onSceneReady) {
        onSceneReady(data.scene);
      }
    });
    
    // Handle resize events
    const handleResize = () => {
      if (gameInstance && gameContainer) {
        gameInstance.resize(gameContainer.clientWidth, gameContainer.clientHeight);
      }
    };
    
    // Initial resize
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  });
  
  onDestroy(() => {
    // Clean up game resources
    if (gameInstance) {
      gameInstance.destroy();
    }
  });
  
  // Method to set maze data
  export function setMaze(maze: Cell[][], goal: Cell): void {
    if (gameInstance) {
      gameInstance.setMaze(maze, goal);
    }
    
    // If the scene is already available, set the maze directly
    if (phaserRef.scene) {
      phaserRef.scene.setMaze(maze, goal);
    }
  }
</script>

<div class="phaser-container" bind:this={gameContainer}>
  <!-- Phaser will render here -->
</div>

<style>
  .phaser-container {
    width: 100%;
    height: 100%;
    overflow: hidden;
    border-radius: inherit; /* Inherit border radius from parent */
  }
  
  /* This ensures Phaser canvas inherits border radius */
  :global(.phaser-container canvas) {
    border-radius: inherit;
  }
</style>