<script lang="ts">
	import { Button, Modal } from '$lib/components';
	import { onMount } from 'svelte';

	interface Student {
		id: string;
		email: string;
		level: number;
		points: number;
		role: string;
		created_at: string;
	}

	interface Class {
		id: string;
		name: string;
		description?: string;
		students: Student[];
	}

	interface Enrollment {
		id: string;
		class_id: string;
		student_id: string;
	}

	let { data } = $props();
	let { classes: initialClasses, students, enrollments } = $derived(
		data as {
			classes: Class[];
			students: Student[];
			enrollments: Enrollment[];
		}
	);
	
	// Create a local, mutable copy of classes
	let classes = $state<Class[]>([]);

	let selectedClass = $state<Class | null>(null);
	let filteredStudents = $state<Student[]>([]);
	let availableStudents = $state<Student[]>([]);
	let editingStudentLevel = $state<Student | null>(null);
	let editingStudentClass = $state<Student | null>(null);
	let editLevel = $state<number>(1);
	let isUpdating = $state<boolean>(false);
	let initialized = $state<boolean>(false);

// Create class modal state
let showCreateClassModal = $state<boolean>(false);
let newClassName = $state<string>('');
let newClassDescription = $state<string>('');
let isCreatingClass = $state<boolean>(false);

