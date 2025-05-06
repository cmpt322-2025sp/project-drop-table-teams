<script lang="ts">
	import { Button, Table } from '$lib/components';
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

	interface StudentSummary {
		id: string;
		email: string;
		level: number;
		totalSessions: number;
		avgWrongAddition: number;
		avgWrongSubtraction: number;
		avgWrongPlace: number;
		totalProblems: number;
		totalSolved: number;
		successRate: number;
		totalTimeSeconds: number;
		completionRate: number;
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
	let studentSummaries = $state<StudentSummary[]>([]);
	let sortField = $state<string>('email');
	let sortDirection = $state<'asc' | 'desc'>('asc');
	let view = $state<'table' | 'card'>('table');
	let classStats = $state<{
		totalSessions: number;
		avgSuccessRate: number;
		avgCompletionRate: number;
		avgTimePerSession: number;
	}>({
		totalSessions: 0,
		avgSuccessRate: 0,
		avgCompletionRate: 0,
		avgTimePerSession: 0
	});

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
						
						// Generate student summaries
						generateStudentSummaries();
					}
				}
			}
			
			initialized = true;
		}
	}

	// Generate summary statistics for each student
	function generateStudentSummaries() {
		if (!filteredStudents || !games) return;
		
		let summaries: StudentSummary[] = [];
		let totalSuccessRate = 0;
		let totalCompletionRate = 0;
		let totalTimeSeconds = 0;
		let totalSessionCount = 0;
		
		filteredStudents.forEach(student => {
			const studentGames = games.filter(game => game.student_id === student.id);
			
			if (studentGames.length > 0) {
				const totalSessions = studentGames.length;
				totalSessionCount += totalSessions;
				
				// Calculate averages
				const avgWrongAddition = studentGames.reduce((sum, game) => sum + game.wrong_addition, 0) / totalSessions;
				const avgWrongSubtraction = studentGames.reduce((sum, game) => sum + game.wrong_subtraction, 0) / totalSessions;
				const avgWrongPlace = studentGames.reduce((sum, game) => sum + game.wrong_place, 0) / totalSessions;
				
				// Calculate totals
				const totalProblems = studentGames.reduce((sum, game) => sum + game.problems_total, 0);
				const totalSolved = studentGames.reduce((sum, game) => sum + game.problems_solved, 0);
				const timeSpent = studentGames.reduce((sum, game) => sum + game.time_spent_seconds, 0);
				
				// Calculate rates
				const successRate = totalProblems > 0 ? (totalSolved / totalProblems) * 100 : 0;
				const completionRate = (studentGames.filter(game => game.completed).length / totalSessions) * 100;
				
				totalSuccessRate += successRate;
				totalCompletionRate += completionRate;
				totalTimeSeconds += timeSpent;
				
				summaries.push({
					id: student.id,
					email: student.email,
					level: student.level,
					totalSessions,
					avgWrongAddition,
					avgWrongSubtraction,
					avgWrongPlace,
					totalProblems,
					totalSolved,
					successRate,
					totalTimeSeconds: timeSpent,
					completionRate
				});
			} else {
				// No games for this student
				summaries.push({
					id: student.id,
					email: student.email,
					level: student.level,
					totalSessions: 0,
					avgWrongAddition: 0,
					avgWrongSubtraction: 0,
					avgWrongPlace: 0,
					totalProblems: 0,
					totalSolved: 0,
					successRate: 0,
					totalTimeSeconds: 0,
					completionRate: 0
				});
			}
		});
		
		// Update class-wide stats
		if (summaries.length > 0 && totalSessionCount > 0) {
			classStats = {
				totalSessions: totalSessionCount,
				avgSuccessRate: totalSuccessRate / summaries.length,
				avgCompletionRate: totalCompletionRate / summaries.length,
				avgTimePerSession: totalTimeSeconds / totalSessionCount
			};
		}
		
		// Sort summaries
		sortSummaries(sortField, sortDirection);
		
		studentSummaries = summaries;
	}

	// Handle class selection change
	function handleClassChange(newClass: Class) {
		selectedClass = newClass;
		
		if (selectedClass && selectedClass.students) {
			filteredStudents = [...selectedClass.students];
			
			// Calculate students not in this class
			const enrolledIds = new Set(filteredStudents.map((s) => s.id));
			availableStudents = students.filter((student) => !enrolledIds.has(student.id));
			
			// Regenerate summaries
			generateStudentSummaries();
		}
	}

	// Handle class selection event
	function onClassSelectChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const newClass = classes.find(c => c.id === select.value) || classes[0];
		handleClassChange(newClass);
	}
	
	// Format time from seconds to human-readable
	function formatTime(seconds: number): string {
		// Round to integer first
		seconds = Math.round(seconds);
		
		if (seconds < 60) return `${seconds}s`;
		
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = Math.round(seconds % 60);
		
		if (minutes < 60) {
			return `${minutes}m ${remainingSeconds}s`;
		}
		
		const hours = Math.floor(minutes / 60);
		const remainingMinutes = minutes % 60;
		
		return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
	}
	
	// Sort summaries
	function sortSummaries(field: string, direction: 'asc' | 'desc') {
		sortField = field;
		sortDirection = direction;
		
		studentSummaries.sort((a, b) => {
			let comparison = 0;
			
			// Handle numeric and string fields differently
			if (typeof a[field as keyof StudentSummary] === 'number') {
				comparison = (a[field as keyof StudentSummary] as number) - (b[field as keyof StudentSummary] as number);
			} else {
				comparison = String(a[field as keyof StudentSummary]).localeCompare(String(b[field as keyof StudentSummary]));
			}
			
			return direction === 'asc' ? comparison : -comparison;
		});
		
		// Force reactivity
		studentSummaries = [...studentSummaries];
	}
	
	// Set sort field and toggle direction if clicking on the current sort field
	function setSortField(field: string) {
		if (field === sortField) {
			sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
		} else {
			sortField = field;
			sortDirection = 'asc';
		}
		
		sortSummaries(sortField, sortDirection);
	}
	
	// Toggle view between table and card
	function toggleView() {
		view = view === 'table' ? 'card' : 'table';
	}
	
	function handleHeaderClick(field: string) {
		setSortField(field);
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

	<div class="controls">
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
		
		<div class="view-controls">
			<Button onclick={toggleView}>
				{view === 'table' ? 'Switch to Card View' : 'Switch to Table View'}
			</Button>
		</div>
	</div>

	{#if selectedClass}
		<!-- Class summary stats cards -->
		<div class="stats-cards">
			<div class="stat-card">
				<div class="stat-value">{classStats.totalSessions}</div>
				<div class="stat-label">Total Sessions</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">{classStats.avgSuccessRate.toFixed(1)}%</div>
				<div class="stat-label">Avg Success Rate</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">{classStats.avgCompletionRate.toFixed(1)}%</div>
				<div class="stat-label">Avg Completion Rate</div>
			</div>
			<div class="stat-card">
				<div class="stat-value">{formatTime(classStats.avgTimePerSession)}</div>
				<div class="stat-label">Avg Time per Session</div>
			</div>
		</div>
		
		<!-- Table view -->
		{#if view === 'table'}
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th scope="col" onclick={() => handleHeaderClick('email')} class:sorted={sortField === 'email'}>
								Email {sortField === 'email' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
							</th>
							<th scope="col" onclick={() => handleHeaderClick('level')} class:sorted={sortField === 'level'}>
								Level {sortField === 'level' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
							</th>
							<th scope="col" onclick={() => handleHeaderClick('totalSessions')} class:sorted={sortField === 'totalSessions'}>
								Sessions {sortField === 'totalSessions' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
							</th>
							<th scope="col" onclick={() => handleHeaderClick('successRate')} class:sorted={sortField === 'successRate'}>
								Success Rate {sortField === 'successRate' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
							</th>
							<th scope="col" onclick={() => handleHeaderClick('completionRate')} class:sorted={sortField === 'completionRate'}>
								Completion Rate {sortField === 'completionRate' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
							</th>
							<th scope="col" onclick={() => handleHeaderClick('totalTimeSeconds')} class:sorted={sortField === 'totalTimeSeconds'}>
								Total Time {sortField === 'totalTimeSeconds' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
							</th>
						</tr>
					</thead>
					<tbody>
						{#if studentSummaries && studentSummaries.length > 0}
							{#each studentSummaries as summary}
								<tr>
									<td>{summary.email}</td>
									<td>{summary.level}</td>
									<td>{summary.totalSessions}</td>
									<td>
										<div class="progress-bar-container">
											<div class="progress-bar" style="width: {summary.successRate}%"></div>
											<span>{summary.successRate.toFixed(1)}%</span>
										</div>
									</td>
									<td>
										<div class="progress-bar-container">
											<div class="progress-bar" style="width: {summary.completionRate}%"></div>
											<span>{summary.completionRate.toFixed(1)}%</span>
										</div>
									</td>
									<td>{formatTime(summary.totalTimeSeconds)}</td>
								</tr>
							{/each}
						{:else}
							<tr>
								<td colspan="6" class="missing-data">There are no students in this class. Add students to this class in the Student Management page.</td>
							</tr>
						{/if}
					</tbody>
				</table>
			</div>
		<!-- Card view -->
		{:else}
			<div class="student-cards">
				{#if studentSummaries && studentSummaries.length > 0}
					{#each studentSummaries as summary}
						<div class="student-card">
							<div class="student-header">
								<div class="student-avatar">
									<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none">
										<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
										<circle cx="12" cy="7" r="4" />
									</svg>
								</div>
								<div class="student-info">
									<h3>{summary.email}</h3>
									<div class="student-level">Level {summary.level}</div>
								</div>
							</div>
							
							<div class="card-stats">
								<div class="stat-row">
									<div class="stat-label">Sessions:</div>
									<div class="stat-value">{summary.totalSessions}</div>
								</div>
								<div class="stat-row">
									<div class="stat-label">Problems Solved:</div>
									<div class="stat-value">{summary.totalSolved} / {summary.totalProblems}</div>
								</div>
								<div class="stat-row">
									<div class="stat-label">Success Rate:</div>
									<div class="stat-value">
										<div class="progress-bar-container">
											<div class="progress-bar" style="width: {summary.successRate}%"></div>
											<span>{summary.successRate.toFixed(1)}%</span>
										</div>
									</div>
								</div>
								<div class="stat-row">
									<div class="stat-label">Time Played:</div>
									<div class="stat-value">{formatTime(summary.totalTimeSeconds)}</div>
								</div>
							</div>
							
							{#if summary.totalSessions > 0}
								<div class="error-stats">
									<h4>Wrong Answer Distribution</h4>
									<div class="error-bars">
										<div class="error-bar">
											<div class="error-value" style="height: {Math.min(100, summary.avgWrongAddition * 10)}%"></div>
											<span class="error-label">Addition</span>
											<span class="error-count">{summary.avgWrongAddition.toFixed(1)}</span>
										</div>
										<div class="error-bar">
											<div class="error-value" style="height: {Math.min(100, summary.avgWrongSubtraction * 10)}%"></div>
											<span class="error-label">Subtraction</span>
											<span class="error-count">{summary.avgWrongSubtraction.toFixed(1)}</span>
										</div>
										<div class="error-bar">
											<div class="error-value" style="height: {Math.min(100, summary.avgWrongPlace * 10)}%"></div>
											<span class="error-label">Placement</span>
											<span class="error-count">{summary.avgWrongPlace.toFixed(1)}</span>
										</div>
									</div>
								</div>
							{:else}
								<div class="no-data">No game data available</div>
							{/if}
						</div>
					{/each}
				{:else}
					<div class="missing-data">There are no students in this class. Add students to this class in the Student Management page.</div>
				{/if}
			</div>
		{/if}
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
		flex-direction: column-reverse;
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
		margin-bottom: 1.5rem;
		line-height: 1.5;
	}
	
	.controls {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.class-selector {
		font-size: 1.1rem;
		font-family: 'NovaFlat-Book', sans-serif;
		display: flex;
		height: 40px;
	}

	.class-selector label {
		font-size: 1.1rem;
		font-family: 'NovaFlat-Book', sans-serif;
		text-align: left;
		width: auto;
		margin-right: 10px;
		align-self: center;
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
		width: 200px;
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
	
	/* Stats cards */
	.stats-cards {
		display: flex;
		justify-content: space-between;
		gap: 20px;
		margin-bottom: 2rem;
	}
	
	.stat-card {
		background-color: white;
		border-radius: 10px;
		padding: 1.2rem;
		flex: 1;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		text-align: center;
		transition: transform 0.3s ease;
	}
	
	.stat-card:hover {
		transform: translateY(-5px);
	}
	
	.stat-card .stat-value {
		font-size: 2rem;
		font-weight: bold;
		color: var(--background-green);
		line-height: 1;
		margin-bottom: 0.5rem;
	}
	
	.stat-card .stat-label {
		font-size: 0.9rem;
		color: #666;
		font-weight: 500;
	}

	/* Table styles */
	.table-container {
		overflow-x: auto;
		margin-bottom: 2rem;
		background-color: white;
		border-radius: 10px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}
	
	table {
		width: 100%;
		border-collapse: collapse;
		margin-bottom: 0;
	}

	th,
	td {
		padding: 12px 15px;
		text-align: left;
		border-bottom: 1px solid #eee;
	}
	
	th {
		background-color: var(--background-green);
		color: white;
		cursor: pointer;
		position: relative;
		font-weight: 600;
		font-size: 0.9rem;
	}
	
	th.sorted {
		background-color: #1a7e63;
	}
	
	th:hover {
		background-color: #1a7e63;
	}
	
	tr:last-child td {
		border-bottom: none;
	}
	
	tr:hover {
		background-color: #f9f9f9;
	}
	
	/* Progress bars */
	.progress-bar-container {
		width: 100%;
		height: 20px;
		background-color: #f0f0f0;
		border-radius: 10px;
		overflow: hidden;
		position: relative;
	}
	
	.progress-bar {
		height: 100%;
		background-color: var(--background-green);
		border-radius: 10px;
	}
	
	.progress-bar-container span {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #333;
		font-size: 0.8rem;
		font-weight: 600;
		mix-blend-mode: difference;
	}
	
	/* Error distribution */
	.error-distribution {
		min-width: 120px;
	}
	
	.error-bars {
		display: flex;
		justify-content: space-around;
		align-items: flex-end;
		height: 50px;
		padding-top: 10px; /* Add space at top */
		padding-bottom: 5px; /* Add space at bottom */
	}
	
	.error-bar {
		display: flex;
		flex-direction: column-reverse;
		align-items: center;
		width: 30px;
	}
	
	.error-value {
		width: 100%;
		background-color: #ff6b6b;
		margin-bottom: 5px;
		border-radius: 3px 3px 0 0;
		min-height: 2px; /* Ensures bars are always visible even with small values */
	}
	
	.table-error-value {
		width: 8px; /* More prominent width */
	}
	
	.error-label {
		font-size: 0.7rem;
		text-align: center;
		color: #666;
		white-space: nowrap;
	}
	
	/* Card view */
	.student-cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 20px;
		margin-bottom: 2rem;
	}
	
	.student-card {
		background-color: white;
		border-radius: 10px;
		padding: 1.2rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		transition: transform 0.3s ease;
	}
	
	.student-card:hover {
		transform: translateY(-5px);
	}
	
	.student-header {
		display: flex;
		align-items: center;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid #eee;
	}
	
	.student-avatar {
		width: 40px;
		height: 40px;
		background-color: #eee;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 1rem;
		color: #666;
	}
	
	.student-info h3 {
		margin: 0;
		font-size: 1.1rem;
		margin-bottom: 0.3rem;
	}
	
	.student-level {
		font-size: 0.8rem;
		color: #666;
	}
	
	.card-stats {
		margin-bottom: 1rem;
	}
	
	.stat-row {
		display: flex;
		justify-content: space-between;
		margin-bottom: 0.5rem;
		font-size: 0.9rem;
	}
	
	.stat-label {
		color: #666;
	}
	
	.error-stats {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}
	
	.error-stats h4 {
		font-size: 0.9rem;
		margin: 0 0 2rem 0; /* Increased bottom margin for more space */
		text-align: center;
		color: #666;
	}
	
	.student-card .error-bars {
		height: 80px;
	}
	
	.student-card .error-bar {
		position: relative;
		height: 100%;
		display: flex;
		flex-direction: column-reverse;
	}
	
	.student-card .error-value {
		margin-bottom: 0;
		width: 20px;
	}
	
	.student-card .error-label {
		margin-top: 5px;
	}
	
	.student-card .error-count {
		font-size: 0.7rem;
		position: absolute;
		top: -30px; /* Increased space above the count */
		color: #333;
	}
	
	.no-data {
		text-align: center;
		color: #999;
		padding: 1rem;
		font-style: italic;
	}

	.missing-data {
		text-align: center;
		padding: 2rem;
		color: #666;
		background-color: white;
		border-radius: 10px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 768px) {
		.teacher-header {
			padding: 1rem;
			flex-direction: column-reverse;
			gap: 1rem;
		}

		.teacher-content {
			padding: 1.5rem;
		}
		
		.controls {
			flex-direction: column-reverse;
			align-items: flex-start;
			gap: 1rem;
		}
		
		.stats-cards {
			flex-direction: column-reverse;
		}
		
		.student-cards {
			grid-template-columns: 1fr;
		}
	}
</style>