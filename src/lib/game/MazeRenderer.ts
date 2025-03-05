import type { Cell } from '$lib/Maze';
import { theme } from '$lib/stores/theme';
import { get } from 'svelte/store';

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
	private currentTheme: string;
	private unsubscribe: () => void;

	constructor(
		canvas: HTMLCanvasElement,
		cellSize: number = 50,
		wallThickness: number = 30
	) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d', { alpha: false, antialias: true });
		this.cellSize = cellSize;
		this.wallThickness = wallThickness;
		this.currentTheme = get(theme); // Get initial theme from store
		
		// Subscribe to theme changes
		this.unsubscribe = theme.subscribe(value => {
			this.currentTheme = value;
			this.draw(); // Redraw when theme changes
		});

		if (this.ctx) {
			// Enable high-quality image rendering
			this.ctx.imageSmoothingEnabled = true;
			this.ctx.imageSmoothingQuality = 'high';
		}
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

		if (this.ctx) {
			// Reset high-quality image rendering after size change
			this.ctx.imageSmoothingEnabled = true;
			this.ctx.imageSmoothingQuality = 'high';
		}
	}

	/**
	 * Clean up subscriptions when the renderer is no longer needed
	 */
	destroy() {
		if (this.unsubscribe) {
			this.unsubscribe();
		}
	}

	/**
	 * Draw method called when theme changes
	 */
	private draw() {
		if (this.canvas && this.ctx) {
			// Only redraw if we have a maze to render
			if (this.canvasWidth > 0 && this.canvasHeight > 0) {
				// The render method is likely called externally with maze data
				// We don't have that data here, so just mark for redraw
				// The next regular render call will use the updated theme
			}
		}
	}

	/**
	 * Get the colors for the current theme
	 * @returns Object with color values
	 */
	getThemeColors() {
		switch (this.currentTheme) {
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

		// Clear the canvas first
		ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

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
			this.drawStar(ctx, x + this.cellSize / 2, y + this.cellSize / 2);
		} else if (cell.isIntersection && !cell.mathProblemSolved) {
			// Math problem cells get a special pattern
			ctx.fillStyle = colors.mathProblemColor;
			ctx.fillRect(x, y, this.cellSize, this.cellSize);

			// Add a question mark
			ctx.fillStyle = 'white';
			ctx.font = `bold ${this.cellSize / 2}px 'Comic Sans MS', cursive`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('?', x + this.cellSize / 2, y + this.cellSize / 2);
		} else if (cell.isIntersection && cell.mathProblemSolved) {
			// Solved problems get a different color
			ctx.fillStyle = colors.solvedColor;
			ctx.fillRect(x, y, this.cellSize, this.cellSize);

			// Add a checkmark
			ctx.fillStyle = 'white';
			ctx.font = `bold ${this.cellSize / 2}px 'Comic Sans MS', cursive`;
			ctx.textAlign = 'center';
			ctx.textBaseline = 'middle';
			ctx.fillText('✓', x + this.cellSize / 2, y + this.cellSize / 2);
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
			const nextCell = maze[r][c + 1];
			let color;

			// Choose color based on cells being connected
			if (cell.isGoal || nextCell.isGoal) {
				color = colors.goalColor;
			} else if (
				(cell.isIntersection && !cell.mathProblemSolved) ||
				(nextCell.isIntersection && !nextCell.mathProblemSolved)
			) {
				color = colors.mathProblemColor;
			} else if (
				(cell.isIntersection && cell.mathProblemSolved) ||
				(nextCell.isIntersection && nextCell.mathProblemSolved)
			) {
				color = colors.solvedColor;
			} else {
				color = colors.pathColor;
			}

			ctx.fillStyle = color;
			ctx.fillRect(x + this.cellSize, y, this.wallThickness, this.cellSize);
		}

		// Remove the bottom wall if there is a passage
		if (!cell.walls.bottom && r < rows - 1) {
			const nextCell = maze[r + 1][c];
			let color;

			// Choose color based on cells being connected
			if (cell.isGoal || nextCell.isGoal) {
				color = colors.goalColor;
			} else if (
				(cell.isIntersection && !cell.mathProblemSolved) ||
				(nextCell.isIntersection && !nextCell.mathProblemSolved)
			) {
				color = colors.mathProblemColor;
			} else if (
				(cell.isIntersection && cell.mathProblemSolved) ||
				(nextCell.isIntersection && nextCell.mathProblemSolved)
			) {
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
		const x =
			this.wallThickness + displayedCol * (this.cellSize + this.wallThickness) + this.cellSize / 2;
		const y =
			this.wallThickness + displayedRow * (this.cellSize + this.wallThickness) + this.cellSize / 2;

		// Size of player - make larger for higher resolution
		const playerSize = this.cellSize * 0.7;

		// Draw player based on theme
		if (this.currentTheme === 'space') {
			// Draw rocket ship in high resolution
			ctx.save();

			// Add rocket thrust/exhaust glow
			const thrustGlow = ctx.createRadialGradient(
				x,
				y + playerSize * 0.7,
				0,
				x,
				y + playerSize * 0.7,
				playerSize
			);
			thrustGlow.addColorStop(0, 'rgba(255, 165, 0, 0.8)');
			thrustGlow.addColorStop(0.5, 'rgba(255, 69, 0, 0.5)');
			thrustGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
			ctx.fillStyle = thrustGlow;
			ctx.beginPath();
			ctx.moveTo(x - playerSize * 0.2, y + playerSize * 0.4);
			ctx.lineTo(x, y + playerSize);
			ctx.lineTo(x + playerSize * 0.2, y + playerSize * 0.4);
			ctx.closePath();
			ctx.fill();

			// Draw rocket body (elongated)
			ctx.fillStyle = colors.playerColor;
			ctx.beginPath();
			ctx.ellipse(x, y, playerSize * 0.25, playerSize * 0.6, 0, 0, Math.PI * 2);
			ctx.fill();

			// Draw rocket border for clarity
			ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
			ctx.lineWidth = 2;
			ctx.stroke();

			// Draw rocket nose cone
			ctx.fillStyle = colors.playerColor;
			ctx.beginPath();
			ctx.moveTo(x - playerSize * 0.25, y - playerSize * 0.45);
			ctx.lineTo(x, y - playerSize * 0.75);
			ctx.lineTo(x + playerSize * 0.25, y - playerSize * 0.45);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			// Draw fins
			ctx.fillStyle = colors.playerColor;
			// Left fin
			ctx.beginPath();
			ctx.moveTo(x - playerSize * 0.25, y + playerSize * 0.2);
			ctx.lineTo(x - playerSize * 0.45, y + playerSize * 0.45);
			ctx.lineTo(x - playerSize * 0.25, y + playerSize * 0.35);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			// Right fin
			ctx.beginPath();
			ctx.moveTo(x + playerSize * 0.25, y + playerSize * 0.2);
			ctx.lineTo(x + playerSize * 0.45, y + playerSize * 0.45);
			ctx.lineTo(x + playerSize * 0.25, y + playerSize * 0.35);
			ctx.closePath();
			ctx.fill();
			ctx.stroke();

			// Draw cockpit/window
			ctx.fillStyle = '#87CEFA'; // Light blue
			ctx.beginPath();
			ctx.ellipse(x, y - playerSize * 0.3, playerSize * 0.15, playerSize * 0.2, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();

			// Add window highlight
			ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
			ctx.beginPath();
			ctx.ellipse(
				x - playerSize * 0.05,
				y - playerSize * 0.35,
				playerSize * 0.07,
				playerSize * 0.1,
				Math.PI / 4,
				0,
				Math.PI * 2
			);
			ctx.fill();

			// Add engine nozzle
			ctx.fillStyle = '#A0A0A0'; // Silver color
			ctx.beginPath();
			ctx.ellipse(x, y + playerSize * 0.4, playerSize * 0.2, playerSize * 0.1, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();

			ctx.restore();
		} else if (this.currentTheme === 'ocean') {
			// Draw fish with smooth edges
			ctx.save();

			// Fish body
			ctx.fillStyle = colors.playerColor;
			ctx.beginPath();
			ctx.ellipse(x, y, playerSize / 2, playerSize / 3, 0, 0, Math.PI * 2);
			ctx.fill();

			// Add tail with better quality
			ctx.beginPath();
			ctx.moveTo(x + playerSize / 2, y);
			ctx.lineTo(x + playerSize / 2 + playerSize / 4, y - playerSize / 4);
			ctx.lineTo(x + playerSize / 2 + playerSize / 4, y + playerSize / 4);
			ctx.closePath();
			ctx.fill();

			// Add eye with better quality
			ctx.fillStyle = 'white';
			ctx.beginPath();
			ctx.arc(x - playerSize / 6, y - playerSize / 8, playerSize / 8, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = 'black';
			ctx.beginPath();
			ctx.arc(x - playerSize / 6, y - playerSize / 8, playerSize / 16, 0, Math.PI * 2);
			ctx.fill();

			ctx.restore();
		} else if (this.currentTheme === 'jungle') {
			// Draw monkey with better anti-aliasing
			ctx.save();

			// Monkey body
			ctx.fillStyle = colors.playerColor;
			ctx.beginPath();
			ctx.arc(x, y, playerSize / 2, 0, Math.PI * 2);
			ctx.fill();

			// Add ears with better quality
			ctx.beginPath();
			ctx.arc(x - playerSize / 3, y - playerSize / 3, playerSize / 6, 0, Math.PI * 2);
			ctx.arc(x + playerSize / 3, y - playerSize / 3, playerSize / 6, 0, Math.PI * 2);
			ctx.fill();

			// Add face with better quality
			ctx.fillStyle = '#F5D0A9';
			ctx.beginPath();
			ctx.arc(x, y, playerSize / 3, 0, Math.PI * 2);
			ctx.fill();

			// Add eyes with better quality
			ctx.fillStyle = 'black';
			ctx.beginPath();
			ctx.arc(x - playerSize / 8, y - playerSize / 8, playerSize / 12, 0, Math.PI * 2);
			ctx.arc(x + playerSize / 8, y - playerSize / 8, playerSize / 12, 0, Math.PI * 2);
			ctx.fill();

			// Add smile with better quality
			ctx.lineWidth = Math.max(2, playerSize / 20);
			ctx.strokeStyle = 'black';
			ctx.beginPath();
			ctx.arc(x, y + playerSize / 12, playerSize / 8, 0, Math.PI);
			ctx.stroke();

			ctx.restore();
		} else if (this.currentTheme === 'candy') {
			// Draw lollipop character with better anti-aliasing
			ctx.save();

			// Lollipop head
			ctx.fillStyle = colors.playerColor;
			ctx.beginPath();
			ctx.arc(x, y - playerSize / 6, playerSize / 2, 0, Math.PI * 2);
			ctx.fill();

			// Add stick with better quality
			ctx.fillStyle = '#8D6E63';
			ctx.fillRect(x - playerSize / 16, y + playerSize / 6, playerSize / 8, playerSize / 2);

			// Add face with better quality
			ctx.fillStyle = 'white';
			ctx.beginPath();
			ctx.arc(x - playerSize / 6, y - playerSize / 4, playerSize / 10, 0, Math.PI * 2);
			ctx.arc(x + playerSize / 6, y - playerSize / 4, playerSize / 10, 0, Math.PI * 2);
			ctx.fill();

			ctx.fillStyle = 'black';
			ctx.beginPath();
			ctx.arc(x - playerSize / 6, y - playerSize / 4, playerSize / 20, 0, Math.PI * 2);
			ctx.arc(x + playerSize / 6, y - playerSize / 4, playerSize / 20, 0, Math.PI * 2);
			ctx.fill();

			// Add smile with better quality
			ctx.lineWidth = Math.max(2, playerSize / 20);
			ctx.strokeStyle = 'black';
			ctx.beginPath();
			ctx.arc(x, y, playerSize / 6, 0.2, Math.PI - 0.2);
			ctx.stroke();

			ctx.fill();

			ctx.restore();
		} else {
			// Default player (backup) with better anti-aliasing
			ctx.fillStyle = colors.playerColor;
			ctx.beginPath();
			ctx.arc(x, y, playerSize / 2, 0, Math.PI * 2);
			ctx.fill();
		}
	}

	/**
	 * Add texture to walls based on theme
	 * @param ctx Canvas context
	 */
	private addWallTexture(ctx: CanvasRenderingContext2D) {
		if (this.currentTheme === 'space') {
			this.addStarsTexture(ctx);
		} else if (this.currentTheme === 'ocean') {
			this.addBubblesTexture(ctx);
		} else if (this.currentTheme === 'jungle') {
			this.addLeavesTexture(ctx);
		} else if (this.currentTheme === 'candy') {
			this.addSprinklesTexture(ctx);
		}
	}

	/**
	 * Add stars texture to walls for space theme
	 * @param ctx Canvas context
	 */
	private addStarsTexture(ctx: CanvasRenderingContext2D) {
		ctx.save();

		// Drastically more stars for dense, high-res effect
		const starCount = 400;

		// Add depth with different sized stars
		for (let i = 0; i < starCount; i++) {
			const x = Math.random() * this.canvasWidth;
			const y = Math.random() * this.canvasHeight;

			// Vary star size and opacity - larger for high-res
			const size = Math.random() * 4 + 1;
			const opacity = Math.random() * 0.6 + 0.4;

			// Draw star
			ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;

			// Draw precise stars for high resolution
			if (Math.random() > 0.7) {
				// Use star shape for some stars
				this.drawSmallStar(ctx, x, y, size);
			} else {
				// Use circle for most stars
				ctx.beginPath();
				ctx.arc(x, y, size, 0, Math.PI * 2);
				ctx.fill();
			}

			// Add more "twinkle" effects
			if (Math.random() > 0.8) {
				const glow = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
				glow.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
				glow.addColorStop(1, 'rgba(255, 255, 255, 0)');
				ctx.fillStyle = glow;
				ctx.beginPath();
				ctx.arc(x, y, size * 4, 0, Math.PI * 2);
				ctx.fill();
			}
		}

		ctx.restore();
	}

	// Helper method to draw small star shapes
	private drawSmallStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
		const points = 5;
		const outerRadius = size;
		const innerRadius = size / 2;

		let rot = (Math.PI / 2) * 3;
		const step = Math.PI / points;

		ctx.beginPath();
		ctx.moveTo(cx, cy - outerRadius);

		for (let i = 0; i < points; i++) {
			const x1 = cx + Math.cos(rot) * outerRadius;
			const y1 = cy + Math.sin(rot) * outerRadius;
			ctx.lineTo(x1, y1);
			rot += step;

			const x2 = cx + Math.cos(rot) * innerRadius;
			const y2 = cy + Math.sin(rot) * innerRadius;
			ctx.lineTo(x2, y2);
			rot += step;
		}

		ctx.closePath();
		ctx.fill();
	}

	/**
	 * Add bubbles texture to walls for ocean theme
	 * @param ctx Canvas context
	 */
	private addBubblesTexture(ctx: CanvasRenderingContext2D) {
		ctx.save();

		// Many more bubbles for high-res effect
		const bubbleCount = 150;

		for (let i = 0; i < bubbleCount; i++) {
			const x = Math.random() * this.canvasWidth;
			const y = Math.random() * this.canvasHeight;

			// Larger, more varied bubbles
			const size = Math.random() * 15 + 5;
			const opacity = Math.random() * 0.2 + 0.15;

			// Draw bubble with improved gradient for 3D effect
			const gradient = ctx.createRadialGradient(x - size / 3, y - size / 3, 0, x, y, size);
			gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity + 0.15})`);
			gradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity + 0.1})`);
			gradient.addColorStop(1, `rgba(255, 255, 255, ${opacity})`);

			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(x, y, size, 0, Math.PI * 2);
			ctx.fill();

			// Add highlight to bubble for more dimension
			ctx.fillStyle = `rgba(255, 255, 255, ${opacity + 0.2})`;
			ctx.beginPath();
			ctx.arc(x - size / 3, y - size / 3, size / 3, 0, Math.PI * 2);
			ctx.fill();

			// Add rim highlight
			ctx.strokeStyle = `rgba(255, 255, 255, ${opacity + 0.1})`;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.arc(x, y, size - 1, 0, Math.PI * 2);
			ctx.stroke();
		}

		ctx.restore();
	}

	/**
	 * Add leaves texture to walls for jungle theme
	 * @param ctx Canvas context
	 */
	private addLeavesTexture(ctx: CanvasRenderingContext2D) {
		ctx.save();

		// More leaves for density
		const leafCount = 50;

		for (let i = 0; i < leafCount; i++) {
			const x = Math.random() * this.canvasWidth;
			const y = Math.random() * this.canvasHeight;

			// Vary leaf size and rotation
			const size = Math.random() * 15 + 5;
			const angle = Math.random() * Math.PI;
			const opacity = Math.random() * 0.1 + 0.05;

			// Draw leaf with gradient
			const leafGradient = ctx.createLinearGradient(x - size, y, x + size, y);
			leafGradient.addColorStop(0, `rgba(255, 255, 255, ${opacity})`);
			leafGradient.addColorStop(0.5, `rgba(255, 255, 255, ${opacity + 0.05})`);
			leafGradient.addColorStop(1, `rgba(255, 255, 255, ${opacity})`);

			ctx.fillStyle = leafGradient;

			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(angle);
			ctx.beginPath();
			ctx.ellipse(0, 0, size, size / 2, 0, 0, Math.PI * 2);
			ctx.fill();

			// Add leaf vein
			ctx.strokeStyle = `rgba(255, 255, 255, ${opacity + 0.05})`;
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(-size, 0);
			ctx.lineTo(size, 0);
			ctx.stroke();

			ctx.restore();
		}

		ctx.restore();
	}

	/**
	 * Add sprinkles texture to walls for candy theme
	 * @param ctx Canvas context
	 */
	private addSprinklesTexture(ctx: CanvasRenderingContext2D) {
		ctx.save();

		// Bright, vibrant colors
		const sprinkleColors = ['#FF5252', '#FFEB3B', '#2196F3', '#4CAF50', '#9C27B0', '#FF9800'];

		// More sprinkles for density
		const sprinkleCount = 150;

		for (let i = 0; i < sprinkleCount; i++) {
			const x = Math.random() * this.canvasWidth;
			const y = Math.random() * this.canvasHeight;

			// Vary sprinkle size and rotation
			const width = Math.random() * 8 + 4;
			const height = Math.random() * 3 + 2;
			const angle = Math.random() * Math.PI;

			// Pick random color
			const color = sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)];

			// Draw rounded sprinkle
			ctx.save();
			ctx.translate(x, y);
			ctx.rotate(angle);

			// Create gradient for 3D effect
			const sprinkleGradient = ctx.createLinearGradient(
				-width / 2,
				-height / 2,
				width / 2,
				height / 2
			);
			sprinkleGradient.addColorStop(0, color);
			sprinkleGradient.addColorStop(1, shadeColor(color, -20)); // darker shade

			ctx.fillStyle = sprinkleGradient;

			// Draw rounded rectangle
			roundRect(ctx, -width / 2, -height / 2, width, height, height / 2);
			ctx.fill();

			ctx.restore();
		}

		ctx.restore();

		// Helper function to darken a color
		function shadeColor(color: string, percent: number) {
			let R = parseInt(color.substring(1, 3), 16);
			let G = parseInt(color.substring(3, 5), 16);
			let B = parseInt(color.substring(5, 7), 16);

			R = Math.floor((R * (100 + percent)) / 100);
			G = Math.floor((G * (100 + percent)) / 100);
			B = Math.floor((B * (100 + percent)) / 100);

			R = R < 255 ? R : 255;
			G = G < 255 ? G : 255;
			B = B < 255 ? B : 255;

			const RR = R.toString(16).length == 1 ? '0' + R.toString(16) : R.toString(16);
			const GG = G.toString(16).length == 1 ? '0' + G.toString(16) : G.toString(16);
			const BB = B.toString(16).length == 1 ? '0' + B.toString(16) : B.toString(16);

			return '#' + RR + GG + BB;
		}

		// Helper function to draw rounded rectangle
		function roundRect(
			ctx: CanvasRenderingContext2D,
			x: number,
			y: number,
			width: number,
			height: number,
			radius: number
		) {
			ctx.beginPath();
			ctx.moveTo(x + radius, y);
			ctx.lineTo(x + width - radius, y);
			ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
			ctx.lineTo(x + width, y + height - radius);
			ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
			ctx.lineTo(x + radius, y + height);
			ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
			ctx.lineTo(x, y + radius);
			ctx.quadraticCurveTo(x, y, x + radius, y);
			ctx.closePath();
		}
	}

	/**
	 * Add decorations to path cells based on theme
	 * @param ctx Canvas context
	 * @param x X position
	 * @param y Y position
	 */
	private addPathDecoration(ctx: CanvasRenderingContext2D, x: number, y: number) {
		const centerX = x + this.cellSize / 2;
		const centerY = y + this.cellSize / 2;

		ctx.save();

		if (this.currentTheme === 'space') {
			// Small planet with gradient
			const radius = this.cellSize / 6;
			const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
			gradient.addColorStop(0, 'rgba(100, 150, 255, 0.3)');
			gradient.addColorStop(1, 'rgba(70, 100, 200, 0.15)');

			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
			ctx.fill();

			// Add subtle ring
			if (Math.random() > 0.5) {
				ctx.strokeStyle = 'rgba(150, 200, 255, 0.2)';
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.ellipse(
					centerX,
					centerY,
					radius * 1.3,
					radius * 0.4,
					Math.random() * Math.PI,
					0,
					Math.PI * 2
				);
				ctx.stroke();
			}
		} else if (this.currentTheme === 'ocean') {
			// Small fish or shell with gradient
			ctx.save();

			const size = this.cellSize / 8;
			const angle = Math.PI / 4;

			ctx.translate(centerX, centerY);
			ctx.rotate(angle);

			const gradient = ctx.createLinearGradient(-size, 0, size, 0);
			gradient.addColorStop(0, 'rgba(70, 170, 230, 0.3)');
			gradient.addColorStop(1, 'rgba(100, 200, 255, 0.2)');

			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.ellipse(0, 0, size, size / 2, 0, 0, Math.PI * 2);
			ctx.fill();

			// Add details for shell-like appearance
			if (Math.random() > 0.5) {
				ctx.strokeStyle = 'rgba(150, 220, 255, 0.3)';
				ctx.lineWidth = 1;
				for (let i = 0; i < 3; i++) {
					ctx.beginPath();
					ctx.ellipse(0, 0, size * (1 - i * 0.2), (size / 2) * (1 - i * 0.2), 0, 0, Math.PI * 2);
					ctx.stroke();
				}
			}

			ctx.restore();
		} else if (this.currentTheme === 'jungle') {
			// Small leaf with gradient
			ctx.save();

			const size = this.cellSize / 10;
			const angle = Math.PI / 3;

			ctx.translate(centerX, centerY);
			ctx.rotate(angle);

			const gradient = ctx.createLinearGradient(-size * 2, 0, size * 2, 0);
			gradient.addColorStop(0, 'rgba(80, 180, 80, 0.3)');
			gradient.addColorStop(1, 'rgba(100, 200, 100, 0.2)');

			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.ellipse(0, 0, size * 2, size, 0, 0, Math.PI * 2);
			ctx.fill();

			// Add leaf vein
			ctx.strokeStyle = 'rgba(120, 200, 120, 0.3)';
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(-size * 2, 0);
			ctx.lineTo(size * 2, 0);
			ctx.stroke();

			ctx.restore();
		} else if (this.currentTheme === 'candy') {
			// Small candy with gradient
			const radius = this.cellSize / 8;

			// Sweet candy gradient
			const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
			gradient.addColorStop(0, 'rgba(255, 180, 220, 0.4)');
			gradient.addColorStop(1, 'rgba(255, 150, 200, 0.2)');

			ctx.fillStyle = gradient;
			ctx.beginPath();
			ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
			ctx.fill();

			// Add candy details - swirl or sprinkles
			if (Math.random() > 0.5) {
				// Swirl
				ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
				ctx.lineWidth = 1;
				ctx.beginPath();
				ctx.arc(centerX, centerY, radius * 0.6, 0, Math.PI * 4);
				ctx.stroke();
			} else {
				// Sprinkles
				const sprinkleColors = ['rgba(255, 255, 255, 0.4)', 'rgba(255, 255, 100, 0.4)'];
				for (let i = 0; i < 3; i++) {
					const angle = Math.random() * Math.PI * 2;
					const distance = Math.random() * radius * 0.7;
					const x = centerX + Math.cos(angle) * distance;
					const y = centerY + Math.sin(angle) * distance;

					ctx.fillStyle = sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)];
					ctx.fillRect(x, y, 2, 1);
				}
			}
		}

		ctx.restore();
	}

	/**
	 * Draw a star shape for the goal
	 * @param ctx Canvas context
	 * @param cx Center X position
	 * @param cy Center Y position
	 */
	private drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
		ctx.save();

		const spikes = 5;
		const outerRadius = this.cellSize / 3;
		const innerRadius = this.cellSize / 6;

		let rot = (Math.PI / 2) * 3;
		let x = cx;
		let y = cy;
		let step = Math.PI / spikes;

		// Create gradient for star
		const gradient = ctx.createRadialGradient(cx, cy, innerRadius * 0.5, cx, cy, outerRadius);
		gradient.addColorStop(0, '#FFEE58'); // bright center
		gradient.addColorStop(1, '#FFCC00'); // deeper yellow edge

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

		// Fill with gradient
		ctx.fillStyle = gradient;
		ctx.fill();

		// Add outline
		ctx.strokeStyle = '#FFA000';
		ctx.lineWidth = 2;
		ctx.stroke();

		// Add glow effect
		const glowGradient = ctx.createRadialGradient(
			cx,
			cy,
			outerRadius * 0.9,
			cx,
			cy,
			outerRadius * 1.5
		);
		glowGradient.addColorStop(0, 'rgba(255, 215, 0, 0.2)');
		glowGradient.addColorStop(1, 'rgba(255, 215, 0, 0)');

		ctx.fillStyle = glowGradient;
		ctx.beginPath();
		ctx.arc(cx, cy, outerRadius * 1.5, 0, Math.PI * 2);
		ctx.fill();

		ctx.restore();
	}
}