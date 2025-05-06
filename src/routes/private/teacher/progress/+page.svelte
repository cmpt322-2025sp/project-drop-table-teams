<script lang="ts">
	import { Button } from '$lib/components';
	import { onMount } from 'svelte';
	
	interface Class {
		id: string;
		name: string;
		description?: string;
		students: Student[];
	}
	
	interface Student {
		id: string;
		email: string;
		level: number;
		points: number;
		role: string;
		created_at: string;
	}

	interface Game {
		student_id: string;
		wrong_addition: number;
		wrong_subtraction: number;
		wrong_place: number;
		problems_total: number;
		problems_solved: number;
		time_spent_seconds: number;
		completed: boolean;
		created_at: string;
	}

	// Classes will be used to allow teachers to sort the data per their class. Students is needed for their email.
	let { data } = $props();
	let { classes, students, games } = $derived(data as { 
		classes: Class[];
		students: Student[]; 
		games: Game[];
	});
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
	<h1>Progress Tracking</h1>
	<p class="welcome-message">View detailed performance reports for your students.</p>
	<p>This will display a report of the statistics for the class.</p>

	<table>
		<thead>
			<tr>
				<th scope="col">Email</th>
				<th scope="col">Wrong Addition</th>
				<th scope="col">Wrong Subtraction</th>
				<th scope="col">Wrong Number Placement</th>
				<th scope="col">Problems Solved</th>
				<th scope="col">Time Played</th>
			</tr>
		</thead>
		<tbody>
			{#each games as game}
				<tr>
					<td>{game.student_id}</td> <!-- to be changed to students email once the data starts populating the table -->
					<td>{game.wrong_addition}</td>
					<td>{game.wrong_subtraction}</td>
					<td>{game.wrong_place}</td>
					<td>{game.problems_solved}</td>
					<td>{game.time_spent_seconds}</td>
				</tr>
			{/each}
		</tbody>
	</table>
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

	table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 1.5rem;
	}

	th,
	td {
		padding: 8px;
		border: 1px solid #ddd;
		text-align: left;
	}

	th {
		background-color: var(--background-green);
		text-align: center;
		color: white;
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
