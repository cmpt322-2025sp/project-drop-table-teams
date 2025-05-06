<script lang="ts">
	import { Button } from '$lib/components';
	let { data } = $props();
	let { user } = $derived(data);

	// Extract username from email or use default
	let teacherName = $derived(user?.email?.split('@')[0] || 'Teacher Account');

	// Navigation with server-side redirect
	function navigateToStudentView() {
		// Use our dedicated server-side redirect endpoint
		// This forces a proper redirect through the server
		window.location.href = '/private/teacher/student-redirect';
	}
</script>

<div class="teacher-dashboard">
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
				<div class="user-name">{teacherName}</div>
				<div class="user-role">Administrator</div>
			</div>
		</div>
	</header>

	<main class="teacher-content">
		<h1>Teacher Dashboard</h1>
		<p class="welcome-message">
			Welcome to the Math Maze Teacher Portal! Here you can manage your students and view their
			progress.
		</p>
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

		<div class="dashboard-cards">
			<div class="card">
				<div class="card-icon students-icon">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
						<circle cx="9" cy="7" r="4"></circle>
						<path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
						<path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
					</svg>
				</div>
				<h2>Student Management</h2>
				<p>Add, edit, or remove students from your class.</p>
				<div>
					<a href="/private/teacher/management">
						<Button variant="primary" size="md" rounded={true}>Manage Students</Button>
					</a>
				</div>
			</div>

			<div class="card">
				<div class="card-icon progress-icon">
					<svg
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
					>
						<path d="M18 20V10"></path>
						<path d="M12 20V4"></path>
						<path d="M6 20v-6"></path>
					</svg>
				</div>
				<h2>Progress Tracking</h2>
				<p>View detailed performance reports for your students.</p>
				<div>
					<a href="/private/teacher/progress">
						<Button variant="primary" size="md" rounded={true}>View Reports</Button>
					</a>
				</div>
			</div>
		</div>
	</main>

	<footer class="teacher-footer">
		<p>Math Maze Teacher Portal &copy; 2025</p>
	</footer>
</div>

<style>
	.teacher-dashboard {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f5f7fa;
		color: #333;
	}

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

	.button-icon {
		margin-right: 0.25rem;
	}

	.dashboard-cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 10rem;
		margin-top: 2rem;
	}

	.card {
		background-color: white;
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
		transition:
			transform 0.3s ease,
			box-shadow 0.3s ease;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.card:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
	}

	.card-icon {
		width: 60px;
		height: 60px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: 1rem;
		color: white;
	}

	.students-icon {
		background-color: #4caf50;
	}

	.progress-icon {
		background-color: #2196f3;
	}

	.card h2 {
		font-size: 1.3rem;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.card p {
		color: #666;
		margin-bottom: 1.5rem;
		flex-grow: 1;
	}

	.teacher-footer {
		background-color: #333;
		color: white;
		padding: 1rem 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	@media (max-width: 768px) {
		.dashboard-cards {
			grid-template-columns: 1fr;
		}

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
