<script lang="ts">
  import { cva, type VariantProps } from 'class-variance-authority';
  import { cn } from '$lib/utils/cn';

  const alertVariants = cva(
    'relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground',
    {
      variants: {
        variant: {
          default: 'bg-background text-foreground',
          destructive:
            'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
          success: 'border-success/50 text-success dark:border-success [&>svg]:text-success',
          warning: 'border-warning/50 text-warning dark:border-warning [&>svg]:text-warning',
        },
      },
      defaultVariants: {
        variant: 'default',
      },
    }
  );

  type AlertVariants = VariantProps<typeof alertVariants>;

  interface Props extends AlertVariants {
    class?: string;
    children?: import('svelte').Snippet;
  }

  let { variant = 'default', class: className, children, ...restProps }: Props = $props();
</script>

<div class={cn(alertVariants({ variant }), className)} role="alert" {...restProps}>
  {@render children?.()}
</div>
