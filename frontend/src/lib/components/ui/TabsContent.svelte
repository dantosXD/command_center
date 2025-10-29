<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { getContext } from 'svelte';

  interface Props {
    value: string;
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { value, class: className, children, ...restProps }: Props = $props();

  const tabs = getContext<{ value: string }>('tabs');

  let isActive = $derived(tabs.value === value);
</script>

{#if isActive}
  <div
    class={cn(
      'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className
    )}
    role="tabpanel"
    {...restProps}
  >
    {@render children?.()}
  </div>
{/if}
