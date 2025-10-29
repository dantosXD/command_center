<script lang="ts">
	import Header from '$lib/components/Header.svelte';

	let { children } = $props();
</script>

<Header />
<main>
	{@render children?.()}
</main>

<style>
	:global(main) {
		min-height: calc(100vh - 73px);
	}
</style>
