<script lang="ts">
  /**
   * AppShell Component
   * Main layout wrapper for authenticated application
   * Provides sidebar navigation, header, and main content area
   *
   * Follows WCAG 2.2 AA accessibility standards with:
   * - Semantic HTML structure
   * - Proper ARIA labels and roles
   * - Keyboard navigation support
   * - Focus management
   * - Skip to main content link
   */

  import { page } from '$app/stores';
  import NavLink from './NavLink.svelte';
  import UserMenu from './UserMenu.svelte';

  let sidebarOpen = false;

  /**
   * Handle Escape key to close mobile sidebar
   */
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape' && sidebarOpen) {
      sidebarOpen = false;
    }
  }

  /**
   * Close sidebar when clicking a link
   */
  function closeSidebar() {
    sidebarOpen = false;
  }

  /**
   * Toggle sidebar visibility
   */
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="flex h-screen bg-gray-100">
  <!-- Skip to main content link for accessibility -->
  <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-2 focus:bg-blue-600 focus:text-white focus:rounded">
    Skip to main content
  </a>

  <!-- Sidebar Navigation -->
  <nav
    class="fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transition-transform duration-200 ease-in-out transform {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0"
    aria-label="Main navigation"
  >
    <!-- Sidebar Header -->
    <div class="flex items-center justify-between p-6 border-b border-gray-700">
      <h1 class="text-xl font-bold">Command Center</h1>
      <button
        on:click={toggleSidebar}
        class="md:hidden p-1 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Close navigation menu"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Navigation Links -->
    <ul class="px-3 py-4 space-y-2" role="list">
      <li>
        <NavLink
          href="/"
          icon="home"
          on:click={closeSidebar}
        >
          Home
        </NavLink>
      </li>
      <li>
        <NavLink
          href="/hub"
          icon="grid"
          on:click={closeSidebar}
        >
          Hub
        </NavLink>
      </li>
      <li>
        <NavLink
          href="/tasks"
          icon="check"
          on:click={closeSidebar}
        >
          Tasks
        </NavLink>
      </li>
      <li>
        <NavLink
          href="/calendar"
          icon="calendar"
          on:click={closeSidebar}
        >
          Calendar
        </NavLink>
      </li>
    </ul>

    <!-- Sidebar Footer -->
    <div class="absolute bottom-0 left-0 right-0 p-3 border-t border-gray-700">
      <NavLink
        href="/settings"
        icon="settings"
        on:click={closeSidebar}
      >
        Settings
      </NavLink>
    </div>
  </nav>

  <!-- Sidebar Overlay for Mobile -->
  {#if sidebarOpen}
    <div
      class="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
      on:click={closeSidebar}
      on:keydown={handleKeyDown}
      role="presentation"
      aria-hidden="true"
    />
  {/if}

  <!-- Main Content Area -->
  <div class="flex-1 flex flex-col overflow-hidden">
    <!-- Header -->
    <header class="bg-white border-b border-gray-200 h-16 flex items-center px-4 md:px-6 shadow-sm">
      <!-- Mobile Menu Toggle -->
      <button
        on:click={toggleSidebar}
        class="md:hidden p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Open navigation menu"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- Spacer -->
      <div class="flex-1" />

      <!-- Header Actions -->
      <div class="flex items-center gap-4">
        <!-- Search (placeholder) -->
        <button
          class="p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Search"
          title="Search (Cmd+K)"
        >
          <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <!-- User Menu -->
        <UserMenu />
      </div>
    </header>

    <!-- Main Content -->
    <main id="main-content" class="flex-1 overflow-auto">
      <slot />
    </main>
  </div>
</div>

<style>
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  :global(.focus\:not-sr-only:focus) {
    position: static;
    width: auto;
    height: auto;
    padding: inherit;
    margin: inherit;
    overflow: visible;
    clip: auto;
    white-space: normal;
  }
</style>
