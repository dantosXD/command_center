<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    open?: boolean;
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { open = $bindable(false), class: className, children, ...restProps }: Props = $props();
</script>

{#if open}
  <div
    class={cn(
      'absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-fade-in',
      className
    )}
    {...restProps}
  >
    {@render children?.()}
  </div>
{/if}
