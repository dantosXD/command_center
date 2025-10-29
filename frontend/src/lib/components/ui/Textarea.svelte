<script lang="ts">
  import { cn } from '$lib/utils/cn';

  interface Props {
    value?: string;
    placeholder?: string;
    disabled?: boolean;
    readonly?: boolean;
    required?: boolean;
    rows?: number;
    class?: string;
    id?: string;
    name?: string;
    oninput?: (e: Event & { currentTarget: HTMLTextAreaElement }) => void;
    onchange?: (e: Event & { currentTarget: HTMLTextAreaElement }) => void;
  }

  let {
    value = $bindable(''),
    placeholder,
    disabled = false,
    readonly = false,
    required = false,
    rows = 3,
    class: className,
    id,
    name,
    oninput,
    onchange,
    ...restProps
  }: Props = $props();
</script>

<textarea
  bind:value
  {placeholder}
  {disabled}
  {readonly}
  {required}
  {rows}
  {id}
  {name}
  class={cn(
    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    className
  )}
  {oninput}
  {onchange}
  {...restProps}
></textarea>
