<script lang="ts">
  import { onMount } from 'svelte';
  import { getBuildInfo, checkForUpdates, formatVersion, getShortCommit } from '$lib/version';
  import type { BuildInfo } from '$lib/version';

  let buildInfo: BuildInfo | null = null;
  let loading = true;
  let hasUpdate = false;
  let latestVersion = '';
  let releaseUrl = '';
  let showUpdateNotice = false;

  onMount(async () => {
    try {
      buildInfo = await getBuildInfo();
      loading = false;

      // Check for updates
      const updateInfo = await checkForUpdates();
      if (updateInfo.hasUpdate) {
        hasUpdate = true;
        latestVersion = updateInfo.latestVersion || '';
        releaseUrl = updateInfo.releaseUrl || '';
        showUpdateNotice = true;
      }
    } catch (error) {
      console.error('Failed to load version info:', error);
      loading = false;
    }
  });

  function dismissUpdate() {
    showUpdateNotice = false;
  }
</script>

{#if showUpdateNotice && hasUpdate}
  <div
    class="fixed bottom-4 right-4 z-50 max-w-md bg-blue-50 border border-blue-200 rounded-lg shadow-lg p-4"
    role="alert"
  >
    <div class="flex items-start gap-3">
      <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clip-rule="evenodd"
        />
      </svg>
      <div class="flex-1">
        <h3 class="font-semibold text-blue-900">Update Available</h3>
        <p class="text-sm text-blue-700 mt-1">
          Version {formatVersion(latestVersion)} is now available. You're currently on
          {#if buildInfo}
            {formatVersion(buildInfo.version)}
          {:else}
            an older version
          {/if}.
        </p>
        <div class="flex gap-2 mt-3">
          <a
            href={releaseUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            View Release
          </a>
          <button
            type="button"
            class="px-3 py-1 text-sm text-blue-700 hover:text-blue-900"
            on:click={dismissUpdate}
          >
            Dismiss
          </button>
        </div>
      </div>
      <button
        type="button"
        class="text-blue-600 hover:text-blue-800"
        on:click={dismissUpdate}
        aria-label="Close update notice"
      >
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </div>
  </div>
{/if}

{#if !loading && buildInfo}
  <div class="text-xs text-gray-500">
    <span class="font-mono">{formatVersion(buildInfo.version)}</span>
    {#if import.meta.env.DEV}
      <span class="mx-1">·</span>
      <span class="font-mono">{getShortCommit(buildInfo.git.commit)}</span>
      <span class="mx-1">·</span>
      <span>{buildInfo.git.branch}</span>
    {/if}
  </div>
{/if}
