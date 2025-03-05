import type { Cell } from '$lib/Maze';

/**
 * Handles rendering of the maze on a canvas
 */
export class MazeRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private cellSize: number;
  private wallThickness: number;
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  private theme: string;
  
  constructor(
    canvas: HTMLCanvasElement, 
    cellSize: number = 50, 
    wallThickness: number = 30,
    theme: string = 'space'
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cellSize = cellSize;
    this.wallThickness = wallThickness;
    this.theme = theme;
  }
  
  /**
   * Get the canvas dimensions based on the maze size
   * @param rows Number of rows in the maze
   * @param cols Number of columns in the maze
   * @returns Object with canvas width and height
   */
  calculateCanvasDimensions(rows: number, cols: number): { width: number; height: number } {
    this.canvasWidth = cols * this.cellSize + (cols + 1) * this.wallThickness;
    this.canvasHeight = rows * this.cellSize + (rows + 1) * this.wallThickness;
    return { width: this.canvasWidth, height: this.canvasHeight };
  }
  
  /**
   * Update the canvas dimensions
   * @param width Canvas width
   * @param height Canvas height
   */
  setCanvasDimensions(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.canvasWidth = width;
    this.canvasHeight = height;
  }
  
  /**
   * Set the theme for rendering
   * @param theme Theme name
   */
  setTheme(theme: string) {
    this.theme = theme;
  }
  
  /**
   * Get the colors for the current theme
   * @returns Object with color values
   */
  getThemeColors() {
    switch (this.theme) {
      case 'space':
        return {
          wallColor: '#2C3E50', // Deep blue
          pathColor: '#F9FAFB', // Off-white
          goalColor: '#FFD700', // Gold
          mathProblemColor: '#9B59B6', // Purple
          solvedColor: '#3498DB', // Blue
          playerColor: '#E74C3C' // Red
        };
      case 'ocean':
        return {
          wallColor: '#1E88E5', // Ocean blue
          pathColor: '#E3F2FD', // Light blue
          goalColor: '#FFEB3B', // Yellow
          mathProblemColor: '#26A69A', // Teal
          solvedColor: '#66BB6A', // Green
          playerColor: '#FF7043' // Orange
        };
      case 'jungle':
        return {
          wallColor: '#33691E', // Deep green
          pathColor: '#DCEDC8', // Light green
          goalColor: '#FFC107', // Amber
          mathProblemColor: '#FF9800', // Orange
          solvedColor: '#8BC34A', // Light green
          playerColor: '#7B1FA2' // Purple
        };
      case 'candy':
        return {
          wallColor: '#E91E63', // Pink
          pathColor: '#FCE4EC', // Light pink
          goalColor: '#FFEB3B', // Yellow
          mathProblemColor: '#AB47BC', // Purple
          solvedColor: '#26C6DA', // Teal
          playerColor: '#7CB342' // Green
        };
      default:
        return {
          wallColor: '#2C3E50',
          pathColor: '#F9FAFB',
          goalColor: '#FFD700',
          mathProblemColor: '#9B59B6',
          solvedColor: '#3498DB',
          playerColor: '#E74C3C'
        };
    }
  }
  
  /**
   * Draw the entire maze
   * @param maze The maze grid
   * @param displayedRow Current player row position
   * @param displayedCol Current player column position
   */
  render(maze: Cell[][], displayedRow: number, displayedCol: number) {
    if (!this.ctx) return;
    
    const ctx = this.ctx;
    const colors = this.getThemeColors();
    
    // Draw the entire canvas filled with walls
    ctx.fillStyle = colors.wallColor;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    
    // Add texture to walls based on theme
    this.addWallTexture(ctx);
    
    // Draw cell paths
    const rows = maze.length;
    const cols = maze[0].length;
    
    // Draw each cell's path with theme colors
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = maze[r][c];
        const x = this.wallThickness + c * (this.cellSize + this.wallThickness);
        const y = this.wallThickness + r * (this.cellSize + this.wallThickness);
        
        this.drawCell(ctx, cell, x, y);
      }
    }
    
    // Remove walls where passages exist
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        this.drawCellPassages(ctx, maze, r, c);
      }
    }
    
    // Draw the player
    this.drawPlayer(ctx, displayedRow, displayedCol);
  }
  
  /**
   * Draw a single cell
   * @param ctx Canvas context
   * @param cell Cell to draw
   * @param x X position
   * @param y Y position
   */
  private drawCell(ctx: CanvasRenderingContext2D, cell: Cell, x: number, y: number) {
    const colors = this.getThemeColors();
    
    if (cell.isGoal) {
      // Draw goal with special design
      ctx.fillStyle = colors.goalColor;
      ctx.fillRect(x, y, this.cellSize, this.cellSize);
      
      // Draw a star in the goal cell
      this.drawStar(ctx, x + this.cellSize/2, y + this.cellSize/2);
    } else if (cell.isIntersection && !cell.mathProblemSolved) {
      // Math problem cells get a special pattern
      ctx.fillStyle = colors.mathProblemColor;
      ctx.fillRect(x, y, this.cellSize, this.cellSize);
      
      // Add a question mark
      ctx.fillStyle = 'white';
      ctx.font = `bold ${this.cellSize/2}px 'Comic Sans MS', cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('?', x + this.cellSize/2, y + this.cellSize/2);
    } else if (cell.isIntersection && cell.mathProblemSolved) {
      // Solved problems get a different color
      ctx.fillStyle = colors.solvedColor;
      ctx.fillRect(x, y, this.cellSize, this.cellSize);
      
      // Add a checkmark
      ctx.fillStyle = 'white';
      ctx.font = `bold ${this.cellSize/2}px 'Comic Sans MS', cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓', x + this.cellSize/2, y + this.cellSize/2);
    } else {
      // Regular path
      ctx.fillStyle = colors.pathColor;
      ctx.fillRect(x, y, this.cellSize, this.cellSize);
      
      // Add small decorations to some paths based on theme
      if (Math.random() > 0.7) {
        this.addPathDecoration(ctx, x, y);
      }
    }
    
    // Add rounded corners to all cells
    ctx.strokeStyle = colors.wallColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, this.cellSize, this.cellSize);
  }
  
  /**
   * Draw passages between cells
   * @param ctx Canvas context
   * @param maze The maze grid
   * @param r Current row
   * @param c Current column
   */
  private drawCellPassages(ctx: CanvasRenderingContext2D, maze: Cell[][], r: number, c: number) {
    const colors = this.getThemeColors();
    const rows = maze.length;
    const cols = maze[0].length;
    const cell = maze[r][c];
    const x = this.wallThickness + c * (this.cellSize + this.wallThickness);
    const y = this.wallThickness + r * (this.cellSize + this.wallThickness);
    
    // Remove the right wall if there is a passage
    if (!cell.walls.right && c < cols - 1) {
      const nextCell = maze[r][c+1];
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
      
      ctx.fillStyle = color;
      ctx.fillRect(x + this.cellSize, y, this.wallThickness, this.cellSize);
    }
    
    // Remove the bottom wall if there is a passage
    if (!cell.walls.bottom && r < rows - 1) {
      const nextCell = maze[r+1][c];
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
      
      ctx.fillStyle = color;
      ctx.fillRect(x, y + this.cellSize, this.cellSize, this.wallThickness);
    }
  }
  
  /**
   * Draw the player character
   * @param ctx Canvas context
   * @param displayedRow Player row position
   * @param displayedCol Player column position
   */
  private drawPlayer(ctx: CanvasRenderingContext2D, displayedRow: number, displayedCol: number) {
    const colors = this.getThemeColors();
    
    // Compute the center of the player's cell
    const x = this.wallThickness + displayedCol * (this.cellSize + this.wallThickness) + this.cellSize/2;
    const y = this.wallThickness + displayedRow * (this.cellSize + this.wallThickness) + this.cellSize/2;
    
    // Size of player
    const playerSize = this.cellSize * 0.7;
    
    // Draw player based on theme
    if (this.theme === 'space') {
      // Draw spaceship
      ctx.fillStyle = colors.playerColor;
      ctx.beginPath();
      ctx.arc(x, y, playerSize/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Add spaceship details
      ctx.fillStyle = '#FFF';
      ctx.beginPath();
      ctx.arc(x, y - playerSize/6, playerSize/6, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.theme === 'ocean') {
      // Draw fish
      ctx.fillStyle = colors.playerColor;
      ctx.beginPath();
      ctx.ellipse(x, y, playerSize/2, playerSize/3, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Add tail
      ctx.beginPath();
      ctx.moveTo(x + playerSize/2, y);
      ctx.lineTo(x + playerSize/2 + playerSize/4, y - playerSize/4);
      ctx.lineTo(x + playerSize/2 + playerSize/4, y + playerSize/4);
      ctx.closePath();
      ctx.fill();
      
      // Add eye
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x - playerSize/6, y - playerSize/8, playerSize/8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x - playerSize/6, y - playerSize/8, playerSize/16, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.theme === 'jungle') {
      // Draw monkey
      ctx.fillStyle = colors.playerColor;
      ctx.beginPath();
      ctx.arc(x, y, playerSize/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Add ears
      ctx.beginPath();
      ctx.arc(x - playerSize/3, y - playerSize/3, playerSize/6, 0, Math.PI * 2);
      ctx.arc(x + playerSize/3, y - playerSize/3, playerSize/6, 0, Math.PI * 2);
      ctx.fill();
      
      // Add face
      ctx.fillStyle = '#F5D0A9';
      ctx.beginPath();
      ctx.arc(x, y, playerSize/3, 0, Math.PI * 2);
      ctx.fill();
      
      // Add eyes
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x - playerSize/8, y - playerSize/8, playerSize/12, 0, Math.PI * 2);
      ctx.arc(x + playerSize/8, y - playerSize/8, playerSize/12, 0, Math.PI * 2);
      ctx.fill();
      
      // Add smile
      ctx.beginPath();
      ctx.arc(x, y + playerSize/12, playerSize/8, 0, Math.PI);
      ctx.stroke();
    } else if (this.theme === 'candy') {
      // Draw lollipop character
      ctx.fillStyle = colors.playerColor;
      ctx.beginPath();
      ctx.arc(x, y - playerSize/6, playerSize/2, 0, Math.PI * 2);
      ctx.fill();
      
      // Add stick
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(x - playerSize/16, y + playerSize/6, playerSize/8, playerSize/2);
      
      // Add face
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(x - playerSize/6, y - playerSize/4, playerSize/10, 0, Math.PI * 2);
      ctx.arc(x + playerSize/6, y - playerSize/4, playerSize/10, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = 'black';
      ctx.beginPath();
      ctx.arc(x - playerSize/6, y - playerSize/4, playerSize/20, 0, Math.PI * 2);
      ctx.arc(x + playerSize/6, y - playerSize/4, playerSize/20, 0, Math.PI * 2);
      ctx.fill();
      
      // Add smile
      ctx.beginPath();
      ctx.arc(x, y, playerSize/6, 0.2, Math.PI - 0.2);
      ctx.stroke();
    } else {
      // Default player (backup)
      ctx.fillStyle = colors.playerColor;
      ctx.beginPath();
      ctx.arc(x, y, playerSize/2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * Add texture to walls based on theme
   * @param ctx Canvas context
   */
  private addWallTexture(ctx: CanvasRenderingContext2D) {
    if (this.theme === 'space') {
      this.addStarsTexture(ctx);
    } else if (this.theme === 'ocean') {
      this.addBubblesTexture(ctx);
    } else if (this.theme === 'jungle') {
      this.addLeavesTexture(ctx);
    } else if (this.theme === 'candy') {
      this.addSprinklesTexture(ctx);
    }
  }
  
  /**
   * Add stars texture to walls for space theme
   * @param ctx Canvas context
   */
  private addStarsTexture(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * this.canvasWidth;
      const y = Math.random() * this.canvasHeight;
      const size = Math.random() * 2 + 1;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * Add bubbles texture to walls for ocean theme
   * @param ctx Canvas context
   */
  private addBubblesTexture(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * this.canvasWidth;
      const y = Math.random() * this.canvasHeight;
      const size = Math.random() * 10 + 5;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * Add leaves texture to walls for jungle theme
   * @param ctx Canvas context
   */
  private addLeavesTexture(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * this.canvasWidth;
      const y = Math.random() * this.canvasHeight;
      const size = Math.random() * 15 + 5;
      ctx.beginPath();
      ctx.ellipse(x, y, size, size/2, Math.random() * Math.PI, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * Add sprinkles texture to walls for candy theme
   * @param ctx Canvas context
   */
  private addSprinklesTexture(ctx: CanvasRenderingContext2D) {
    const sprinkleColors = ['#FF5252', '#FFEB3B', '#2196F3', '#4CAF50', '#9C27B0'];
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * this.canvasWidth;
      const y = Math.random() * this.canvasHeight;
      const color = sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)];
      ctx.fillStyle = color;
      
      // Draw small rounded rectangles for sprinkles
      const width = Math.random() * 8 + 4;
      const height = Math.random() * 3 + 2;
      const angle = Math.random() * Math.PI;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.fillRect(-width/2, -height/2, width, height);
      ctx.restore();
    }
  }
  
  /**
   * Add decorations to path cells based on theme
   * @param ctx Canvas context
   * @param x X position
   * @param y Y position
   */
  private addPathDecoration(ctx: CanvasRenderingContext2D, x: number, y: number) {
    const centerX = x + this.cellSize/2;
    const centerY = y + this.cellSize/2;
    
    if (this.theme === 'space') {
      // Small planet
      ctx.fillStyle = 'rgba(100, 100, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, this.cellSize/6, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.theme === 'ocean') {
      // Small fish or shell
      ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, this.cellSize/8, this.cellSize/12, Math.PI/4, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.theme === 'jungle') {
      // Small leaf
      ctx.fillStyle = 'rgba(100, 200, 100, 0.3)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, this.cellSize/10, this.cellSize/5, Math.PI/3, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.theme === 'candy') {
      // Small candy
      ctx.fillStyle = 'rgba(255, 150, 200, 0.3)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, this.cellSize/8, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  /**
   * Draw a star shape for the goal
   * @param ctx Canvas context
   * @param cx Center X position
   * @param cy Center Y position
   */
  private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
    const spikes = 5;
    const outerRadius = this.cellSize/3;
    const innerRadius = this.cellSize/6;
    
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = '#FFEE58';
    ctx.fill();
    ctx.strokeStyle = '#FFA000';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}