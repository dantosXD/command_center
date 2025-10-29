<script lang="ts">
  import { authStore, isAuthenticated } from '$lib/stores/auth';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  let showUserMenu = false;
  let loading = true;

  // Initialize auth and redirect if not authenticated
  onMount(() => {
    authStore.initialize();

    const unsubscribe = isAuthenticated.subscribe(($isAuth) => {
      if (!$isAuth && !loading) {
        goto('/login');
      }
      loading = false;
    });

    return unsubscribe;
  });

  async function handleLogout() {
    await authStore.signOut();
    goto('/login');
  }

  function toggleUserMenu() {
    showUserMenu = !showUserMenu;
  }

  // Get user email for display
  $: userEmail = $authStore.user?.email || 'User';
  $: currentPath = $page.url.pathname;
</script>

{#if loading}
  <!-- Loading state -->
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <div class="text-center">
      <svg
        class="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <p class="text-gray-600 dark:text-gray-400">Loading Command Center...</p>
    </div>
  </div>
{:else if $isAuthenticated}
  <!-- Authenticated layout with navigation -->
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Top Navigation -->
    <nav class="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Left: Logo and main nav -->
          <div class="flex">
            <!-- Logo -->
            <div class="flex-shrink-0 flex items-center">
              <a href="/hub" class="text-xl font-bold text-gray-900 dark:text-white">
                Command Center
              </a>
            </div>

            <!-- Main navigation -->
            <div class="hidden sm:ml-8 sm:flex sm:space-x-8">
              <a
                href="/hub"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors {currentPath ===
                '/hub'
                  ? 'border-blue-500 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'}"
              >
                Hub
              </a>
              <a
                href="/tasks"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors {currentPath.startsWith(
                  '/tasks'
                )
                  ? 'border-blue-500 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'}"
              >
                Tasks
              </a>
              <a
                href="/calendar"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors {currentPath.startsWith(
                  '/calendar'
                )
                  ? 'border-blue-500 text-gray-900 dark:text-white'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'}"
              >
                Calendar
              </a>
            </div>
          </div>

          <!-- Right: User menu -->
          <div class="flex items-center">
            <div class="relative">
              <button
                type="button"
                on:click={toggleUserMenu}
                class="flex items-center space-x-3 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div
                  class="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium"
                >
                  {userEmail.charAt(0).toUpperCase()}
                </div>
                <span class="hidden md:block text-gray-700 dark:text-gray-300">{userEmail}</span>
                <svg
                  class="h-5 w-5 text-gray-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd"
                  />
                </svg>
              </button>

              <!-- User dropdown menu -->
              {#if showUserMenu}
                <div
                  class="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-100 dark:divide-gray-700 z-50"
                >
                  <div class="py-1">
                    <a
                      href="/settings"
                      class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Settings
                    </a>
                    <a
                      href="/profile"
                      class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Your Profile
                    </a>
                  </div>
                  <div class="py-1">
                    <button
                      type="button"
                      on:click={handleLogout}
                      class="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              {/if}
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile menu (optional - can be expanded) -->
      <div class="sm:hidden border-t border-gray-200 dark:border-gray-700">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <a
            href="/hub"
            class="block px-3 py-2 rounded-md text-base font-medium {currentPath === '/hub'
              ? 'bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}"
          >
            Hub
          </a>
          <a
            href="/tasks"
            class="block px-3 py-2 rounded-md text-base font-medium {currentPath.startsWith('/tasks')
              ? 'bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}"
          >
            Tasks
          </a>
          <a
            href="/calendar"
            class="block px-3 py-2 rounded-md text-base font-medium {currentPath.startsWith('/calendar')
              ? 'bg-blue-50 dark:bg-gray-700 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}"
          >
            Calendar
          </a>
        </div>
      </div>
    </nav>

    <!-- Main content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <slot />
    </main>
  </div>
{:else}
  <!-- Not authenticated - redirect handled in onMount -->
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
    <p class="text-gray-600 dark:text-gray-400">Redirecting to login...</p>
  </div>
{/if}

<!-- Click outside to close user menu -->
{#if showUserMenu}
  <button
    class="fixed inset-0 z-40"
    on:click={() => (showUserMenu = false)}
    aria-label="Close menu"
  ></button>
{/if}
