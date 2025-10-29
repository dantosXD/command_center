<script lang="ts">
  /**
   * Button Component
   * Reusable button with multiple variants and states
   * Supports primary, secondary, danger, and ghost variants
   *
   * Part of Phase 2 Sprint 3c: Component system
   */

  type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
  type Size = 'sm' | 'md' | 'lg';

  interface $$Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    disabled?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
  }

  export let variant: Variant = 'primary';
  export let size: Size = 'md';
  export let disabled = false;
  export let loading = false;
  export let fullWidth = false;

  const variantClasses: Record<Variant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    ghost: 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
  };

  const sizeClasses: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const disabledClass = 'disabled:opacity-50 disabled:cursor-not-allowed';
  const transitionClass = 'transition-colors duration-150';
  const widthClass = fullWidth ? 'w-full' : '';
  const focusClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500';
</script>

<button
  class="inline-flex items-center justify-center gap-2 rounded-md font-medium {variantClasses[
    variant
  ]} {sizeClasses[size]} {disabledClass} {transitionClass} {widthClass} {focusClass}"
  {disabled}
  {...$$props}
>
  {#if loading}
    <span class="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" aria-hidden="true" />
  {/if}
  <slot />
</button>

<style>
  button {
    /* Additional styling handled by Tailwind classes */
  }
</style>
