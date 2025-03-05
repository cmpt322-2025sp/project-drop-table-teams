<script lang="ts">
	import { Button } from '$lib/components';
	import './vars.css';
	import './style.css';
</script>

<div class="dashboard-container">
	<div class="logo">Math Maze</div>

	<div class="start-button">
		<a href="/game">
			<Button
				variant="primary"
				size="lg"
				style="width: var(--dashboard-button-width); height: var(--dashboard-button-height); font-size: var(--dashboard-button-font-size);"
			>
				START GAME
			</Button>
		</a>
	</div>

	<div class="view-progress-button">
		<Button variant="secondary" size="md" rounded={true}>View Progress</Button>
	</div>
</div>

<style>
	/* Component-specific styles */
	.dashboard-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo {
		color: var(--text-color);
		font-family: 'NovaFlat-Book', sans-serif;
		font-size: var(--dashboard-logo-size);
		line-height: 1.2;
		font-weight: 400;
		margin-bottom: var(--dashboard-spacing);
		text-align: center;
		animation: fadeIn 1.5s ease;
	}

	.start-button {
		margin-bottom: var(--dashboard-spacing);
		animation: scaleIn 1s ease;
		transition: transform 0.3s ease;
	}

	.view-progress-button {
		margin-top: var(--dashboard-spacing);
		animation: fadeIn 2s ease;
	}

	/* Simple animations */
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes scaleIn {
		from {
			transform: scale(0.8);
			opacity: 0;
		}
		to {
			transform: scale(1);
			opacity: 1;
		}
	}
</style>
