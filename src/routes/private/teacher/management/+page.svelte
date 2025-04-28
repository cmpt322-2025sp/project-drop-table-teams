<script>
	import { Button } from '$lib/components';

	let { data } = $props();
	let { classes, students, enrollments } = $derived(data);
	let selectedClass = $state(null);
	let filteredStudents = $state([]);
	let availableStudents = $state([]);

	// Process data when it changes
	$effect(() => {
		// Process data for each class
		if (classes && students && enrollments) {
			// Create a map of enrolled students by class
			const classEnrollments = new Map();

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
				updateFilteredStudents();
			}
		}
	});

	// Update the filtered students when selected class changes
	$effect(() => {
		if (selectedClass) {
			updateFilteredStudents();
		}
	});

	// Function to update filtered students
	function updateFilteredStudents() {
		if (selectedClass && selectedClass.students) {
			filteredStudents = [...selectedClass.students];

			// Calculate students not in this class
			const enrolledIds = new Set(filteredStudents.map((s) => s.id));
			availableStudents = students.filter((student) => !enrolledIds.has(student.id));
		}
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
	<h1>Student Management</h1>
	<p class="welcome-message">Add, edit, or remove students from your classes.</p>

	<div class="class-selector">
		<label for="class-select">Select Class:</label>
		<select id="class-select" bind:value={selectedClass}>
			{#each classes as cls}
				<option value={cls}>{cls.name}</option>
			{/each}
		</select>
	</div>

	{#if selectedClass}
		<div class="class-info">
			<h2>{selectedClass.name}</h2>
			{#if selectedClass.description}
				<p>{selectedClass.description}</p>
			{/if}
		</div>

		<table>
			<thead>
				<tr>
					<th scope="col">Email</th>
					<th scope="col">Level</th>
					<th scope="col">Points</th>
					<th scope="col">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#if filteredStudents && filteredStudents.length > 0}
					{#each filteredStudents as student}
						<tr>
							<td>{student.email}</td>
							<td>{student.level}</td>
							<td>{student.points}</td>
							<td>
								<Button variant="secondary" size="sm" rounded={true}>Remove</Button>
							</td>
						</tr>
					{/each}
				{:else}
					<tr>
						<td colspan="4" class="no-students">No students enrolled in this class</td>
					</tr>
				{/if}
			</tbody>
		</table>

		{#if availableStudents.length > 0}
			<div class="available-students">
				<h3>Available Students</h3>
				<p>Select students to add to this class:</p>
				<div class="student-list">
					{#each availableStudents as student}
						<div class="student-card">
							<div class="student-info">
								<div class="student-name">{student.email}</div>
								<div class="student-details">Level: {student.level} | Points: {student.points}</div>
							</div>
							<Button variant="primary" size="sm" rounded={true}>Add</Button>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<div class="no-classes">
			<p>You don't have any classes yet. Create a class to get started.</p>
		</div>
	{/if}

	<br />
	<div class="action-buttons">
		<div style="padding: 1rem">
			<Button variant="primary" size="md" rounded={true}>Add New Student</Button>
		</div>
		<div style="padding: 1rem">
			<Button variant="primary" size="md" rounded={true}>Create New Class</Button>
		</div>
	</div>	
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

	h2 {
		color: #444;
		font-size: 1.5rem;
		margin: 1rem 0;
	}

	h3 {
		color: #555;
		font-size: 1.3rem;
		margin: 1.5rem 0 0.5rem;
	}

	.welcome-message {
		font-size: 1.1rem;
		color: #666;
		margin-bottom: 2rem;
		line-height: 1.5;
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

	.class-selector select {
		appearance: none;
		width: 100%;
		font-size: .85rem;
		font-family: 'NovaFlat-Book', sans-serif;
		font-weight: bold;
		text-align: center;
		padding: 0.5rem 1rem;
		background-color: #FF9D00;
		border: 1px solid #ddd;
		border-radius: 50px;
		color: #000;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		position: relative;
		z-index: 1;
		box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
	}

	.class-selector select::after {
		border-radius: 50px;
	}

	.class-selector select::after {
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


	.class-info {
		margin-bottom: 1.5rem;
	}

	.no-students,
	.no-classes,
	.no-available {
		text-align: center;
		padding: 2rem;
		color: #666;
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

	.available-students {
		margin-top: 2rem;
		border-top: 1px solid #eee;
		padding-top: 1rem;
	}

	.student-list {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.student-card {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.75rem;
		border: 1px solid #eee;
		border-radius: 4px;
		background-color: #f9f9f9;
	}

	.student-info {
		flex: 1;
	}

	.student-name {
		font-weight: 600;
	}

	.student-details {
		font-size: 0.8rem;
		color: #666;
	}

	.action-buttons {
		display: flex;
		justify-content: left;
		margin-top: 2rem;
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

		.action-buttons {
			flex-direction: column;
			gap: 1rem;
		}

		.class-selector select {
			flex-direction: column;
			gap: 1rem;
		}

		.student-list {
			grid-template-columns: 1fr;
		}
	}
</style>
