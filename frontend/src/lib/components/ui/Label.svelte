<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    for?: string;
    class?: string;
    required?: boolean;
    children?: import('svelte').Snippet;
  }

  let {
    for: htmlFor,
    class: className,
    required = false,
    children,
    ...restProps
  }: Props = $props();
</script>

<label
  for={htmlFor}
  class={cn(
    'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
    className
  )}
  {...restProps}
>
  {@render children?.()}
  {#if required}
    <span class="text-destructive ml-1">*</span>
  {/if}
</label>
