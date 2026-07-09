import { Skeleton } from '@vendure-io/ui/components/atoms/skeleton';
import { Spinner } from '@vendure-io/ui/components/atoms/spinner';
import { cn } from '@vendure-io/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const loadingStateVariants = cva('flex w-full min-w-0 flex-col gap-3', {
  variants: {
    variant: {
      skeleton: '',
      spinner: 'text-muted-foreground items-center justify-center gap-2 py-8',
    },
  },
  defaultVariants: {
    variant: 'skeleton',
  },
});

// `React.ComponentProps<'output'>` (not `'div'` as the spike sketch wrote) so
// the spread props type-check against the `<output>` we render.
export interface LoadingStateProps
  extends React.ComponentProps<'output'>,
    VariantProps<typeof loadingStateVariants> {
  /** Number of skeleton rows. `skeleton` variant only; defaults to 5. */
  rows?: number;
  /** Classes applied to each skeleton row (e.g. `h-10` for tighter lists). */
  rowClassName?: string;
  /** Visible label. An sr-only "Loading…" is always rendered for assistive tech. */
  label?: React.ReactNode;
}

/**
 * Placeholder shell for in-flight list/detail queries. Renders as an
 * `aria-live` `<output>` with an always-present sr-only "Loading…" label.
 * `skeleton` (default) draws N shimmer rows; `spinner` centers the `Spinner`
 * atom for compact or unknown-height regions.
 */
function LoadingState({
  variant = 'skeleton',
  rows = 5,
  rowClassName,
  label,
  className,
  ...props
}: LoadingStateProps) {
  return (
    <output
      data-slot="loading-state"
      aria-live="polite"
      className={cn(loadingStateVariants({ variant }), className)}
      {...props}
    >
      <span className="sr-only">Loading…</span>
      {variant === 'spinner' ? (
        <>
          {/* aria-hidden overrides the atom's role="status": the <output> is
              already the live region, so the spinner must not double-announce. */}
          <Spinner aria-hidden="true" />
          {label ? (
            <span data-slot="loading-state-label" className="text-muted-foreground text-sm">
              {label}
            </span>
          ) : null}
        </>
      ) : (
        <>
          {label ? (
            <span data-slot="loading-state-label" className="text-muted-foreground text-sm">
              {label}
            </span>
          ) : null}
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className={cn('h-14 w-full rounded-md', rowClassName)} />
          ))}
        </>
      )}
    </output>
  );
}

export { LoadingState, loadingStateVariants };
