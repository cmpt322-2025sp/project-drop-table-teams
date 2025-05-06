<script lang="ts">
	import { Button } from '$lib/components';
	import './vars.css';
	import './style.css';
	let { data } = $props();
	let { user, profile } = $derived(data);

	// Use real user data or fallback to mock data
	let studentData = $derived({
		name: user?.email?.split('@')[0] || 'Student',
		level: profile?.level || 1,
		points: profile?.points || 0
	});

	// Navigation with server-side redirect
	function navigateToGame() {
		// Use our dedicated server-side redirect endpoint
		// This forces a proper redirect through the server
		window.location.href = '/private/student/dashboard/game-redirect';
	}
	
	// Navigate to stats page
	function navigateToStats() {
		window.location.href = '/private/student/stats';
	}
</script>

<div class="dashboard-container">
	<div class="user-info">
		<div class="user-avatar">
			<svg
				viewBox="0 0 24 24"
				width="24"
				height="24"
				stroke="currentColor"
				stroke-width="2"
				fill="none"
			>
				<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
				<circle cx="12" cy="7" r="4" />
			</svg>
		</div>
		<div class="user-details">
			<div class="user-name">{studentData.name}</div>
			<div class="user-stats">Level {studentData.level} • {studentData.points} points</div>
		</div>
	</div>

	<div class="logo">Math Maze</div>

	<div class="start-button">
		<Button
			variant="primary"
			size="lg"
			style="width: var(--dashboard-button-width); height: var(--dashboard-button-height); font-size: var(--dashboard-button-font-size);"
			onClick={navigateToGame}
		>
			START GAME
		</Button>
	</div>

	<div class="view-progress-button">
		<Button variant="secondary" size="md" rounded={true} onClick={navigateToStats}>View Progress</Button>
	</div>
</div>

<style>
	/* Component-specific styles */
	.dashboard-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		position: relative;
		width: 100%;
		height: 100%;
		padding: 1rem;
	}

	.user-info {
		position: absolute;
		top: 1rem;
		left: 1rem;
		display: flex;
		align-items: center;
		background-color: rgba(255, 255, 255, 0.1);
		padding: 0.5rem 1rem;
		border-radius: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		animation: slideIn 1s ease;
	}

	.user-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		background-color: var(--primary-color-light);
		border-radius: 50%;
		margin-right: 0.75rem;
		color: var(--text-color-light);
	}

	.user-details {
		display: flex;
		flex-direction: column;
	}

	.user-name {
		font-weight: 600;
		font-size: 1rem;
		color: var(--text-color);
	}

	.user-stats {
		font-size: 0.8rem;
		color: var(--text-color-muted);
	}

	@keyframes slideIn {
		from {
			transform: translateX(-100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.logo {
		color: var(--text-color);
		font-family: 'NovaFlat-Book', sans-serif;
		font-size: var(--dashboard-logo-size);
		line-height: 1.2;
		font-weight: 700;
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
		margin-top: calc(var(--dashboard-spacing) * 0.5);
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
