<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { Check } from 'lucide-svelte';

  interface Props {
    checked?: boolean;
    disabled?: boolean;
    class?: string;
    id?: string;
    name?: string;
    value?: string;
    onchange?: (e: Event & { currentTarget: HTMLInputElement }) => void;
  }

  let {
    checked = $bindable(false),
    disabled = false,
    class: className,
    id,
    name,
    value,
    onchange,
    ...restProps
  }: Props = $props();
</script>

<button
  type="button"
  role="checkbox"
  aria-checked={checked}
  {disabled}
  class={cn(
    'peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    checked ? 'bg-primary text-primary-foreground' : 'bg-background',
    className
  )}
  onclick={() => {
    if (!disabled) {
      checked = !checked;
    }
  }}
  {...restProps}
>
  {#if checked}
    <Check class="h-3 w-3" />
  {/if}
</button>

<input type="checkbox" {id} {name} {value} bind:checked {disabled} class="sr-only" {onchange} />
