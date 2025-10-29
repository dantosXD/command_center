<script lang="ts">
  /**
   * App Layout
   * Wraps authenticated pages with AppShell navigation
   */

  import AppShell from '$lib/components/AppShell.svelte';

  let { children } = $props();
</script>

<AppShell>
  {@render children?.()}
</AppShell>
