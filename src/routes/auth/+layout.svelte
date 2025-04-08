<script>
	let { children } = $props();
</script>

<div class="auth-layout">
	{@render children()}
</div>

<style>
	.auth-layout {
		min-height: 100vh;
		width: 100%;
	}
</style>
