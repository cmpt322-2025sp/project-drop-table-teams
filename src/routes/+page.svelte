<script lang="ts">
	import { Button } from '$lib/components';
</script>

<div class="welcome-container">
	<h2>Welcome to</h2>
	<h1>Math Maze</h1>
	<br />
	<br />
	<p style="font-size:125%">
		Teachers and students login here. This game is still under development!
	</p>
	<a href="/auth">
		<Button
			variant="primary"
			size="lg"
			style="width: 400px; height: 100px; font-size: 1.5rem; margin-top: 2rem;"
		>
			Login
		</Button>
	</a>
</div>

<style>
	h1 {
		text-align: center;
		font-size: 500%;
	}

	h2 {
		text-align: center;
	}

	.welcome-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 1rem;
	}
</style>
