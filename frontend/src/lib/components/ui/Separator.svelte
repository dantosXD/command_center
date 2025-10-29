<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    orientation?: 'horizontal' | 'vertical';
    decorative?: boolean;
    class?: string;
  }

  let {
    orientation = 'horizontal',
    decorative = true,
    class: className,
    ...restProps
  }: Props = $props();
</script>

<div
  role={decorative ? 'none' : 'separator'}
  aria-orientation={orientation}
  class={cn(
    'shrink-0 bg-border',
    orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]',
    className
  )}
  {...restProps}
></div>
