// This page requires client-side rendering for Phaser to work
export const ssr = false; // Disable server-side rendering

// Forward data from the server to the client component
export const load = async ({ data, depends }) => {
	// Add dependency to ensure this page reloads when needed
	depends('app:gamePage');

	return {
		...data
	};
};
