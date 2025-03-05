import { writable } from 'svelte/store';

// Define available themes
export const themes = ['space', 'ocean', 'jungle', 'candy'];

// Create a writable store for the current theme
export const theme = writable<string>(
	// Initialize with a random theme
	themes[Math.floor(Math.random() * themes.length)]
);

// Theme colors for consistent styling
export const themeColors = {
	space: {
		background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)',
		wallColor: '#2C3E50',
		pathColor: '#F9FAFB',
		goalColor: '#FFD700',
		mathProblemColor: '#9B59B6',
		solvedColor: '#3498DB',
		playerColor: '#E74C3C',
		textColor: 'white'
	},
	ocean: {
		background: 'linear-gradient(135deg, #1A237E, #0277BD, #00BCD4)',
		wallColor: '#1E88E5',
		pathColor: '#E3F2FD',
		goalColor: '#FFEB3B',
		mathProblemColor: '#26A69A',
		solvedColor: '#66BB6A',
		playerColor: '#FF7043',
		textColor: 'white'
	},
	jungle: {
		background: 'linear-gradient(135deg, #004D40, #00796B, #8BC34A)',
		wallColor: '#33691E',
		pathColor: '#DCEDC8',
		goalColor: '#FFC107',
		mathProblemColor: '#FF9800',
		solvedColor: '#8BC34A',
		playerColor: '#7B1FA2',
		textColor: 'white'
	},
	candy: {
		background: 'linear-gradient(135deg, #880E4F, #C2185B, #F06292)',
		wallColor: '#E91E63',
		pathColor: '#FCE4EC',
		goalColor: '#FFEB3B',
		mathProblemColor: '#AB47BC',
		solvedColor: '#26C6DA',
		playerColor: '#7CB342',
		textColor: 'white'
	}
};

/**
 * Set the current theme
 * @param newTheme Theme name
 */
export function setTheme(newTheme: string) {
	if (themes.includes(newTheme)) {
		theme.set(newTheme);
	}
}

/**
 * Cycle to the next theme
 */
export function nextTheme() {
	theme.update((currentTheme) => {
		const currentIndex = themes.indexOf(currentTheme);
		const nextIndex = (currentIndex + 1) % themes.length;
		return themes[nextIndex];
	});
}

/**
 * Get colors for a specific theme
 * @param themeName Theme name
 * @returns Theme colors
 */
export function getThemeColors(themeName: string) {
	return themeColors[themeName as keyof typeof themeColors] || themeColors.space;
}
