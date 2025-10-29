<script lang="ts">
  /**
   * NavLink Component
   * Navigation link with active state detection
   * Accessible with ARIA current attribute
   */

  import { page } from '$app/stores';

  export let href: string;
  export let icon: 'home' | 'grid' | 'check' | 'calendar' | 'settings' = 'grid';

  $: isActive = $page.url.pathname === href || $page.url.pathname.startsWith(href + '/');

  const iconMap = {
    home: 'M3 12a9 9 0 1 1 18 0 9 9 0 0 1 -18 0',
    grid: 'M3 4a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1H4a1 1 0 0 1 -1 -1V4m8 0a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1V4M3 12a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1H4a1 1 0 0 1 -1 -1v-4m8 0a1 1 0 0 1 1 -1h4a1 1 0 0 1 1 1v4a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-4',
    check: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 0 0 -1.946 -1.28 3.58 3.58 0 0 0 -2.582 .256 3.478 3.478 0 0 0 -2.077 2.102 3.537 3.537 0 0 0 -.09 2.852 3.536 3.536 0 0 0 1.465 2.127A3.41 3.41 0 0 0 5 13h14a3.4 3.4 0 0 0 3 -3V7a3 3 0 0 0 -3 -3H6.52a3.39 3.39 0 0 0 -2.685 1.697',
    calendar: 'M8 7V3m8 4V3m4 6h-4m-11.993.001h16m2 0a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2H4a2 2 0 0 1 -2 -2V9a2 2 0 0 1 2 -2',
    settings: 'M12.75 15.75H9.25m3.5 0a6.75 6.75 0 1 0 -6.5 -6.743M12.75 15.75L12 12m.75 3.75 .75 -3.75M4.5 12a1.5 1.5 0 1 0 3 0 1.5 1.5 0 0 0 -3 0',
  };
</script>

<a
  {href}
  class="flex items-center gap-3 px-4 py-2 rounded-lg transition-colors {isActive
    ? 'bg-blue-600 text-white'
    : 'text-gray-300 hover:bg-gray-800 focus:bg-gray-800'} focus:outline-none focus:ring-2 focus:ring-blue-500"
  aria-current={isActive ? 'page' : undefined}
  on:click
>
  <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d={iconMap[icon]} />
  </svg>
  <span><slot /></span>
</a>
