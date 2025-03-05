<script lang="ts">
	import { Button } from '$lib/components';
</script>

<div class="welcome-container">
	<h2>Welcome to</h2>
	<h1>Math Maze</h1>
	<br />
	<br />
	<p style="font-size:125%">
		This is soon to be the login page for this game. This game is still under development!
	</p>
	<a href="/dashboard">
		<Button
			variant="primary"
			size="lg"
			style="width: 400px; height: 100px; font-size: 1.5rem; margin-top: 2rem;"
		>
			Jump to the Dashboard
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
