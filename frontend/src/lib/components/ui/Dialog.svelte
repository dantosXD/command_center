<script lang="ts">
  import { cn } from '$lib/utils/cn';
  import { X } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    onClose?: () => void;
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { open = $bindable(false), onClose, class: className, children, ...restProps }: Props = $props();

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      if (onClose) onClose();
      else open = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      if (onClose) onClose();
      else open = false;
    }
  }
</script>

{#if open}
  <div
    class="fixed inset-0 z-50 flex items-center justify-center"
    role="dialog"
    aria-modal="true"
    onkeydown={handleKeydown}
  >
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-background/80 backdrop-blur-sm animate-fade-in"
      onclick={handleBackdropClick}
    ></div>

    <!-- Dialog Content -->
    <div
      class={cn(
        'relative z-50 w-full max-w-lg mx-4 bg-background border rounded-lg shadow-lg animate-fade-in',
        className
      )}
      {...restProps}
    >
      {@render children?.()}
    </div>
  </div>
{/if}
