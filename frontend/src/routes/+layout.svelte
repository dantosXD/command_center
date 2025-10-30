<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../styles.css';
	import ToastContainer from '../components/ToastContainer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<title>Command Center - Unified Productivity Hub</title>
</svelte:head>

<ToastContainer />
{@render children?.()}
