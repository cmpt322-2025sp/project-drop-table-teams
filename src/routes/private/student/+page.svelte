<script>
	import { redirect } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// Redirect to dashboard
		window.location.href = '/private/student/dashboard';
	});
</script>

<div>Redirecting to dashboard...</div>
