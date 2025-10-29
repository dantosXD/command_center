<script lang="ts">
  /**
   * UserMenu Component
   * Dropdown menu for user actions (profile, settings, logout)
   * Accessible dropdown with keyboard navigation
   */

  let open = false;
  let menuButton: HTMLButtonElement;

  /**
   * Handle keyboard navigation in dropdown
   */
  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      open = false;
      menuButton?.focus();
    }
  }

  /**
   * Toggle dropdown
   */
  function toggleMenu() {
    open = !open;
  }

  /**
   * Close menu when clicking outside
   */
  function closeMenu() {
    open = false;
  }
</script>

<div class="relative">
  <button
    bind:this={menuButton}
    on:click={toggleMenu}
    on:keydown={handleKeyDown}
    class="p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
    aria-label="User menu"
    aria-haspopup="menu"
    aria-expanded={open}
  >
    <svg class="w-6 h-6 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12a3 3 0 100-6 3 3 0 000 6zm0 2c-5.33 0-8 2.67-8 4v2h16v-2c0-1.33-2.67-4-8-4z" />
    </svg>
  </button>

  {#if open}
    <div
      class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
      role="menu"
      on:keydown={handleKeyDown}
    >
      <button
        on:click={() => {
          closeMenu();
          // TODO: Navigate to profile
        }}
        class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
        role="menuitem"
      >
        Profile
      </button>
      <button
        on:click={() => {
          closeMenu();
          // TODO: Navigate to settings
        }}
        class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
        role="menuitem"
      >
        Settings
      </button>
      <hr class="my-1" />
      <button
        on:click={() => {
          closeMenu();
          // TODO: Implement logout
        }}
        class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 focus:outline-none focus:bg-red-50"
        role="menuitem"
      >
        Sign Out
      </button>
    </div>
  {/if}

  <!-- Backdrop to close menu -->
  {#if open}
    <div class="fixed inset-0" on:click={closeMenu} on:keydown={handleKeyDown} />
  {/if}
</div>
