<script lang="ts">
	import { Button } from '$lib/components';
	import { page } from '$app/stores';

	let userType = 'student'; // Default to student
	$: signupSuccessMessage = $page.form?.success && $page.form?.message;
</script>

<div class="login-container">
	<h1 class="login-title">Math Maze Login</h1>

	{#if signupSuccessMessage}
		<div class="message success">
			{$page.form.message}
		</div>
	{/if}

	<div class="user-type-selector">
		<button
			class={userType === 'student' ? 'selected' : ''}
			on:click={() => (userType = 'student')}
		>
			Student
		</button>
		<button
			class={userType === 'teacher' ? 'selected' : ''}
			on:click={() => (userType = 'teacher')}
		>
			Teacher
		</button>
	</div>

	<form method="POST" action="?/login" class="login-form">
		<input type="hidden" name="userType" value={userType} />

		<div class="form-group">
			<label for="email">Email</label>
			<input id="email" name="email" type="email" required />
		</div>

		<div class="form-group">
			<label for="password">Password</label>
			<input id="password" name="password" type="password" required />
		</div>

		<div class="form-actions">
			<Button type="submit" variant="primary" size="md">Login</Button>
			<Button type="submit" formaction="?/signup" variant="secondary" size="md">Sign Up</Button>
		</div>
	</form>
</div>

<style>
	.login-container {
		max-width: 400px;
		margin: 0 auto;
		padding: 2rem;
		border-radius: 8px;
		background-color: rgba(255, 255, 255, 0.1);
		backdrop-filter: blur(10px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.login-title {
		text-align: center;
		margin-bottom: 1.5rem;
		font-family: 'NovaFlat-Book', sans-serif;
		color: var(--text-color, #ffffff);
	}

	.message {
		padding: 1rem;
		border-radius: 4px;
		margin-bottom: 1rem;
		text-align: center;
	}

	.success {
		background-color: rgba(76, 175, 80, 0.2);
		color: #4caf50;
		border: 1px solid #4caf50;
	}

	.user-type-selector {
		display: flex;
		justify-content: center;
		margin-bottom: 1.5rem;
		gap: 1rem;
	}

	.user-type-selector button {
		padding: 0.5rem 1rem;
		border: none;
		border-radius: 4px;
		background-color: rgba(255, 255, 255, 0.1);
		color: var(--text-color, #ffffff);
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.user-type-selector button.selected {
		background-color: var(--primary-color, #5e35b1);
		color: white;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-size: 0.9rem;
		color: var(--text-color-muted, #a7a7a7);
	}

	.form-group input {
		padding: 0.75rem;
		border-radius: 4px;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background-color: rgba(255, 255, 255, 0.05);
		color: var(--text-color, #ffffff);
	}

	.form-actions {
		display: flex;
		justify-content: space-between;
		margin-top: 1rem;
	}
</style>
