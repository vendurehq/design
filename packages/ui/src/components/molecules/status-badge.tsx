import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import type { Tone } from '@vendure-io/ui/lib/state-dictionary';
import { cn } from '@vendure-io/ui/lib/utils';
import { cva } from 'class-variance-authority';

// Subtle-only, always. Tinted background + readable foreground + matching
// border, per tone — the treatment every hand-rolled status chip was reaching
// for. There is no solid mode: solid/brand chips stay on the base `Badge`
// (accent rationing applied at the API level).
//
// Slot = tone, with two aliases: `critical` renders via the `destructive`
// slots (the token keeps its shadcn-compatible name) and `progress` renders
// via the `neutral` slots with an info-colored pulsing dot — a chip that is
// otherwise identical to `info` is not scannable; the neutral body says "no
// outcome yet" while the dot says "in motion". Class strings are static per
// tone so Tailwind's scanner picks them up.
//
// Metrics mirror `Badge` (h-5, pill radius, text-xs) so a StatusBadge and a
// Badge sit side by side on the same row of a table.
const statusBadgeVariants = cva(
  'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-4xl border px-2 py-0.5 text-xs font-medium',
  {
    variants: {
      tone: {
        neutral: 'bg-neutral-subtle text-neutral-subtle-foreground border-neutral-border',
        info: 'bg-info-subtle text-info-subtle-foreground border-info-border',
        success: 'bg-success-subtle text-success-subtle-foreground border-success-border',
        warning: 'bg-warning-subtle text-warning-subtle-foreground border-warning-border',
        critical:
          'bg-destructive-subtle text-destructive-subtle-foreground border-destructive-border',
        progress: 'bg-neutral-subtle text-neutral-subtle-foreground border-neutral-border',
      } satisfies Record<Tone, string>,
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

interface StatusBadgeProps extends useRender.ComponentProps<'span'> {
  /** Semantic tone. Defaults to `neutral`. */
  tone?: Tone;
  /**
   * Show a leading dot. Off by default (calm on detail pages); opt in for dense
   * tables. `progress` always shows a dot regardless of this prop, and that dot
   * pulses (pausing under `prefers-reduced-motion`) — it replaces ad-hoc
   * spinners.
   */
  dot?: boolean;
}

function StatusBadge({
  className,
  tone = 'neutral',
  dot = false,
  render,
  children,
  ...props
}: StatusBadgeProps) {
  const showDot = dot || tone === 'progress';

  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(statusBadgeVariants({ tone }), className),
      },
      props,
      {
        // The component never transforms or translates the label — children win.
        // A consumer passes their translated string; `defaultLabel` from the
        // dictionary is a fallback the caller resolves, not something rendered here.
        children: (
          <>
            {showDot ? (
              <span
                aria-hidden
                className={cn(
                  'size-1.5 shrink-0 rounded-full',
                  tone === 'progress'
                    ? 'bg-info-subtle-foreground motion-safe:animate-pulse'
                    : 'bg-current',
                )}
              />
            ) : null}
            {children}
          </>
        ),
      },
    ),
    render,
    state: {
      slot: 'status-badge',
      tone,
    },
  });
}

export { StatusBadge, statusBadgeVariants };
