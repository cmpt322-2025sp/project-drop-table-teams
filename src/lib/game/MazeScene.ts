import Phaser from 'phaser';
import type { Cell } from '$lib/Maze';
import { EventBus } from './EventBus';

/**
 * Phaser scene that handles the maze gameplay
 */
export class MazeScene extends Phaser.Scene {
  // Maze properties
  private maze: Cell[][] = [];
  private goalCell: Cell | null = null;
  private cellSize: number = 70;
  private wallThickness: number = 40;
  
  // Graphics objects
  private mazeGraphics: Phaser.GameObjects.Graphics | null = null;
  private playerGraphics: Phaser.GameObjects.Graphics | null = null;
  
  // Player properties
  private targetRow: number = 0;
  private targetCol: number = 0;
  private displayedRow: number = 0;
  private displayedCol: number = 0;
  
  // Theme properties
  private currentTheme: string = '';
  
  // Camera and world size
  private worldWidth: number = 0;
  private worldHeight: number = 0;
  
  constructor() {
    super({ key: 'MazeScene' });
  }
  
  preload(): void {
    // No assets needed for now, we'll use basic shapes
    
    // Get the initial theme from the theme store
    import('$lib/stores/theme').then(({ theme }) => {
      let initialTheme = '';
      const unsubscribe = theme.subscribe(value => {
        initialTheme = value;
        this.setTheme(value);
      });
      unsubscribe();
    }).catch(err => console.error('Failed to load theme store:', err));
  }
  
  create(): void {
    // Create graphics objects
    this.mazeGraphics = this.add.graphics();
    this.playerGraphics = this.add.graphics();
    
    // Setup camera and world bounds
    this.setupCamera();
    
    // Create initial maze graphics
    this.createMazeGraphics();
    
    // Setup input handling
    this.setupInput();
    
    // Emit event to notify Svelte that scene is ready
    EventBus.emit('maze-scene-ready', this);
  }
  
  update(time: number, delta: number): void {
    // Game loop logic - will update player position in future steps
  }
  
