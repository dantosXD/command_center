<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    value?: string;
    disabled?: boolean;
    required?: boolean;
    class?: string;
    id?: string;
    name?: string;
    onchange?: (e: Event & { currentTarget: HTMLSelectElement }) => void;
    children?: import('svelte').Snippet;
  }

  let {
    value = $bindable(''),
    disabled = false,
    required = false,
    class: className,
    id,
    name,
    onchange,
    children,
    ...restProps
  }: Props = $props();
</script>

<select
  bind:value
  {disabled}
  {required}
  {id}
  {name}
  class={cn(
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    className
  )}
  {onchange}
  {...restProps}
>
  {@render children?.()}
</select>
