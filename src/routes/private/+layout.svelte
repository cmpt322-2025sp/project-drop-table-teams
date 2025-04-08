<script>
	import { Button } from '$lib/components';
	let { data, children } = $props();
	let { supabase } = $derived(data);
</script>

<header>
	<nav>
		<a href="/">Home</a>
	</nav>
	<form action="/auth/signout" method="POST">
		<Button type="submit" variant="secondary" size="sm" rounded={true}>Logout</Button>
	</form>
</header>
<main>
	{@render children()}
</main>

<style>
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 2rem;
		background-color: var(--background-green, #38b000);
		color: white;
	}
	
	nav a {
		color: white;
		text-decoration: none;
		font-weight: 600;
	}
	
	nav a:hover {
		text-decoration: underline;
	}
	
	main {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
</style>