  /**
   * Set up camera and world bounds
   */
  private setupCamera(): void {
    if (this.maze.length === 0) return;
    
    // Calculate world size based on maze dimensions
    const rows = this.maze.length;
    const cols = this.maze[0].length;
    
    this.worldWidth = cols * this.cellSize + (cols + 1) * this.wallThickness;
    this.worldHeight = rows * this.cellSize + (rows + 1) * this.wallThickness;
    
    // Set world bounds
    this.physics.world.setBounds(0, 0, this.worldWidth, this.worldHeight);
    
    // Enable camera to move beyond game dimensions
    this.cameras.main.setBounds(0, 0, this.worldWidth, this.worldHeight);
    
    // Center camera on the player's starting position
    const centerX = this.wallThickness + this.targetCol * (this.cellSize + this.wallThickness) + this.cellSize / 2;
    const centerY = this.wallThickness + this.targetRow * (this.cellSize + this.wallThickness) + this.cellSize / 2;
    this.cameras.main.centerOn(centerX, centerY);
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
      this.setupCamera();
      this.createMazeGraphics();
    }
  }
  
  /**
   * Set the current theme
   * @param theme The theme name
   */
  setTheme(theme: string): void {
    if (!theme) return; // Ignore empty theme values
    
    this.currentTheme = theme;
    console.log('Setting theme to:', theme);
    
    // Always update the visuals when theme changes
    // The scene.isActive check can cause issues during initialization
    this.createMazeGraphics();
    
    // Emit an event that the theme has been updated
    EventBus.emit('theme-updated', { theme });
  }
  
  /**
   * Get theme colors based on current theme
   * @returns Object with color values
   */
  private getThemeColors(): {
    wallColor: number;
    pathColor: number;
    goalColor: number;
    mathProblemColor: number;
    solvedColor: number;
    playerColor: number;
  } {
    switch (this.currentTheme) {
      case 'space':
        return {
          wallColor: 0x2C3E50,
          pathColor: 0xF9FAFB,
          goalColor: 0xFFD700,
          mathProblemColor: 0x9B59B6,
          solvedColor: 0x3498DB,
          playerColor: 0xE74C3C
        };
      case 'ocean':
        return {
          wallColor: 0x1E88E5,
          pathColor: 0xE3F2FD,
          goalColor: 0xFFEB3B,
          mathProblemColor: 0x26A69A,
          solvedColor: 0x66BB6A,
          playerColor: 0xFF7043
        };
      case 'jungle':
        return {
          wallColor: 0x33691E,
          pathColor: 0xDCEDC8,
          goalColor: 0xFFC107,
          mathProblemColor: 0xFF9800,
          solvedColor: 0x8BC34A,
          playerColor: 0x7B1FA2
        };
      case 'candy':
        return {
          wallColor: 0xE91E63,
          pathColor: 0xFCE4EC,
          goalColor: 0xFFEB3B,
          mathProblemColor: 0xAB47BC,
          solvedColor: 0x26C6DA,
          playerColor: 0x7CB342
        };
      default:
        return {
          wallColor: 0x2C3E50,
          pathColor: 0xF9FAFB,
          goalColor: 0xFFD700,
          mathProblemColor: 0x9B59B6,
          solvedColor: 0x3498DB,
          playerColor: 0xE74C3C
        };
    }
  }
  
  /**
   * Create the graphical representation of the maze
   */
  private createMazeGraphics(): void {
    // Early exit if no maze data or graphics
    if (this.maze.length === 0 || !this.mazeGraphics || !this.playerGraphics) return;
    
    // If no theme is set yet, we'll use a default theme
    if (!this.currentTheme) {
      import('$lib/stores/theme').then(({ theme }) => {
        let initialTheme = '';
        const unsubscribe = theme.subscribe(value => {
          initialTheme = value;
          this.setTheme(value);
        });
        unsubscribe();
      }).catch(err => {
        console.error('Failed to load theme store:', err);
        // Use space theme as default
        this.currentTheme = 'space';
        this.createMazeGraphics();
      });
      return; // Wait for theme to be set
    }
    
    // Clear previous graphics
    this.mazeGraphics.clear();
    this.playerGraphics.clear();
    
    const colors = this.getThemeColors();
    const rows = this.maze.length;
    const cols = this.maze[0].length;
    
    // Draw the entire canvas filled with walls
    this.mazeGraphics.fillStyle(colors.wallColor, 1);
    this.mazeGraphics.fillRect(0, 0, this.worldWidth, this.worldHeight);
    
    // Draw each cell path
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.maze[r][c];
        const x = this.wallThickness + c * (this.cellSize + this.wallThickness);
        const y = this.wallThickness + r * (this.cellSize + this.wallThickness);
        
        // Choose cell color based on cell type
        if (cell.isGoal) {
          this.mazeGraphics.fillStyle(colors.goalColor, 1);
          
          // Draw the cell
          this.mazeGraphics.fillRect(x, y, this.cellSize, this.cellSize);
          
          // Add a simple star shape for the goal
          this.mazeGraphics.fillStyle(0xFFFFFF, 0.8);
          // Draw a star as a simple polygon
          const centerX = x + this.cellSize / 2;
          const centerY = y + this.cellSize / 2;
          const radius = this.cellSize * 0.3;
          
          // Draw a simple star using lines
          const points = [];
          for (let i = 0; i < 5; i++) {
            // Outer point
            const angle1 = Math.PI / 2 + i * 2 * Math.PI / 5;
            points.push({
              x: centerX + radius * Math.cos(angle1),
              y: centerY + radius * Math.sin(angle1)
            });
            
            // Inner point
            const angle2 = Math.PI / 2 + (i + 0.5) * 2 * Math.PI / 5;
            points.push({
              x: centerX + radius * 0.4 * Math.cos(angle2),
              y: centerY + radius * 0.4 * Math.sin(angle2)
            });
          }
          
          this.mazeGraphics.beginPath();
          this.mazeGraphics.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length; i++) {
            this.mazeGraphics.lineTo(points[i].x, points[i].y);
          }
          this.mazeGraphics.closePath();
          this.mazeGraphics.fillPath();
          
        } else if (cell.isIntersection && !cell.mathProblemSolved) {
          this.mazeGraphics.fillStyle(colors.mathProblemColor, 1);
          this.mazeGraphics.fillRect(x, y, this.cellSize, this.cellSize);
          
          // Add a question mark
          this.add.text(
            x + this.cellSize / 2,
            y + this.cellSize / 2,
            '?',
            {
              font: `bold ${this.cellSize / 2}px Arial`,
              color: '#ffffff'
            }
          ).setOrigin(0.5);
          
        } else if (cell.isIntersection && cell.mathProblemSolved) {
          this.mazeGraphics.fillStyle(colors.solvedColor, 1);
          this.mazeGraphics.fillRect(x, y, this.cellSize, this.cellSize);
          
          // Add a checkmark
          this.add.text(
            x + this.cellSize / 2,
            y + this.cellSize / 2,
            '✓',
            {
              font: `bold ${this.cellSize / 2}px Arial`,
              color: '#ffffff'
            }
          ).setOrigin(0.5);
          
        } else {
          this.mazeGraphics.fillStyle(colors.pathColor, 1);
          this.mazeGraphics.fillRect(x, y, this.cellSize, this.cellSize);
        }
      }
    }
    
    // Draw passages (remove walls between connected cells)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.maze[r][c];
        const x = this.wallThickness + c * (this.cellSize + this.wallThickness);
        const y = this.wallThickness + r * (this.cellSize + this.wallThickness);
        
        // Remove right wall if necessary
        if (!cell.walls.right && c < cols - 1) {
          const nextCell = this.maze[r][c + 1];
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
          
          this.mazeGraphics.fillStyle(color, 1);
          this.mazeGraphics.fillRect(
            x + this.cellSize,
            y,
            this.wallThickness,
            this.cellSize
          );
        }
        
        // Remove bottom wall if necessary
        if (!cell.walls.bottom && r < rows - 1) {
          const nextCell = this.maze[r + 1][c];
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
          
          this.mazeGraphics.fillStyle(color, 1);
          this.mazeGraphics.fillRect(
            x,
            y + this.cellSize,
            this.cellSize,
            this.wallThickness
          );
        }
      }
    }
    
    // Draw player
    this.drawPlayer();
  }
  
  /**
   * Draw the player character
   */
  private drawPlayer(): void {
    if (!this.playerGraphics) return;
    
    const colors = this.getThemeColors();
    
    // Compute player position in pixels
    const x = this.wallThickness + this.displayedCol * (this.cellSize + this.wallThickness) + this.cellSize / 2;
    const y = this.wallThickness + this.displayedRow * (this.cellSize + this.wallThickness) + this.cellSize / 2;
    
    // Clear previous player
    this.playerGraphics.clear();
    
    // Draw player based on theme
    const playerSize = this.cellSize * 0.6;
    
    // Use a simple circle for all themes initially
    this.playerGraphics.fillStyle(colors.playerColor, 1);
    this.playerGraphics.fillCircle(x, y, playerSize / 2);
    
    // Center camera on player
    this.cameras.main.centerOn(x, y);
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
  movePlayer(direction: 'up' | 'down' | 'left' | 'right'): void {
    // Placeholder movement logic - will be implemented in future steps
    console.log(`Moving player ${direction}`);
    
    // Emit event for Svelte components to react to
    EventBus.emit('player-moved', { direction });
  }
}