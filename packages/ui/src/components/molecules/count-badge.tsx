import type { Tone } from '@vendure-io/ui/lib/state-dictionary';
import { cn } from '@vendure-io/ui/lib/utils';
import { cva } from 'class-variance-authority';
import type * as React from 'react';

type CountBadgeTone = Tone | 'brand';
type CountBadgePlacement = 'inline' | 'corner';

// A small solid count: unread notifications or alerts on an icon button, the
// number of active filters inside a button. The number is the whole content,
// so the fill is solid, not a tint: a tint at 11px does not read.
//
// `tone` takes every shared tone, so a `maxTone()` result passes in as it is,
// plus `brand`. `critical` takes the `destructive` slots and `progress` the
// `info` slots, as on StatusBadge. `neutral` is the `primary` ink (near black
// in light mode, light grey in dark mode): every hand-built count in the apps
// used it. `brand` follows accent rationing: an opt-in, not the default for
// unread items. Each pair is held to 4.5:1 by the tokens' contrast test.
//
// `corner` sits on the top end corner of an icon button, 16px high. Its start
// edge is pinned to the middle of the button, so a wider count ("99+") grows
// away from the icon, not over it, and mirrors in RTL. The button must be the
// containing block: add `relative` to it. A 2px ring in the
// page background cuts the count out of the icon under it. `inline` sits in
// the flow of a button label, 20px high, the button's gap spacing it.
const countBadgeVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center rounded-full font-medium tabular-nums whitespace-nowrap',
    // Forced colours drop the fill; an outline keeps the pill visible.
    'outline-1 outline-transparent -outline-offset-1',
  ],
  {
    variants: {
      tone: {
        neutral: 'bg-primary text-primary-foreground',
        brand: 'bg-brand text-brand-foreground',
        info: 'bg-info text-info-foreground',
        success: 'bg-success text-success-foreground',
        warning: 'bg-warning text-warning-foreground',
        critical: 'bg-destructive text-destructive-foreground',
        progress: 'bg-info text-info-foreground',
      } satisfies Record<CountBadgeTone, string>,
      placement: {
        inline: 'h-5 min-w-5 px-1.5 text-xs/none',
        corner:
          'pointer-events-none absolute start-1/2 -top-1 h-4 min-w-4 px-1 text-2xs/none ring-2 ring-background',
      } satisfies Record<CountBadgePlacement, string>,
    },
    defaultVariants: {
      tone: 'neutral',
      placement: 'inline',
    },
  },
);

/** The visible text: the count, or `${max}+` above the cap. */
function formatCount(count: number, max: number) {
  return count > max ? `${max}+` : String(count);
}

interface CountBadgeProps extends Omit<React.ComponentProps<'span'>, 'children'> {
  /** The number to show. Nothing renders at 0, below 0 or for a non-finite value. */
  count: number;
  /** The highest number shown as is. Above it the badge reads "99+". Default 99. */
  max?: number;
  tone?: CountBadgeTone;
  placement?: CountBadgePlacement;
  /**
   * What the count means to a screen reader, with the real number: "3 unread",
   * "120 unread". The visible number is then hidden from it. The design system
   * does not know the noun, so the caller writes (and translates) it. Leave it
   * out where the text around the count already names it ("Active filters").
   * An `aria-label` on the button replaces its content: put the count in that
   * label instead.
   */
  label?: string;
}

function CountBadge({
  count,
  max = 99,
  tone = 'neutral',
  placement = 'inline',
  label,
  className,
  ...props
}: CountBadgeProps) {
  if (!Number.isFinite(count) || count <= 0) {
    return null;
  }

  const text = formatCount(Math.floor(count), max);

  return (
    <span
      data-slot="count-badge"
      data-tone={tone}
      data-placement={placement}
      className={cn(countBadgeVariants({ tone, placement }), className)}
      {...props}
    >
      {label ? (
        <>
          <span aria-hidden="true">{text}</span>
          <span className="sr-only">{label}</span>
        </>
      ) : (
        text
      )}
    </span>
  );
}

export { CountBadge, countBadgeVariants, formatCount };
export type { CountBadgePlacement, CountBadgeProps, CountBadgeTone };
