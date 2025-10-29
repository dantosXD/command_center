<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { setContext } from 'svelte';

  interface Props {
    value?: string;
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { value = $bindable(''), class: className, children, ...restProps }: Props = $props();

  setContext('tabs', {
    get value() {
      return value;
    },
    setValue: (newValue: string) => {
      value = newValue;
    },
  });
</script>

<div class={cn('w-full', className)} {...restProps}>
  {@render children?.()}
</div>
