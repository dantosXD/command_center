<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    value?: number;
    max?: number;
    class?: string;
  }

  let { value = 0, max = 100, class: className, ...restProps }: Props = $props();

  let percentage = $derived((value / max) * 100);
</script>

<div
  class={cn('relative h-4 w-full overflow-hidden rounded-full bg-secondary', className)}
  role="progressbar"
  aria-valuenow={value}
  aria-valuemin={0}
  aria-valuemax={max}
  {...restProps}
>
  <div
    class="h-full w-full flex-1 bg-primary transition-all duration-300 ease-in-out"
    style="transform: translateX(-{100 - percentage}%)"
  ></div>
</div>
