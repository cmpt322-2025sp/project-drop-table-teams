<script lang="ts">
	import { Button } from '$lib/components';
	import { FacebookInstantGamesPlugin } from 'phaser';
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

	interface Enrollment {
		id: string;
		class_id: string;
		student_id: string;
	}

	// Classes will be used to allow teachers to sort the data per their class. Students is needed for their email.
	let { data } = $props();
	let { classes, students, games, enrollments } = $derived(data as { 
		classes: Class[];
		students: Student[]; 
		games: Game[];
		enrollments: Enrollment[]
	});

	let selectedClass = $state<Class | null>(null);
	let filteredStudents = $state<Student[]>([]);
	let availableStudents = $state<Student[]>([]);
	let initialized = $state<boolean>(false);

	// Initialize data on mount instead of using $effect to avoid recursion
	onMount(() => {
		initializeData();
	});

	// Initialize data without reactive effects
	function initializeData() {
		if (!initialized && classes && students && enrollments) {
			// Process data for each class
			if (classes && students && enrollments) {
				// Create a map of enrolled students by class
				const classEnrollments = new Map<string, Student[]>();

				// Initialize each class's students array
				classes.forEach((cls) => {
					classEnrollments.set(cls.id, []);
				});

				// Populate the map with enrolled students for each class
				enrollments.forEach((enrollment) => {
					const classStudents = classEnrollments.get(enrollment.class_id) || [];
					const student = students.find((s) => s.id === enrollment.student_id);
					if (student) {
						classStudents.push(student);
					}
				});

				// Assign the students to each class
				classes.forEach((cls) => {
					cls.students = classEnrollments.get(cls.id) || [];
				});

				// Set initial selected class if needed
				if (classes.length > 0 && !selectedClass) {
					selectedClass = classes[0];
					
					if (selectedClass.students) {
						filteredStudents = [...selectedClass.students];
						
						// Calculate students not in this class
						const enrolledIds = new Set(filteredStudents.map((s) => s.id));
						availableStudents = students.filter((student) => !enrolledIds.has(student.id));
					}
				}


			}
			
			initialized = true;
		}
	}

	// Handle class selection change
	function handleClassChange(newClass: Class) {
		selectedClass = newClass;
		
		if (selectedClass && selectedClass.students) {
			filteredStudents = [...selectedClass.students];
			
			// Calculate students not in this class
			const enrolledIds = new Set(filteredStudents.map((s) => s.id));
			availableStudents = students.filter((student) => !enrolledIds.has(student.id));
		}
	}

	// Handle class selection event
	function onClassSelectChange(event: Event) {
	  const select = event.target as HTMLSelectElement;
	  const newClass = classes.find(c => c.id === select.value) || classes[0];
	  handleClassChange(newClass);
	}
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
	<p class="welcome-message">View detailed performance reports for your students. Choose a class to view students in that class.</p>

	<div class="class-selector">
		<label for="class-select">Select Class:</label>
		<select 
			id="class-select" 
			class="custom-select btn-primary btn-round" 
			onchange={onClassSelectChange}
		>
			{#each classes as cls}
				<option value={cls.id} selected={selectedClass?.id === cls.id}>{cls.name}</option>
			{/each}
		</select>
	</div>

	{#if selectedClass}
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
				{#if filteredStudents && filteredStudents.length > 0}
					{#each filteredStudents as student}
						{#if games && games.length > 0}
							{#each games as game}
								<tr>
									<td>{student.email}</td> 
									<td>{game.wrong_addition}</td>
									<td>{game.wrong_subtraction}</td>
									<td>{game.wrong_place}</td>
									<td>{game.problems_solved}</td>
									<td>{game.time_spent_seconds}</td>
								</tr>
							
							{/each}
						{:else}
							<tr>
								<td colspan="6" class="missing-data">There is no game data for this student yet: {student.email}</td>
							</tr>
						{/if}
					{/each}
				{:else}
					<tr>
						<td colspan="6" class="missing-data">There are no students in this class. Add students to this class in the Student Management page.</td>
					</tr>
				{/if}
			</tbody>
		</table>
	{:else}
		<div class="missing-data">
			<p>You don't have any classes yet. Create a class to get to see students progress.</p>
		</div>
	{/if}
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

	label {
		margin-bottom: 1.5rem;
	}

	.class-selector {
		font-size: 1.1rem;
		font-family: 'NovaFlat-Book', sans-serif;
		text-align: center;
		display: flex;
		margin-bottom: 1.5rem;
		width: 250px;
		height: 40px;
	}

	.class-selector label {
		font-size: 1.1rem;
		font-family: 'NovaFlat-Book', sans-serif;
		text-align: left;
		width: 250px;
	}

	.class-selector select.custom-select {
		appearance: none;
		background-color: var(--button-orange);
		border: none;
		border-radius: 50px;
		color: var(--text-color);
		cursor: pointer;
		padding: 0.5rem 1.5rem;
		font-family: 'NovaFlat-Book', sans-serif;
		font-weight: bold;
		font-size: 0.85rem;
		text-align: center;
		box-shadow: var(--button-shadow);
		transition: all 0.3s ease;
		width: 100%;
		position: relative;
		overflow: hidden;
	}
	
	.class-selector select.custom-select:hover {
		transform: translateY(-3px);
		box-shadow: var(--button-shadow-hover);
	}
	
	.class-selector select.custom-select:focus {
		outline: none;
	}

	.missing-data {
		text-align: center;
		padding: 2rem;
		color: #666;
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

		.class-selector select.custom-select {
			width: 100%;
		}
	}
</style>
