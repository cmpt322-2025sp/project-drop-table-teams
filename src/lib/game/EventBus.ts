import { Events } from 'phaser';
import type { Cell } from '$lib/Maze';
import type { MazeScene } from './MazeScene';

/**
 * Type definitions for events
 */
export interface PlayerMovedEvent {
	direction: 'up' | 'down' | 'left' | 'right';
	position?: { row: number; col: number };
}

export interface InvalidMoveEvent {
	direction: 'up' | 'down' | 'left' | 'right';
}

export interface ShowMathProblemEvent {
	cell: Cell;
}

export interface GoalReachedEvent {
	// No additional data needed for now
}

export interface MazeSceneReadyEvent {
	scene: MazeScene;
}

export interface ThemeUpdatedEvent {
	theme: string;
}

/**
 * EventBus for communication between Phaser and Svelte
 * Allows bidirectional event passing between game and UI
 */
export const EventBus = new Events.EventEmitter();
