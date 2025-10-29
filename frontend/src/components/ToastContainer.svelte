<script lang="ts">
  import { toastStore } from '$lib/stores/toast';

  function getColorClasses(type: string) {
    switch (type) {
      case 'success':
        return 'bg-green-600 text-white';
      case 'error':
        return 'bg-red-600 text-white';
      case 'warning':
        return 'bg-orange-600 text-white';
      case 'info':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ⓘ';
      default:
        return '•';
    }
  }
</script>

<!-- Toast container - fixed position at bottom right -->
<div class="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm pointer-events-none">
  {#each $toastStore as toast (toast.id)}
    <div
      class="px-4 py-3 rounded shadow-lg max-w-sm animate-slide-up pointer-events-auto {getColorClasses(
        toast.type
      )}"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div class="flex items-center gap-3">
        <span class="text-lg font-semibold" aria-hidden="true">{getIcon(toast.type)}</span>
        <span class="flex-1">{toast.message}</span>
        <button
          on:click={() => toastStore.remove(toast.id)}
          class="text-sm font-semibold hover:opacity-80 transition-opacity"
          aria-label="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  {/each}
</div>

<style>
  @keyframes slideUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .animate-slide-up {
    animation: slideUp 0.3s ease-out forwards;
  }
</style>
