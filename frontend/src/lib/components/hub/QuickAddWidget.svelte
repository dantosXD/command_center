<script lang="ts">
  import CommandPalette from '$lib/components/CommandPalette.svelte';
  import { hubStore } from '$lib/stores/hubStore';

  // Expose trigger to parent for the floating button
  function open() {
    hubStore.setQuickAddOpen(true);
  }

  // Forward the added event for UI feedback
  function onAdded(e: CustomEvent) {
    // Optional: show toast/log
    console.log('Added:', e.detail);
  }
</script>

<!-- Expose an open method for external triggers if needed -->
<svelte:component this={CommandPalette} on:added={onAdded} />

<!-- Slot for quick-add trigger button if used elsewhere -->
<slot name="trigger" open={open} />
