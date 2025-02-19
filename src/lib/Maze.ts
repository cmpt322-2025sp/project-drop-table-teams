// Maze.ts

// Define a cell in the maze grid.
export interface Cell {
  row: number;
  col: number;
  walls: {
    top: boolean;
    right: boolean;
    bottom: boolean;
    left: boolean;
  }
}

// A Wall connects two adjacent cells.
interface Wall {
  cell1: Cell;
  cell2: Cell;
  // 'vertical' means the wall is between a cell and its right neighbor;
  // 'horizontal' means the wall is between a cell and its bottom neighbor.
  direction: 'vertical' | 'horizontal';
}

// Simple Disjoint Set (Union-Find) to keep track of connected components.
class DisjointSet {
  parent: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  find(i: number): number {
    if (this.parent[i] !== i) {
      this.parent[i] = this.find(this.parent[i]);
    }
    return this.parent[i];
  }
  union(i: number, j: number): void {
    const rootI = this.find(i);
    const rootJ = this.find(j);
    if (rootI !== rootJ) {
      this.parent[rootJ] = rootI;
    }
  }
}

// The maze generation function.
export function generateMaze(rows: number, cols: number): Cell[][] {
  // Initialize grid of cells with all walls intact.
  const grid: Cell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        walls: { top: true, right: true, bottom: true, left: true }
      });
    }
    grid.push(row);
  }

  // Create a list of all possible walls between adjacent cells.
  let walls: Wall[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c < cols - 1) {
        // Vertical wall between current cell and the one to its right.
        walls.push({
          cell1: grid[r][c],
          cell2: grid[r][c + 1],
          direction: 'vertical'
        });
      }
      if (r < rows - 1) {
        // Horizontal wall between current cell and the one below.
        walls.push({
          cell1: grid[r][c],
          cell2: grid[r + 1][c],
          direction: 'horizontal'
        });
      }
    }
  }

  // Shuffle the walls array to randomize the maze.
  walls = shuffle(walls);

  // Create a disjoint set with one element per cell.
  const ds = new DisjointSet(rows * cols);
  function cellIndex(cell: Cell): number {
    return cell.row * cols + cell.col;
  }

  // Process each wall in the randomized order.
  for (const wall of walls) {
    const index1 = cellIndex(wall.cell1);
    const index2 = cellIndex(wall.cell2);

    // If the cells separated by the wall are in different sets, remove the wall.
    if (ds.find(index1) !== ds.find(index2)) {
      ds.union(index1, index2);
      if (wall.direction === 'vertical') {
        // Remove the wall between cell1 and cell2.
        wall.cell1.walls.right = false;
        wall.cell2.walls.left = false;
      } else if (wall.direction === 'horizontal') {
        wall.cell1.walls.bottom = false;
        wall.cell2.walls.top = false;
      }
    }
  }

  return grid;
}

// Fisher-Yates shuffle algorithm.
function shuffle<T>(array: T[]): T[] {
  let currentIndex = array.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
}

