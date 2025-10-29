<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { class: className, children, ...restProps }: Props = $props();
</script>

<div class={cn('px-6 pb-6', className)} {...restProps}>
  {@render children?.()}
</div>
