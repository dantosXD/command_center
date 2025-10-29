<script lang="ts">
  /**
   * Header Component
   * Navigation header with logo, menu, and user profile
   * Sticky positioning for easy navigation
   *
   * Part of Phase 2 Sprint 3c: UI improvements - Navigation
   */

  import { page } from '$app/stores';

  /**
   * Check if current path matches nav link
   */
  function isActive(path: string): boolean {
    return $page.url.pathname.includes(path);
  }

  /**
   * Get page title from current path
   */
  function getPageTitle(): string {
    const path = $page.url.pathname;
    if (path.includes('/hub')) return 'Hub';
    if (path.includes('/tasks')) return 'Tasks';
    if (path.includes('/calendar')) return 'Calendar';
    return 'Command Center';
  }
</script>

<header class="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
  <div class="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
    <div class="flex items-center justify-between">
      <!-- Logo -->
      <a href="/" class="flex items-center gap-2 text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
        <span>📋</span>
        <span>Command Center</span>
      </a>

      <!-- Navigation -->
      <nav class="hidden md:flex items-center gap-8">
        <a
          href="/tasks"
          class="text-sm font-medium transition-colors"
          class:text-blue-600={isActive('/tasks')}
          class:text-gray-700={!isActive('/tasks')}
          class:border-b-2={isActive('/tasks')}
          class:border-blue-600={isActive('/tasks')}
          class:pb-1={isActive('/tasks')}
          aria-current={isActive('/tasks') ? 'page' : undefined}
        >
          Tasks
        </a>
        <a
          href="/calendar"
          class="text-sm font-medium transition-colors"
          class:text-blue-600={isActive('/calendar')}
          class:text-gray-700={!isActive('/calendar')}
          class:border-b-2={isActive('/calendar')}
          class:border-blue-600={isActive('/calendar')}
          class:pb-1={isActive('/calendar')}
          aria-current={isActive('/calendar') ? 'page' : undefined}
        >
          Calendar
        </a>
        <a
          href="/(app)/hub"
          class="text-sm font-medium transition-colors"
          class:text-blue-600={isActive('/hub')}
          class:text-gray-700={!isActive('/hub')}
          class:border-b-2={isActive('/hub')}
          class:border-blue-600={isActive('/hub')}
          class:pb-1={isActive('/hub')}
          aria-current={isActive('/hub') ? 'page' : undefined}
        >
          Hub
        </a>
      </nav>

      <!-- Mobile menu button -->
      <div class="md:hidden flex items-center gap-4">
        <span class="text-sm font-medium text-gray-700">{getPageTitle()}</span>
        <button
          class="p-2 rounded-md hover:bg-gray-100 text-gray-700"
          aria-label="Navigation menu"
          title="Coming soon: Mobile navigation"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <!-- User Profile (placeholder) -->
      <div class="hidden md:flex items-center gap-3">
        <div
          class="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold"
          title="User profile"
          aria-label="User profile"
        >
          U
        </div>
      </div>
    </div>
  </div>
</header>

<style>
  /* Smooth transitions for nav links */
  a {
    position: relative;
  }
</style>