// Delete class state
let showDeleteConfirmation = $state<boolean>(false);
let isDeleting = $state<boolean>(false);
let deleteError = $state<string | null>(null);

	// Initialize data on mount instead of using $effect to avoid recursion
	onMount(() => {
		initializeData();
	});

	// Initialize data without reactive effects
	function initializeData() {
		if (!initialized && initialClasses && students && enrollments) {
			// Create a deep copy of the classes
			classes = JSON.parse(JSON.stringify(initialClasses));
			
			// Process data for each class
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

	// Start editing a student's level
	function startEditingLevel(student: Student) {
		editingStudentLevel = student;
		editLevel = student.level;
	}

	// Start editing a student's enrollment
	function startEditingClass(student: Student) {
		editingStudentClass = student;
	}

	// Cancel editing
	function cancelEditingLevel() {
		editingStudentLevel = null;
	}

	function cancelEditingClass() {
		editingStudentClass = null;
	}

	// Save student level
	async function saveStudentLevel() {
		if (!editingStudentLevel || isUpdating) return;

		try {
			// Prevent multiple submissions
			isUpdating = true;

			const response = await fetch('/api/teacher/update-student-level', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					studentId: editingStudentLevel.id,
					level: editLevel
				})
			});

			if (response.ok) {
				// Update the student in the UI
				const updatedStudent = await response.json();

				// Update just the specific student in our filtered list
				const updatedFilteredStudents = filteredStudents.map((student) =>
					student.id === editingStudentLevel?.id
						? { ...student, level: updatedStudent.level }
						: student
				);
				filteredStudents = updatedFilteredStudents;

				// Reset editing state
				editingStudentLevel = null;
			} else {
				const error = await response.json();
				console.error('Failed to update student level:', error);
			}
		} catch (error) {
			console.error('Error updating student level:', error);
		} finally {
			isUpdating = false;
		}
	}

	// Save student class enrollment (remove a student)
	async function saveStudentClass() {
		if (!editingStudentClass || !selectedClass || isUpdating) return;

		try {
			// Prevent multiple submissions
			isUpdating = true;

			const response = await fetch('/api/teacher/update-student-enrollment', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					studentId: editingStudentClass.id,
					classId: selectedClass.id,
					action: 'remove'
				})
			});

			if (response.ok) {
				// Update the UI - remove student from filtered list, add to available
				filteredStudents = filteredStudents.filter(
					(student) => student.id !== editingStudentClass?.id
				);
				if (editingStudentClass) {
					availableStudents = [...availableStudents, editingStudentClass];
				}

				// Reset editing state
				editingStudentClass = null;
			} else {
				const error = await response.json();
				console.error('Failed to remove student from class:', error);
			}
		} catch (error) {
			console.error('Error removing student from class:', error);
		} finally {
			isUpdating = false;
		}
	}

	// Add a student to the class
	async function addStudentToClass(student: Student) {
		if (!selectedClass || isUpdating) return;

		try {
			// Prevent multiple submissions
			isUpdating = true;

			const response = await fetch('/api/teacher/update-student-enrollment', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					studentId: student.id,
					classId: selectedClass.id,
					action: 'add'
				})
			});

			if (response.ok) {
				// Update the UI - add student to filtered list, remove from available
				filteredStudents = [...filteredStudents, student];
				availableStudents = availableStudents.filter((s) => s.id !== student.id);
			} else {
				const error = await response.json();
				console.error('Failed to add student to class:', error);
			}
		} catch (error) {
			console.error('Error adding student to class:', error);
		} finally {
			isUpdating = false;
		}
	}

	// Handle class selection event
	function onClassSelectChange(event: Event) {
		const select = event.target as HTMLSelectElement;
		const newClass = classes.find((c) => c.id === select.value) || classes[0];
		handleClassChange(newClass);
	}
	
	// Open create class modal
	function openCreateClassModal() {
		showCreateClassModal = true;
		newClassName = '';
		newClassDescription = '';
	}
	
	// Close create class modal
	function closeCreateClassModal() {
		showCreateClassModal = false;
	}
	
	// Create a new class
	async function createClass() {
		if (!newClassName.trim() || isCreatingClass) return;
		
		try {
			isCreatingClass = true;
			
			const response = await fetch('/api/teacher/create-class', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: newClassName.trim(),
					description: newClassDescription.trim() || null
				})
			});
			
			if (response.ok) {
				const newClass = await response.json();
				
				// Add the new class to the classes array
				newClass.students = [];
				classes = [...classes, newClass];
				
				// Select the new class
				handleClassChange(newClass);
				
				// Close the modal
				closeCreateClassModal();
			} else {
				const error = await response.json();
				console.error('Failed to create class:', error);
			}
		} catch (error) {
			console.error('Error creating class:', error);
		} finally {
			isCreatingClass = false;
		}
	}
	
	// Show delete confirmation modal
	function showDeleteClassConfirmation() {
		// Reset any previous error
		deleteError = null;
		showDeleteConfirmation = true;
	}
	
	// Hide delete confirmation modal
	function hideDeleteClassConfirmation() {
		showDeleteConfirmation = false;
	}
	
	// Delete the currently selected class
	async function deleteClass() {
		if (!selectedClass || isDeleting) return;
		
		try {
			isDeleting = true;
			deleteError = null;
			
			const response = await fetch('/api/teacher/delete-class', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					classId: selectedClass.id
				})
			});
			
			if (response.ok) {
				// Remove the class from the list
				if (selectedClass) {
					const classId = selectedClass.id;
					classes = classes.filter(c => c.id !== classId);
				}
				
				// Hide the confirmation modal
				hideDeleteClassConfirmation();
				
				// Select another class if available
				if (classes.length > 0) {
					handleClassChange(classes[0]);
				} else {
					selectedClass = null;
					filteredStudents = [];
					availableStudents = [...students];
				}
			} else {
				const errorData = await response.json();
				deleteError = errorData.message || 'Failed to delete class. Make sure it has no students.';
				console.error('Failed to delete class:', errorData);
			}
		} catch (error) {
			console.error('Error deleting class:', error);
			deleteError = 'An unexpected error occurred.';
		} finally {
			isDeleting = false;
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
		<div class="class-info">
			<div class="class-header">
				<h2>{selectedClass.name}</h2>
				{#if filteredStudents.length === 0}
					<Button 
						variant="secondary" 
						size="sm" 
						rounded={true} 
						onClick={showDeleteClassConfirmation}
					>
						Delete Class
					</Button>
				{/if}
			</div>
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
							<td>
								{#if editingStudentLevel && editingStudentLevel.id === student.id}
									<div class="level-editor">
										<input
											type="number"
											min="1"
											max="3"
											bind:value={editLevel}
											class="level-input"
										/>
										<div class="edit-buttons">
											<Button
												variant="primary"
												size="sm"
												rounded={true}
												onClick={saveStudentLevel}
												disabled={isUpdating}
											>
												{isUpdating ? 'Saving...' : 'Save'}
											</Button>
											<Button
												variant="secondary"
												size="sm"
												rounded={true}
												onClick={cancelEditingLevel}
												disabled={isUpdating}
											>
												Cancel
											</Button>
										</div>
									</div>
								{:else}
									<div class="level-display">
										{student.level}
										<Button
											variant="primary"
											size="sm"
											rounded={true}
											onClick={() => startEditingLevel(student)}
										>
											Edit
										</Button>
									</div>
								{/if}
							</td>
							<td>{student.points}</td>
							<td>
								{#if editingStudentClass && editingStudentClass.id === student.id}
									<div class="edit-buttons">
										<Button
											variant="primary"
											size="sm"
											rounded={true}
											onClick={saveStudentClass}
											disabled={isUpdating}
										>
											{isUpdating ? 'Saving...' : 'Confirm'}
										</Button>
										<Button
											variant="secondary"
											size="sm"
											rounded={true}
											onClick={cancelEditingClass}
											disabled={isUpdating}
										>
											Cancel
										</Button>
									</div>
								{:else}
									<Button
										variant="secondary"
										size="sm"
										rounded={true}
										onClick={() => startEditingClass(student)}
									>
										Remove
									</Button>
								{/if}
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
							<Button
								variant="primary"
								size="sm"
								rounded={true}
								onClick={() => addStudentToClass(student)}
								disabled={isUpdating}
							>
								{isUpdating ? 'Adding...' : 'Add'}
							</Button>
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
			<Button variant="primary" size="md" rounded={true} onClick={openCreateClassModal}>Create New Class</Button>
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

	.class-info {
		margin-bottom: 1.5rem;
	}
	
	.class-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.no-students,
	.no-classes {
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

	.level-display {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.level-editor {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.level-input {
		width: 60px;
		padding: 4px;
		border: 1px solid #ddd;
		border-radius: 4px;
	}

	.edit-buttons {
		display: flex;
		gap: 0.5rem;
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

		.class-selector select.custom-select {
			width: 100%;
		}

		.student-list {
			grid-template-columns: 1fr;
		}
	}

	/* Modal styles */
	.modal-header {
		margin-bottom: 1.5rem;
	}

	.modal-header h2 {
		font-size: 1.5rem;
		color: var(--text-color);
		margin: 0;
	}

	.modal-body {
		margin-bottom: 1.5rem;
	}

	.form-group {
		margin-bottom: 1rem;
	}

	.form-group label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		font-size: 1rem;
	}

	.form-control {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid #ddd;
		border-radius: 8px;
		font-size: 1rem;
	}

	.form-control:focus {
		outline: none;
		border-color: var(--button-orange);
		box-shadow: 0 0 0 2px rgba(255, 153, 0, 0.2);
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: 1rem;
	}

	.required {
		color: #e74c3c;
	}

	.optional {
		color: #7f8c8d;
		font-size: 0.9rem;
	}
	
	.warning {
		color: #e67e22;
		font-weight: 600;
		margin-top: 0.5rem;
	}
	
	.error-message {
		background-color: #ffecee;
		border-left: 4px solid #e74c3c;
		color: #c0392b;
		padding: 0.75rem 1rem;
		margin-top: 1rem;
		border-radius: 4px;
	}
</style>

<!-- Create Class Modal -->
<Modal show={showCreateClassModal} onClose={closeCreateClassModal} titleId="create-class-title">
	<div class="modal-header">
		<h2 id="create-class-title">Create New Class</h2>
	</div>
	<div class="modal-body">
		<div class="form-group">
			<label for="class-name">Class Name <span class="required">*</span></label>
			<input
				type="text"
				id="class-name"
				bind:value={newClassName}
				placeholder="Enter class name"
				class="form-control"
				required
			/>
		</div>
		<div class="form-group">
			<label for="class-description">Description <span class="optional">(optional)</span></label>
			<textarea
				id="class-description"
				bind:value={newClassDescription}
				placeholder="Enter class description"
				class="form-control"
				rows="3"
			></textarea>
		</div>
	</div>
	<div class="modal-footer">
		<Button
			variant="secondary"
			size="md"
			rounded={true}
			onClick={closeCreateClassModal}
			disabled={isCreatingClass}
		>
			Cancel
		</Button>
		<Button
			variant="primary"
			size="md"
			rounded={true}
			onClick={createClass}
			disabled={!newClassName.trim() || isCreatingClass}
		>
			{isCreatingClass ? 'Creating...' : 'Create Class'}
		</Button>
	</div>
</Modal>

<!-- Delete Class Confirmation Modal -->
<Modal show={showDeleteConfirmation} onClose={hideDeleteClassConfirmation} titleId="delete-class-title">
	<div class="modal-header">
		<h2 id="delete-class-title">Delete Class</h2>
	</div>
	<div class="modal-body">
		{#if selectedClass}
			<p>Are you sure you want to delete the class <strong>{selectedClass.name}</strong>?</p>
			<p class="warning">This action cannot be undone.</p>
			{#if deleteError}
				<div class="error-message">
					{deleteError}
				</div>
			{/if}
		{/if}
	</div>
	<div class="modal-footer">
		<Button
			variant="secondary"
			size="md"
			rounded={true}
			onClick={hideDeleteClassConfirmation}
			disabled={isDeleting}
		>
			Cancel
		</Button>
		<Button
			variant="danger"
			size="md"
			rounded={true}
			onClick={deleteClass}
			disabled={isDeleting}
		>
			{isDeleting ? 'Deleting...' : 'Delete Class'}
		</Button>
	</div>
</Modal>
