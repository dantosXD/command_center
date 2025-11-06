<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import { logger } from '$lib/utils/logger';

  export let fallback: boolean = true;

  let error: Error | null = null;
  let errorInfo: any = null;

  function handleError(event: ErrorEvent) {
    error = event.error;
    errorInfo = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    };

    logger.error('Uncaught error in application', event.error, errorInfo);

    if (fallback) {
      event.preventDefault(); // Prevent default browser error handling
    }
  }

  function handleUnhandledRejection(event: PromiseRejectionEvent) {
    error = new Error(event.reason);
    errorInfo = { reason: event.reason };

    logger.error('Unhandled promise rejection', event.reason, errorInfo);

    if (fallback) {
      event.preventDefault();
    }
  }

  function reset() {
    error = null;
    errorInfo = null;
  }

  onMount(() => {
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
  });

  onDestroy(() => {
    window.removeEventListener('error', handleError);
    window.removeEventListener('unhandledrejection', handleUnhandledRejection);
  });
</script>

{#if error && fallback}
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 border border-red-200">
      <div class="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>

      <h2 class="text-2xl font-bold text-gray-900 text-center mb-2">Something went wrong</h2>
      <p class="text-gray-600 text-center mb-6">
        We're sorry, but something unexpected happened. Please try refreshing the page.
      </p>

      {#if import.meta.env.DEV}
        <details class="mb-4">
          <summary class="cursor-pointer text-sm text-gray-700 font-medium mb-2">Error Details (Development Only)</summary>
          <div class="bg-gray-100 rounded p-3 text-xs font-mono text-red-800 overflow-auto max-h-40">
            <p class="font-semibold">Error:</p>
            <p class="mb-2">{error.message}</p>
            {#if error.stack}
              <p class="font-semibold">Stack:</p>
              <pre class="whitespace-pre-wrap">{error.stack}</pre>
            {/if}
          </div>
        </details>
      {/if}

      <div class="flex gap-3">
        <button
          type="button"
          class="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          on:click={() => window.location.reload()}
        >
          Refresh Page
        </button>
        <button
          type="button"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          on:click={reset}
        >
          Try Again
        </button>
      </div>

      <p class="text-xs text-gray-500 text-center mt-4">
        If this problem persists, please contact support.
      </p>
    </div>
  </div>
{:else}
  <slot />
{/if}
