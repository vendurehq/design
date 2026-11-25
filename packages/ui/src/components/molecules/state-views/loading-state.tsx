import { Skeleton } from '@vendure-io/ui/components/atoms/skeleton';
import { Spinner } from '@vendure-io/ui/components/atoms/spinner';
import { cn } from '@vendure-io/ui/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import { Children } from 'react';

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
  /** Number of skeleton rows. `skeleton` variant without children only; defaults to 5. */
  rows?: number;
  /** Classes applied to each skeleton row (e.g. `h-10` for tighter lists). */
  rowClassName?: string;
  /** Visible label. An sr-only `srLabel` is always rendered for assistive tech. */
  label?: React.ReactNode;
  /** Sr-only label announced to assistive tech. Override for host i18n. @default "Loading…" */
  srLabel?: string;
  /**
   * Milliseconds before the placeholder appears. A load that ends sooner never
   * shows it, so fast loads do not flash. `0` shows it at once. @default 150
   */
  delay?: number;
  /**
   * Skeleton parts in the shape of the page (`SkeletonPageHeader`,
   * `SkeletonCard`, `SkeletonListRow`, …). Replace the `rows` bars.
   * `skeleton` variant only. Children that render nothing (`false`, `null`,
   * an empty array) fall back to the `rows` bars.
   */
  children?: React.ReactNode;
}

// The placeholder holds its space at once but stays transparent for `delay`,
// then fades in. Under reduced motion it appears without the fade, still after
// the delay: the delay is not motion, it keeps fast loads from flashing.
const DELAYED_ENTRY =
  '[animation:page-fade_var(--transition-duration-normal)_var(--ease-out)_var(--loading-state-delay)_both] motion-reduce:[animation-duration:0s]';

/**
 * Placeholder shell for in-flight list/detail queries. Renders as an
 * `aria-live` `<output>` with an always-present sr-only `srLabel` (defaults to
 * "Loading…", overridable for host i18n).
 * `skeleton` (default) draws N shimmer rows, or the skeleton parts passed as
 * children; `spinner` centers the `Spinner` atom for compact or unknown-height
 * regions. Nothing shows for the first `delay` ms (150 by default).
 */
function LoadingState({
  variant = 'skeleton',
  rows = 5,
  rowClassName,
  label,
  srLabel = 'Loading…',
  delay = 150,
  children,
  className,
  style,
  ...props
}: LoadingStateProps) {
  return (
    <output
      data-slot="loading-state"
      aria-live="polite"
      className={cn(loadingStateVariants({ variant }), delay > 0 && DELAYED_ENTRY, className)}
      style={
        delay > 0
          ? ({ '--loading-state-delay': `${delay}ms`, ...style } as React.CSSProperties)
          : style
      }
      {...props}
    >
      <span className="sr-only">{srLabel}</span>
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
          {Children.toArray(children).length > 0
            ? children
            : Array.from({ length: rows }).map((_, i) => (
                <Skeleton key={i} className={cn('h-14 w-full rounded-md', rowClassName)} />
              ))}
        </>
      )}
    </output>
  );
}

export { LoadingState, loadingStateVariants };
