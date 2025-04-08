<script>
	import { Button } from '$lib/components';
</script>

<header class="teacher-header">
	<div class="logo">Math Maze</div>
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
			<div class="user-name">Teacher Account</div>
			<div class="user-role">Administrator</div>
		</div>
	</div>
</header>

<main class="teacher-content">
	<h1>Game Settings</h1>
	<p class="welcome-message">Customize game difficulty and math problems.</p>

<!-- 
	add to script later
	// Navigation with server-side redirect
    function navigateToStudentView() {
        // Use our dedicated server-side redirect endpoint
        // This forces a proper redirect through the server
        window.location.href = '/private/teacher/student-redict/game';
    }
	<div class="action-buttons">
		<Button variant="secondary" size="md" rounded={true} onClick={navigateToStudentView}>
			<div class="button-content">
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					class="button-icon"
				>
					<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
					<circle cx="12" cy="12" r="3"></circle>
				</svg>
				Student View
			</div>
		</Button>
	</div>
	-->
</main>

<style>
	.teacher-header {
		background-color: var(--background-green);
		color: white;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.logo {
		font-family: 'NovaFlat-Book', sans-serif;
		font-size: 2rem;
		font-weight: 700;
	}

	.user-info {
		display: flex;
		align-items: center;
		background-color: rgba(255, 255, 255, 0.1);
		padding: 0.5rem 1rem;
		border-radius: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.user-avatar {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 2.5rem;
		height: 2.5rem;
		background-color: rgba(255, 255, 255, 0.2);
		border-radius: 50%;
		margin-right: 0.75rem;
		color: white;
	}

	.user-details {
		display: flex;
		flex-direction: column;
	}

	.user-name {
		font-weight: 600;
		font-size: 1rem;
	}

	.user-role {
		font-size: 0.8rem;
		opacity: 0.9;
	}

	.teacher-content {
		flex: 1;
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	h1 {
		color: #333;
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	.welcome-message {
		font-size: 1.1rem;
		color: #666;
		margin-bottom: 2rem;
		line-height: 1.5;
	}

	.action-buttons {
        margin-bottom: 2rem;
        display: flex;
        gap: 1rem;
    }
	
	.button-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

	@media (max-width: 768px) {
		.teacher-header {
			padding: 1rem;
			flex-direction: column;
			gap: 1rem;
		}

		.teacher-content {
			padding: 1.5rem;
		}
	}
</style>
