<script>
	import { Button } from '$lib/components';

	let isLogin = true;
	let email = '';
	let password = '';
</script>

<div class="auth-container">
	<div class="auth-card">
		<div class="logo">Math Maze</div>
		
		<h1 class="auth-title">{isLogin ? 'Welcome Back!' : 'Create Account'}</h1>
		
		<form method="POST" action={isLogin ? '?/login' : '?/signup'}>
			<div class="form-group">
				<label for="email">Email</label>
				<input 
					id="email"
					name="email" 
					type="email" 
					placeholder="Enter your email"
					required
					bind:value={email}
				/>
			</div>
			
			<div class="form-group">
				<label for="password">Password</label>
				<input 
					id="password"
					name="password" 
					type="password" 
					placeholder="Enter your password"
					required
					bind:value={password}
				/>
			</div>
			
			<div class="auth-actions">
				<Button 
					type="submit"
					variant="primary" 
					size="lg" 
					rounded={true}
					style="width: 100%; margin-bottom: 1rem;"
				>
					{isLogin ? 'Login' : 'Sign Up'}
				</Button>
				
				<button 
					type="button" 
					class="switch-mode" 
					on:click={() => isLogin = !isLogin}
				>
					{isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	.auth-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		width: 100%;
		background-color: var(--background-green);
		padding: 1rem;
		background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
	}

	.auth-card {
		background-color: white;
		border-radius: 16px;
		padding: 2.5rem 2rem;
		width: 100%;
		max-width: 450px;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
		animation: slideUp 0.5s ease-out;
	}

	.logo {
		color: var(--text-color);
		font-family: 'NovaFlat-Book', sans-serif;
		font-size: 3rem;
		line-height: 1.2;
		font-weight: 700;
		margin-bottom: 1.5rem;
		text-align: center;
		animation: fadeIn 1s ease;
		color: var(--button-orange);
	}

	.auth-title {
		font-size: 1.8rem;
		margin-bottom: 2rem;
		text-align: center;
		font-weight: 600;
		color: #333;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	label {
		display: block;
		margin-bottom: 0.5rem;
		font-weight: 600;
		color: #555;
		font-size: 0.9rem;
	}

	input {
		width: 100%;
		padding: 0.9rem 1rem;
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.3s;
		outline: none;
		font-family: inherit;
	}

	input:focus {
		border-color: var(--button-orange);
		box-shadow: 0 0 0 2px rgba(255, 157, 0, 0.2);
	}

	.auth-actions {
		margin-top: 2rem;
	}

	.switch-mode {
		background: none;
		border: none;
		color: var(--button-orange);
		font-size: 0.9rem;
		cursor: pointer;
		display: block;
		margin: 0 auto;
		padding: 0.5rem;
		transition: color 0.3s;
		text-decoration: underline;
	}

	.switch-mode:hover {
		color: #d68200;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@media (max-width: 500px) {
		.auth-card {
			padding: 1.5rem 1rem;
		}

		.logo {
			font-size: 2.5rem;
		}

		.auth-title {
			font-size: 1.5rem;
		}
	}
</style>