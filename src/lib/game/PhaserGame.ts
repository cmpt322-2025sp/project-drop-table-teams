import Phaser from 'phaser';
import type { Cell } from '$lib/Maze';
import { theme } from '$lib/stores/theme';
import { MazeScene } from './MazeScene';

/**
 * Main Phaser game class for Math Maze
 */
export class PhaserGame {
  private game: Phaser.Game | null = null;
  private config: Phaser.Types.Core.GameConfig;
  private parentElement: HTMLElement;
  private mazeScene: MazeScene;
  private unsubscribe: () => void;
  
  constructor(parentElement: HTMLElement) {
    this.parentElement = parentElement;
    this.mazeScene = new MazeScene();
    
    // Default game configuration
    this.config = {
      type: Phaser.AUTO,
      parent: parentElement,
      width: 800,
      height: 600,
      backgroundColor: '#2c3e50',
      scene: [this.mazeScene],
      physics: {
        default: 'arcade',
        arcade: {
          debug: false
        }
      },
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };
    
    // Subscribe to theme changes
    this.unsubscribe = theme.subscribe((value) => {
      this.updateTheme(value);
    });
  }
  
  /**
   * Initialize and start the Phaser game
   */
  init(): void {
    if (this.game) {
      console.warn('Game already initialized');
      return;
    }
    
    this.game = new Phaser.Game(this.config);
  }
  
  /**
   * Clean up game resources
   */
  destroy(): void {
    if (this.game) {
      this.game.destroy(true);
      this.game = null;
    }
    
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
  
  /**
   * Set the maze data for the game
   * @param maze The maze grid
   * @param goal The goal cell
   */
  setMaze(maze: Cell[][], goal: Cell): void {
    if (this.mazeScene) {
      this.mazeScene.setMaze(maze, goal);
    }
  }
  
  /**
   * Update the game appearance based on theme
   * @param themeName Current theme name
   */
  private updateTheme(themeName: string): void {
    if (!this.game) return;
    
    if (this.mazeScene) {
      this.mazeScene.setTheme(themeName);
    }
  }
  
  /**
   * Resize the game to fit the container
   * @param width New width
   * @param height New height
   */
  resize(width: number, height: number): void {
    if (!this.game) return;
    
    this.game.scale.resize(width, height);
  }
}