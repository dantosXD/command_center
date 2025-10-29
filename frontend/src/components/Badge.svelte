<script lang="ts">
  /**
   * Badge Component
   * Display status, priority, and other categorical information
   * Supports status, priority, and tag variants with semantic colors
   *
   * Part of Phase 2 Sprint 3c: Component system
   */

  type BadgeType = 'status' | 'priority' | 'tag';
  type BadgeVariant =
    | 'success'
    | 'warning'
    | 'danger'
    | 'info'
    | 'default'
    | 'blue'
    | 'red'
    | 'green'
    | 'orange'
    | 'purple';

  interface $$Props {
    variant?: BadgeVariant;
    type?: BadgeType;
    icon?: string;
  }

  export let variant: BadgeVariant = 'default';
  export let type: BadgeType = 'tag';
  export let icon: string | undefined = undefined;

  const variantClasses: Record<BadgeVariant, string> = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-orange-100 text-orange-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-gray-100 text-gray-800',
    blue: 'bg-blue-100 text-blue-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
    orange: 'bg-orange-100 text-orange-800',
    purple: 'bg-purple-100 text-purple-800'
  };

  const typeClasses: Record<BadgeType, string> = {
    status: 'px-2.5 py-1 text-xs font-medium',
    priority: 'px-2.5 py-1 text-xs font-semibold',
    tag: 'px-2 py-1 text-xs font-medium'
  };

  const baseClasses = 'inline-flex items-center gap-1.5 rounded-full whitespace-nowrap';
</script>

<span class="{baseClasses} {variantClasses[variant]} {typeClasses[type]}">
  {#if icon}
    <span aria-hidden="true">{icon}</span>
  {/if}
  <slot />
</span>

<style>
  /* Styling handled by Tailwind */
</style>
