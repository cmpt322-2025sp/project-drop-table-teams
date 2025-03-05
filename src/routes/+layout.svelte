<script>
	// Global layout for Math Maze application
</script>

<div class="app-container">
	<slot />
</div>

<style>
	/* Global styles for Math Maze */
	:global(:root) {
		/* Colors */
		--background-green: #769576;
		--button-orange: #ff9d00;
		--button-secondary: #f38f47;
		--text-color: #000000;

		/* Shadows */
		--button-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
		--button-shadow-hover: 0 6px 12px rgba(0, 0, 0, 0.25);
		--button-shadow-active: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	:global(*) {
		box-sizing: border-box;
		margin: 0;
		padding: 0;
	}

	:global(html, body) {
		height: 100%;
		width: 100%;
		font-family: sans-serif;
	}

	:global(body) {
		display: flex;
		flex-direction: column;
	}

	/* App container */
	.app-container {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		width: 100%;
	}

	/* Button Styles */
	:global(.btn) {
		cursor: pointer;
		border: none;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
		z-index: 1;
		border-radius: 8px;
		font-family: inherit;
		font-weight: bold;
		box-shadow: var(--button-shadow);
	}

	:global(.btn::after) {
		content: '';
		position: absolute;
		background: rgba(255, 255, 255, 0.3);
		width: 100%;
		height: 100%;
		left: -100%;
		top: 0;
		border-radius: 8px;
		z-index: -1;
		transition: all 0.4s ease;
	}

	:global(.btn:hover::after) {
		left: 0;
	}

	:global(.btn:hover) {
		transform: translateY(-3px);
		box-shadow: var(--button-shadow-hover);
	}

	:global(.btn:active) {
		transform: translateY(1px);
		box-shadow: var(--button-shadow-active);
	}

	/* Button variants */
	:global(.btn-primary) {
		background: var(--button-orange);
		color: var(--text-color);
		font-family: 'NovaFlat-Book', sans-serif;
		font-weight: bold;
	}

	:global(.btn-secondary) {
		background: var(--button-secondary);
		color: var(--text-color);
		font-family: 'CrimsonText-SemiBold', sans-serif;
		font-weight: 600;
	}

	:global(.btn-round) {
		border-radius: 50px;
	}

	:global(.btn-round::after) {
		border-radius: 50px;
	}

	/* Button sizes */
	:global(.btn-lg) {
		padding: 0.75rem 1.5rem;
		font-size: 1.2rem;
	}

	:global(.btn-md) {
		padding: 0.5rem 1rem;
		font-size: 1rem;
	}

	:global(.btn-sm) {
		padding: 0.3rem 0.75rem;
		font-size: 0.875rem;
	}

	:global(.btn-icon) {
		width: 3rem;
		height: 3rem;
		font-size: 1.2rem;
		border-radius: 50%;
	}

	:global(a) {
		text-decoration: none;
	}
</style>
