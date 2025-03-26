<script lang="ts">
	export let key: string | number;
	import { getContext } from 'svelte';
	import type { Writable } from 'svelte/store';
	const store: Writable<string | number> = getContext('activeTab');
</script>

<div class:active={key === $store} class="tab" on:click={() => ($store = key)}>
	<slot />
</div>

<style>
	.tab {
		display: inline-block;
		padding: 1em;
		border: solid black 2px;
		border-bottom: none;
	}

    .tab.active {
        background-color: black;
        color: white;
    }
</style>
