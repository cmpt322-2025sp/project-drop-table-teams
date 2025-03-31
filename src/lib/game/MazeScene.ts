import Phaser from 'phaser';
import type { Cell } from '$lib/Maze';
import { EventBus, type PlayerMovedEvent, type InvalidMoveEvent, 
  type ShowMathProblemEvent, type GoalReachedEvent, type ThemeUpdatedEvent } from './EventBus';

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
    
    // Create initial maze graphics - this will handle the background too
    this.createMazeGraphics();
    
    // Setup input handling
    this.setupInput();
    
    // Emit event to notify Svelte that scene is ready
    const sceneReadyEvent = { scene: this };
    EventBus.emit('maze-scene-ready', sceneReadyEvent);
  }
  
  /**
   * Create a background that matches the current theme
   */
  private createThemeBackground(): void {
    // We need to create a background that extends beyond the maze bounds
    // to fill the entire visible area
    
    // Clear any existing background graphics first - safely check if children exists
    if (this.children && typeof this.children.getAll === 'function') {
      this.children.getAll().forEach(child => {
        if (child && child.name === 'theme-background') {
          child.destroy();
        }
      });
    }
    
    // Calculate dimensions safely
    let worldWidth = 2000; 
    let worldHeight = 2000;
    
    if (this.cameras && this.cameras.main) {
      worldWidth = this.cameras.main.width * 2 || 2000;
      worldHeight = this.cameras.main.height * 2 || 2000;
    }
    
    // Get the theme colors
    const colors = this.getThemeColors();
    
    // Create a background graphics object
    const bg = this.add.graphics();
    bg.name = 'theme-background'; // Set a name for later reference
    
    // Fill with the theme background color with reduced opacity to make maze visible
    bg.fillStyle(colors.backgroundColor, 0.2);
    bg.fillRect(0, 0, worldWidth, worldHeight);
    
    // Set to the back of the display list so it doesn't overlap other elements
    bg.setDepth(-100);
    
    // Add theme-specific decorative elements depending on the theme
    if (this.currentTheme === 'space') {
      this.addSpaceBackgroundElements(bg);
    } else if (this.currentTheme === 'ocean') {
      this.addOceanBackgroundElements(bg);
    } else if (this.currentTheme === 'jungle') {
      this.addJungleBackgroundElements(bg);
    } else if (this.currentTheme === 'candy') {
      this.addCandyBackgroundElements(bg);
    }
  }
  
  /**
   * Add space-themed background elements
   * @param bg Background graphics object
   */
  private addSpaceBackgroundElements(bg: Phaser.GameObjects.Graphics): void {
    // Add stars in the background
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
      const x = Phaser.Math.Between(-this.cameras.main.width, this.cameras.main.width * 2);
      const y = Phaser.Math.Between(-this.cameras.main.height, this.cameras.main.height * 2);
      const size = Phaser.Math.Between(1, 3);
      
      // Draw a star
      bg.fillStyle(0xFFFFFF, Phaser.Math.FloatBetween(0.3, 1));
      bg.fillCircle(x, y, size);
    }
  }
  
  /**
   * Add ocean-themed background elements
   * @param bg Background graphics object
   */
  private addOceanBackgroundElements(bg: Phaser.GameObjects.Graphics): void {
    // Add bubbles in the background
    const bubbleCount = 30;
    
    for (let i = 0; i < bubbleCount; i++) {
      const x = Phaser.Math.Between(-this.cameras.main.width, this.cameras.main.width * 2);
      const y = Phaser.Math.Between(-this.cameras.main.height, this.cameras.main.height * 2);
      const size = Phaser.Math.Between(5, 15);
      
      // Draw a bubble
      bg.fillStyle(0xFFFFFF, Phaser.Math.FloatBetween(0.1, 0.2));
      bg.fillCircle(x, y, size);
    }
  }
  
  /**
   * Add jungle-themed background elements
   * @param bg Background graphics object
   */
  private addJungleBackgroundElements(bg: Phaser.GameObjects.Graphics): void {
    // Add leaf silhouettes in the background
    const leafCount = 15;
    
    for (let i = 0; i < leafCount; i++) {
      const x = Phaser.Math.Between(-this.cameras.main.width, this.cameras.main.width * 2);
      const y = Phaser.Math.Between(-this.cameras.main.height, this.cameras.main.height * 2);
      const size = Phaser.Math.Between(20, 50);
      
      // Draw a simple leaf shape
      bg.fillStyle(0xFFFFFF, Phaser.Math.FloatBetween(0.05, 0.1));
      bg.fillEllipse(x, y, size, size / 2);
    }
  }
  
  /**
   * Add candy-themed background elements
   * @param bg Background graphics object
   */
  private addCandyBackgroundElements(bg: Phaser.GameObjects.Graphics): void {
    // Add candy sprinkles in the background
    const sprinkleCount = 40;
    const sprinkleColors = [0xFFEB3B, 0x2196F3, 0x4CAF50, 0x9C27B0, 0xFF9800];
    
    for (let i = 0; i < sprinkleCount; i++) {
      const x = Phaser.Math.Between(-this.cameras.main.width, this.cameras.main.width * 2);
      const y = Phaser.Math.Between(-this.cameras.main.height, this.cameras.main.height * 2);
      const width = Phaser.Math.Between(5, 10);
      const height = Phaser.Math.Between(2, 4);
      const angle = Phaser.Math.FloatBetween(0, Math.PI);
      
      // Get a random color for the sprinkle
      const colorIndex = Phaser.Math.Between(0, sprinkleColors.length - 1);
      
      // Save the current transform state
      bg.save();
      
      // Move to the position and rotate
      bg.translateCanvas(x, y);
      bg.rotateCanvas(angle);
      
      // Draw the sprinkle
      bg.fillStyle(sprinkleColors[colorIndex], 0.3);
      bg.fillRoundedRect(-width/2, -height/2, width, height, height/2);
      
      // Restore the transform state
      bg.restore();
    }
  }
  
  update(time: number, delta: number): void {
    // Handle animations and smooth movement
    this.updatePlayerMovement(delta);
  }
  
  /**
   * Update player movement with animation
   * @param delta Time since last frame in ms
   */
  private updatePlayerMovement(delta: number): void {
    if (!this.playerGraphics) return;
    
    // Check if player is moving (displayedRow/Col different from targetRow/Col)
    const isMoving = this.displayedRow !== this.targetRow || this.displayedCol !== this.targetCol;
    
    if (isMoving) {
      // Calculate the movement speed (cells per second)
      const moveSpeed = 5; // Can be adjusted for faster/slower movement
      const frameMove = moveSpeed * delta / 1000;
      
      // Calculate direction to move
      const diffRow = this.targetRow - this.displayedRow;
      const diffCol = this.targetCol - this.displayedCol;
      
      // Update displayed position with smooth movement
      if (Math.abs(diffRow) > 0) {
        this.displayedRow += Math.sign(diffRow) * Math.min(frameMove, Math.abs(diffRow));
      }
      
      if (Math.abs(diffCol) > 0) {
        this.displayedCol += Math.sign(diffCol) * Math.min(frameMove, Math.abs(diffCol));
      }
      
      // Redraw player at new position
      this.drawPlayer();
    }
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
    
    // Just store the theme name - don't attempt to update visuals immediately 
    // as scene may not be fully initialized
    this.currentTheme = theme;
    console.log('Setting theme to:', theme);
    
    // Only try to update visuals if the scene is fully initialized
    // Check for essential scene properties
    if (this.scene && this.scene.isActive && this.add && this.cameras) {
      try {
        // Update the background to match the new theme
        this.createMazeGraphics();
      } catch (error) {
        console.error('Error updating maze graphics during theme change:', error);
      }
    } else {
      console.log('Scene not fully initialized, theme stored for later application');
    }
    
    // Emit an event that the theme has been updated
    const themeEvent: ThemeUpdatedEvent = { theme };
    EventBus.emit('theme-updated', themeEvent);
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
    backgroundColor: number;
  } {
    switch (this.currentTheme) {
      case 'space':
        return {
          wallColor: 0x2C3E50,
          pathColor: 0xF9FAFB,
          goalColor: 0xFFD700,
          mathProblemColor: 0x9B59B6,
          solvedColor: 0x3498DB,
          playerColor: 0xE74C3C,
          backgroundColor: 0x203A43 // Middle color from the gradient
        };
      case 'ocean':
        return {
          wallColor: 0x1E88E5,
          pathColor: 0xE3F2FD,
          goalColor: 0xFFEB3B,
          mathProblemColor: 0x26A69A,
          solvedColor: 0x66BB6A,
          playerColor: 0xFF7043,
          backgroundColor: 0x0277BD // Middle color from the gradient
        };
      case 'jungle':
        return {
          wallColor: 0x33691E,
          pathColor: 0xDCEDC8,
          goalColor: 0xFFC107,
          mathProblemColor: 0xFF9800,
          solvedColor: 0x8BC34A,
          playerColor: 0x7B1FA2,
          backgroundColor: 0x00796B // Middle color from the gradient
        };
      case 'candy':
        return {
          wallColor: 0xE91E63,
          pathColor: 0xFCE4EC,
          goalColor: 0xFFEB3B,
          mathProblemColor: 0xAB47BC,
          solvedColor: 0x26C6DA,
          playerColor: 0x7CB342,
          backgroundColor: 0xC2185B // Middle color from the gradient
        };
      default:
        return {
          wallColor: 0x2C3E50,
          pathColor: 0xF9FAFB,
          goalColor: 0xFFD700,
          mathProblemColor: 0x9B59B6,
          solvedColor: 0x3498DB,
          playerColor: 0xE74C3C,
          backgroundColor: 0x203A43 // Middle color from the gradient
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
      try {
        // Safely try to get the theme from the store
        import('$lib/stores/theme').then(({ theme }) => {
          let initialTheme = '';
          const unsubscribe = theme.subscribe(value => {
            initialTheme = value;
            this.currentTheme = value; // Just store the theme, don't recursively call setTheme
          });
          unsubscribe();
          
          // If we successfully got a theme, use it
          if (initialTheme) {
            this.currentTheme = initialTheme;
          } else {
            // Otherwise default to space theme
            this.currentTheme = 'space';
          }
          
          // Now continue with rendering
          this.createMazeGraphics();
        }).catch(err => {
          console.error('Failed to load theme store:', err);
          // Use space theme as default
          this.currentTheme = 'space';
          this.createMazeGraphics();
        });
      } catch (error) {
        console.error('Error loading theme store:', error);
        // Use space theme as default
        this.currentTheme = 'space';
        this.createMazeGraphics();
      }
      return; // Wait for theme to be set
    }
    
    // Clear previous graphics
    this.mazeGraphics.clear();
    this.playerGraphics.clear();
    
    // Clean up existing text objects (like question marks, checkmarks)
    if (this.children && typeof this.children.each === 'function') {
      this.children.each(child => {
        if (child && child.type === 'Text') {
          child.destroy();
        }
      });
    }
    
    // Set maze graphics depth to be above background but below UI
    this.mazeGraphics.setDepth(1);
    this.playerGraphics.setDepth(2);
    
    const colors = this.getThemeColors();
    const rows = this.maze.length;
    const cols = this.maze[0].length;
    
    // First create a background with theme color
    // Safely check for existing background
    if (this.children && typeof this.children.getByName === 'function') {
      const bgGraphics = this.children.getByName('theme-background') as Phaser.GameObjects.Graphics;
      if (bgGraphics) {
        bgGraphics.destroy(); // Remove if it exists
      }
    }
    
    // Create new background
    const bg = this.add.graphics({ name: 'theme-background' });
    bg.setDepth(-100);
    
    // Fill with the theme background color
    bg.fillStyle(colors.backgroundColor, 0.2);
    bg.fillRect(0, 0, this.worldWidth * 2, this.worldHeight * 2);
    
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
          const questionMark = this.add.text(
            x + this.cellSize / 2,
            y + this.cellSize / 2,
            '?',
            {
              font: `bold ${this.cellSize / 2}px Arial`,
              color: '#ffffff'
            }
          ).setOrigin(0.5);
          
          // Set depth to be above maze graphics
          questionMark.setDepth(1.5);
          
        } else if (cell.isIntersection && cell.mathProblemSolved) {
          this.mazeGraphics.fillStyle(colors.solvedColor, 1);
          this.mazeGraphics.fillRect(x, y, this.cellSize, this.cellSize);
          
          // Add a checkmark
          const checkmark = this.add.text(
            x + this.cellSize / 2,
            y + this.cellSize / 2,
            '✓',
            {
              font: `bold ${this.cellSize / 2}px Arial`,
              color: '#ffffff'
            }
          ).setOrigin(0.5);
          
          // Set depth to be above maze graphics
          checkmark.setDepth(1.5);
          
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
    
    // Make sure the player is drawn above everything else
    this.playerGraphics.setDepth(10);
    
    // Draw player based on theme
    const playerSize = this.cellSize * 0.6;
    
    // Draw with a bright color to ensure visibility
    this.playerGraphics.fillStyle(colors.playerColor, 1);
    this.playerGraphics.fillCircle(x, y, playerSize / 2);
    
    // Add a white glow effect to make the player stand out
    // First a larger soft outline in white
    this.playerGraphics.lineStyle(3, 0xFFFFFF, 0.3);
    this.playerGraphics.strokeCircle(x, y, playerSize / 2 + 2);
    
    // Then a smaller, sharper black outline
    this.playerGraphics.lineStyle(2, 0x000000, 0.5);
    this.playerGraphics.strokeCircle(x, y, playerSize / 2);
    
    // Center camera on player if cameras exists
    if (this.cameras && this.cameras.main) {
      this.cameras.main.centerOn(x, y);
    }
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
    // Don't allow movement if player is already animating
    if (this.displayedRow !== this.targetRow || this.displayedCol !== this.targetCol) {
      return;
    }
    
    // Current player cell
    const currentCell = this.maze[this.targetRow][this.targetCol];
    
    // Check if movement is valid (no wall in the direction)
    let canMove = false;
    let nextRow = this.targetRow;
    let nextCol = this.targetCol;
    
    switch (direction) {
      case 'up':
        canMove = !currentCell.walls.top;
        if (canMove) nextRow -= 1;
        break;
      case 'down':
        canMove = !currentCell.walls.bottom;
        if (canMove) nextRow += 1;
        break;
      case 'left':
        canMove = !currentCell.walls.left;
        if (canMove) nextCol -= 1;
        break;
      case 'right':
        canMove = !currentCell.walls.right;
        if (canMove) nextCol += 1;
        break;
    }
    
    // Check if we can move (no wall in the way)
    if (canMove) {
      // Check if next cell is valid (within maze bounds)
      if (nextRow >= 0 && nextRow < this.maze.length && 
          nextCol >= 0 && nextCol < this.maze[0].length) {
        
        // Get the next cell
        const nextCell = this.maze[nextRow][nextCol];
        
        // Update target position (actual movement is done in the update method)
        this.targetRow = nextRow;
        this.targetCol = nextCol;
        
        // Check if the cell is an intersection with an unsolved math problem
        if (nextCell.isIntersection && !nextCell.mathProblemSolved) {
          // Emit an event to show the math problem in the Svelte UI
          const mathProblemEvent: ShowMathProblemEvent = { cell: nextCell };
          EventBus.emit('show-math-problem', mathProblemEvent);
        }
        
        // Check if player reached the goal
        if (nextCell.isGoal) {
          // Emit goal reached event
          const goalEvent: GoalReachedEvent = { };
          EventBus.emit('goal-reached', goalEvent);
        }
        
        // Emit player moved event with new position
        const moveEvent: PlayerMovedEvent = {
          direction,
          position: { row: nextRow, col: nextCol }
        };
        EventBus.emit('player-moved', moveEvent);
      }
    } else {
      // Cannot move in this direction
      const invalidEvent: InvalidMoveEvent = { direction };
      EventBus.emit('invalid-move', invalidEvent);
    }
  }
}