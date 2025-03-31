import Phaser from 'phaser';
import type { Cell } from '$lib/Maze';

/**
 * Phaser scene that handles the maze gameplay
 */
export class MazeScene extends Phaser.Scene {
  // Maze properties
  private maze: Cell[][] = [];
  private goalCell: Cell | null = null;
  private cellSize: number = 70;
  private wallThickness: number = 10;
  
  // Player properties
  private player: Phaser.GameObjects.Sprite | null = null;
  private targetRow: number = 0;
  private targetCol: number = 0;
  private displayedRow: number = 0;
  private displayedCol: number = 0;
  
  // Theme properties
  private currentTheme: string = 'space';
  
  constructor() {
    super({ key: 'MazeScene' });
  }
  
  preload(): void {
    // Preload maze assets
    // this.load.image('player', 'images/player.png');
    // We'll add more assets as we implement the game
  }
  
  create(): void {
    // Initialize scene
    this.createMazeGraphics();
    this.setupInput();
  }
  
  update(time: number, delta: number): void {
    // Game loop logic
    this.updatePlayerPosition(delta);
  }
  
  /**
   * Set the maze data for the scene
   * @param maze The maze grid
   * @param goal The goal cell
   */
  setMaze(maze: Cell[][], goal: Cell): void {
    this.maze = maze;
    this.goalCell = goal;
    
    // Reset player position to center of maze
    const rows = maze.length;
    const cols = maze[0].length;
    
    this.targetRow = Math.floor(rows / 2);
    this.targetCol = Math.floor(cols / 2);
    this.displayedRow = this.targetRow;
    this.displayedCol = this.targetCol;
    
    // Recreate maze graphics if the scene is already running
    if (this.scene.isActive()) {
      this.createMazeGraphics();
    }
  }
  
  /**
   * Set the current theme
   * @param theme The theme name
   */
  setTheme(theme: string): void {
    this.currentTheme = theme;
    
    // Update visuals if scene is active
    if (this.scene.isActive()) {
      this.createMazeGraphics();
    }
  }
  
  /**
   * Create the graphical representation of the maze
   * This is a placeholder - we'll implement the real rendering later
   */
  private createMazeGraphics(): void {
    // Clear previous graphics
    this.children.removeAll();
    
    // Create a placeholder rectangle for now
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2c3e50);
    graphics.fillRect(0, 0, 800, 600);
    
    // Add placeholder text
    this.add.text(400, 300, 'Maze Scene\nComing Soon', {
      fontFamily: 'Arial',
      fontSize: '32px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    // Create a placeholder player
    this.player = this.add.sprite(400, 350, 'player');
  }
  
  /**
   * Setup keyboard input for player movement
   */
  private setupInput(): void {
    // Setup arrow key input
    this.input.keyboard?.on('keydown-UP', () => this.movePlayer('up'));
    this.input.keyboard?.on('keydown-DOWN', () => this.movePlayer('down'));
    this.input.keyboard?.on('keydown-LEFT', () => this.movePlayer('left'));
    this.input.keyboard?.on('keydown-RIGHT', () => this.movePlayer('right'));
    
    // WASD keys
    this.input.keyboard?.on('keydown-W', () => this.movePlayer('up'));
    this.input.keyboard?.on('keydown-S', () => this.movePlayer('down'));
    this.input.keyboard?.on('keydown-A', () => this.movePlayer('left'));
    this.input.keyboard?.on('keydown-D', () => this.movePlayer('right'));
  }
  
  /**
   * Move the player in the specified direction
   * @param direction The direction to move
   */
  private movePlayer(direction: 'up' | 'down' | 'left' | 'right'): void {
    // Placeholder movement logic - will be implemented in future steps
    console.log(`Moving player ${direction}`);
  }
  
  /**
   * Update player position during animation
   * @param delta Time elapsed since last frame
   */
  private updatePlayerPosition(delta: number): void {
    // Placeholder animation logic - will be implemented in future steps
    if (this.player) {
      // Spin the player as a placeholder animation
      this.player.angle += 1;
    }
  }
}