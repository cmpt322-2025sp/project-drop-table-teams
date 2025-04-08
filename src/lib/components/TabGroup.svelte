<script lang="ts">
	export let active: number | string;
	import { writable } from 'svelte/store';
	import { setContext } from 'svelte';
	const store = writable(active);
	setContext('activeTab', store);
</script>

<div class="tabs">
	<slot name="tabs" />
</div>

<div class="tab-content">
	<slot />
</div>

<style>
	.tabs {
		border-bottom: solid #103e5d 2px;
	}

	.tab-content {
		padding: 1em;
	}
</style>
