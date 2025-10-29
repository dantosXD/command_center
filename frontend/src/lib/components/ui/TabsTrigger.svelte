<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { getContext } from 'svelte';

  interface Props {
    value: string;
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { value, class: className, children, ...restProps }: Props = $props();

  const tabs = getContext<{ value: string; setValue: (value: string) => void }>('tabs');

  let isActive = $derived(tabs.value === value);
</script>

<button
  type="button"
  class={cn(
    'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
    isActive
      ? 'bg-background text-foreground shadow-sm'
      : 'hover:bg-background/50 hover:text-foreground',
    className
  )}
  role="tab"
  aria-selected={isActive}
  onclick={() => tabs.setValue(value)}
  {...restProps}
>
  {@render children?.()}
</button>
