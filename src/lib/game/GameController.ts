import { generateMaze, type Cell } from '$lib/Maze';
import { 
  generateRandomProblem, 
  generateRandomPlaceValueProblem, 
  type MathProblem 
} from '$lib/mathproblems';

/**
 * Controller for the maze game logic
 */
export class GameController {
  // Maze state
  private rows: number;
  private cols: number;
  private maze: Cell[][] = [];
  private goalCell: Cell;
  
  // Player state
  private targetRow: number;
  private targetCol: number;
  private displayedRow: number;
  private displayedCol: number;
  
  // Animation state
  private animating: boolean = false;
  private animationSpeed: number = 0.15;
  
  // Math problem state
  private showMathProblem: boolean = false;
  private currentProblem: MathProblem | null = null;
  private attemptedCell: Cell | null = null;
  private problemResult: 'correct' | 'incorrect' | null = null;
  
  // Celebration state
  private showCelebration: boolean = false;
  
  constructor(rows: number = 5, cols: number = 5) {
    this.rows = rows;
    this.cols = cols;
    
    // Initialize the maze
    const mazeData = generateMaze(rows, cols);
    this.maze = mazeData.maze;
    this.goalCell = mazeData.goal;
    
    // Set player starting position (center of maze)
    this.targetRow = Math.floor(rows / 2);
    this.targetCol = Math.floor(cols / 2);
    this.displayedRow = this.targetRow;
    this.displayedCol = this.targetCol;
  }
  
  // Getters
  get mazeGrid(): Cell[][] {
    return this.maze;
  }
  
  get goal(): Cell {
    return this.goalCell;
  }
  
  get playerTargetRow(): number {
    return this.targetRow;
  }
  
  get playerTargetCol(): number {
    return this.targetCol;
  }
  
  get playerDisplayedRow(): number {
    return this.displayedRow;
  }
  
  get playerDisplayedCol(): number {
    return this.displayedCol;
  }
  
  get isAnimating(): boolean {
    return this.animating;
  }
  
  get isMathProblemShowing(): boolean {
    return this.showMathProblem;
  }
  
  get mathProblem(): MathProblem | null {
    return this.currentProblem;
  }
  
  get mathProblemCell(): Cell | null {
    return this.attemptedCell;
  }
  
  get mathProblemStatus(): 'correct' | 'incorrect' | null {
    return this.problemResult;
  }
  
  get isCelebrating(): boolean {
    return this.showCelebration;
  }
  
  // Game actions
  /**
   * Move the player in a specific direction
   * @param direction Direction to move: 'up', 'down', 'left', or 'right'
   * @returns Object containing whether the move was successful and any special actions triggered
   */
  movePlayer(direction: 'up' | 'down' | 'left' | 'right'): { 
    success: boolean, 
    triggeredMathProblem: boolean,
    reachedGoal: boolean 
  } {
    // If math problem is showing or currently animating, don't allow movement
    if (this.showMathProblem || this.animating) {
      return { success: false, triggeredMathProblem: false, reachedGoal: false };
    }
    
    let newRow = this.targetRow;
    let newCol = this.targetCol;
    
    if (direction === 'up') {
      newRow = this.targetRow - 1;
    } else if (direction === 'down') {
      newRow = this.targetRow + 1;
    } else if (direction === 'left') {
      newCol = this.targetCol - 1;
    } else if (direction === 'right') {
      newCol = this.targetCol + 1;
    }
    
    // Check if the move is valid
    if (this.isMoveValid(newRow, newCol)) {
      const targetCell = this.maze[newRow][newCol];
      
      // Update player position
      this.targetRow = newRow;
      this.targetCol = newCol;
      this.animating = true;
      
      const hasMathProblem = targetCell.hasMathProblem && !targetCell.mathProblemSolved;
      const isGoal = targetCell.isGoal;
      
      // Return the result
      return { 
        success: true, 
        triggeredMathProblem: hasMathProblem, 
        reachedGoal: isGoal 
      };
    }
    
    // Move was invalid
    return { success: false, triggeredMathProblem: false, reachedGoal: false };
  }
  
