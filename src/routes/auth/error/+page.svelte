<script>
	import { Button } from '$lib/components';
</script>

<div class="error-container">
	<div class="error-card">
		<div class="error-icon">
			<svg
				width="64"
				height="64"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
			>
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="12"></line>
				<line x1="12" y1="16" x2="12.01" y2="16"></line>
			</svg>
		</div>

		<h1 class="error-title">Authentication Error</h1>

		<p class="error-message">
			We couldn't log you in. This might be due to incorrect credentials or a temporary issue with
			our service.
		</p>

		<div class="error-actions">
			<a href="/auth">
				<Button variant="primary" size="md" rounded={true}>Back to Login</Button>
			</a>
		</div>
	</div>
</div>

<style>
	.error-container {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		width: 100%;
		background-color: var(--background-green);
		padding: 1rem;
		background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
	}

	.error-card {
		background-color: white;
		border-radius: 16px;
		padding: 2.5rem 2rem;
		width: 100%;
		max-width: 450px;
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
		text-align: center;
		animation: slideUp 0.5s ease-out;
	}

	.error-icon {
		width: 80px;
		height: 80px;
		margin: 0 auto 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #ff6b6b;
		background-color: rgba(255, 107, 107, 0.1);
		border-radius: 50%;
		padding: 1rem;
	}

	.error-title {
		font-size: 1.8rem;
		margin-bottom: 1rem;
		color: #333;
	}

	.error-message {
		color: #666;
		margin-bottom: 2rem;
		line-height: 1.6;
	}

	.error-actions {
		display: flex;
		justify-content: center;
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

	@media (max-width: 500px) {
		.error-card {
			padding: 1.5rem 1rem;
		}

		.error-title {
			font-size: 1.5rem;
		}

		.error-icon {
			width: 60px;
			height: 60px;
		}
	}
</style>
