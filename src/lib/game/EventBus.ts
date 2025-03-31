import { Events } from 'phaser';

/**
 * EventBus for communication between Phaser and Svelte
 * Allows bidirectional event passing between game and UI
 */
export const EventBus = new Events.EventEmitter();