  /**
   * Check if a move to the specified position is valid
   * @param newRow Row to move to
   * @param newCol Column to move to
   * @returns Whether the move is valid
   */
  isMoveValid(newRow: number, newCol: number): boolean {
    if (newRow < 0 || newRow >= this.rows || newCol < 0 || newCol >= this.cols) {
      return false; // Out of bounds
    }
    
    const currentCell = this.maze[this.targetRow][this.targetCol];
    if (newRow < this.targetRow && currentCell.walls.top) return false; // Moving up
    if (newRow > this.targetRow && currentCell.walls.bottom) return false; // Moving down
    if (newCol < this.targetCol && currentCell.walls.left) return false; // Moving left
    if (newCol > this.targetCol && currentCell.walls.right) return false; // Moving right
    
    return true; // Move is valid
  }
  
  /**
   * Update the displayed position during animation
   * @param onComplete Callback to execute when animation is complete
   */
  animateMovement(onComplete?: () => void) {
    if (!this.animating) return;
    
    // Linear interpolation helper
    const lerp = (start: number, end: number, t: number) => start + (end - start) * t;
    
    // Update displayed positions
    this.displayedRow = lerp(this.displayedRow, this.targetRow, this.animationSpeed);
    this.displayedCol = lerp(this.displayedCol, this.targetCol, this.animationSpeed);
    
    // If the displayed position is nearly at the target, finish animating
    if (Math.abs(this.displayedRow - this.targetRow) < 0.01 && 
        Math.abs(this.displayedCol - this.targetCol) < 0.01) {
      this.displayedRow = this.targetRow;
      this.displayedCol = this.targetCol;
      this.animating = false;
      
      // Call the completion callback if provided
      if (onComplete) onComplete();
    }
  }
  
  /**
   * Show a math problem for the current cell
   */
  showMathProblemForCurrentCell() {
    this.showMathProblem = true;
    this.currentProblem = this.generateMathProblem();
    this.attemptedCell = this.maze[this.targetRow][this.targetCol];
    this.problemResult = null;
  }
  
  /**
   * Generate a random math problem
   * @returns A math problem object
   */
  generateMathProblem(): MathProblem {
    // Randomly choose between regular math problems and place value problems
    return Math.random() < 0.5 ? generateRandomProblem() : generateRandomPlaceValueProblem();
  }
  
  /**
   * Check the user's answer to the current math problem
   * @param userAnswer The answer provided by the user
   * @returns Whether the answer was correct
   */
  checkMathProblemAnswer(userAnswer: string): boolean {
    if (!this.currentProblem || !this.attemptedCell) return false;
    
    // Convert both to strings for comparison (handles both number and string answers)
    const isCorrect = userAnswer.trim() === this.currentProblem.answer.toString();
    
    this.problemResult = isCorrect ? 'correct' : 'incorrect';
    
    if (isCorrect) {
      // Mark the problem as solved
      if (this.attemptedCell) {
        this.attemptedCell.mathProblemSolved = true;
      }
    }
    
    return isCorrect;
  }
  
  /**
   * Close the math problem modal
   */
  closeMathProblem() {
    this.showMathProblem = false;
    this.currentProblem = null;
    this.attemptedCell = null;
    this.problemResult = null;
  }
  
  /**
   * Reset the math problem with a new problem
   */
  resetMathProblem() {
    this.currentProblem = this.generateMathProblem();
    this.problemResult = null;
  }
  
  /**
   * Show the celebration screen
   */
  celebrate() {
    this.showCelebration = true;
  }
  
  /**
   * Hide the celebration screen
   */
  endCelebration() {
    this.showCelebration = false;
  }
  
  /**
   * Reset the game
   */
  reset() {
    // Reset the maze
    const mazeData = generateMaze(this.rows, this.cols);
    this.maze = mazeData.maze;
    this.goalCell = mazeData.goal;
    
    // Reset player position
    this.targetRow = Math.floor(this.rows / 2);
    this.targetCol = Math.floor(this.cols / 2);
    this.displayedRow = this.targetRow;
    this.displayedCol = this.targetCol;
    
    // Reset game state
    this.animating = false;
    this.showMathProblem = false;
    this.currentProblem = null;
    this.attemptedCell = null;
    this.problemResult = null;
    this.showCelebration = false;
  }
}