import { Card, CardAction, CardContent, CardHeader } from '@vendure-io/ui/components/atoms/card';
import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
import { SkeletonLine } from '@vendure-io/ui/components/molecules/state-views/skeleton-parts';
import { useMessages } from '@vendure-io/ui/lib/format-messages';
import { cn } from '@vendure-io/ui/lib/utils';
import { cva } from 'class-variance-authority';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

// Delta color follows the outcome, not the direction: `goodWhen` says which
// way is good for this metric (revenue up vs. refund-rate down), and the token
// is derived from that, never a hardcoded green/red: good → success,
// bad → destructive, flat → muted. The `*-text` slots are the text-safe tone
// steps on every surface: the solid tones fall below 4.5:1 in dark mode.
const statCardDeltaVariants = cva('inline-flex items-center gap-0.5 text-xs font-medium', {
  variants: {
    outcome: {
      good: 'text-success-text',
      bad: 'text-destructive-text',
      flat: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    outcome: 'flat',
  },
});

interface StatCardDelta {
  /**
   * Percentage change, e.g. `-3.2` for −3.2 %. The sign drives the arrow and
   * the color. `undefined` means not known yet: the delta draws a skeleton.
   */
  value: number | undefined;
  /**
   * A unit for a change that is not a percentage, e.g. `' pp'` for percentage
   * points. The number is then formatted as a plain decimal and this follows
   * it. `undefined` → a percent in the `FormatProvider` locale.
   */
  label?: string;
  /** Which direction is a good outcome for this metric. Default `'up'`. */
  goodWhen?: 'up' | 'down';
}

interface StatCardProps extends ComponentProps<typeof Card> {
  label: ReactNode;
  /**
   * Pre-formatted display value: `<Money>`, `<AnimatedNumber>`, a string.
   * `undefined` means not known yet: a skeleton of the value's height draws
   * under the real label, so nothing moves when the value arrives. `0` and
   * `''` are real values.
   */
  value?: ReactNode;
  /** Secondary line, e.g. "vs. previous period". */
  description?: ReactNode;
  icon?: ReactNode;
  delta?: StatCardDelta;
  /** Optional sparkline/chart slot. */
  chart?: ReactNode;
  /** Header-right slot, e.g. a menu or timeframe select. */
  action?: ReactNode;
  /** Screen-reader word before a rising delta. Default: `messages.statCard.up`, then `'up'`. */
  deltaUpLabel?: string;
  /** Screen-reader word before a falling delta. Default: `messages.statCard.down`, then `'down'`. */
  deltaDownLabel?: string;
}

// One line of the surrounding text size, so the loaded text takes exactly its
// place. The value and the delta sit in a baseline-aligned row: the
// zero-width space gives the skeleton a text baseline, so the row keeps its
// height whether one, both or neither of them is loading.
function StatCardSkeleton({ className }: { className: string }) {
  return (
    <span aria-hidden="true" className={cn('inline-flex max-w-full', className)}>
      <span>{'\u200b'}</span>
      <SkeletonLine />
    </span>
  );
}

interface StatCardDeltaBadgeProps extends StatCardDelta {
  upLabel?: string;
  downLabel?: string;
}

function StatCardDeltaBadge({
  value,
  label,
  goodWhen = 'up',
  upLabel,
  downLabel,
}: StatCardDeltaBadgeProps) {
  const { locale } = useFormatSettings();
  const t = useMessages('statCard', { up: upLabel, down: downLabel });

  if (value === undefined) {
    return (
      <span data-slot="stat-card-delta" className={statCardDeltaVariants({ outcome: 'flat' })}>
        <StatCardSkeleton className="w-10" />
      </span>
    );
  }

  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const outcome = direction === 'flat' ? 'flat' : direction === goodWhen ? 'good' : 'bad';
  // One fraction digit, as before, but with the locale's decimal mark and
  // percent sign ("12.4%", "12,4 %"). A caller-given unit keeps the decimal
  // number and appends the unit instead of the percent sign.
  const digits = { minimumFractionDigits: 1, maximumFractionDigits: 1 };
  const formatted =
    label === undefined
      ? new Intl.NumberFormat(locale, { style: 'percent', ...digits }).format(Math.abs(value) / 100)
      : new Intl.NumberFormat(locale, digits).format(Math.abs(value));

  return (
    <span data-slot="stat-card-delta" className={statCardDeltaVariants({ outcome })}>
      {direction === 'up' ? (
        <ArrowUp aria-hidden="true" className="size-3" />
      ) : direction === 'down' ? (
        <ArrowDown aria-hidden="true" className="size-3" />
      ) : null}
      {/* The number has no sign and the arrow is visual-only, so screen
          readers need the direction spelled out. */}
      {direction !== 'flat' ? (
        <span className="sr-only">{direction === 'up' ? t.up : t.down} </span>
      ) : null}
      {formatted}
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  description,
  icon,
  delta,
  chart,
  action,
  deltaUpLabel,
  deltaDownLabel,
  className,
  ...props
}: StatCardProps) {
  const isValueKnown = value !== undefined;

  return (
    <Card
      data-slot="stat-card"
      aria-busy={isValueKnown ? undefined : true}
      className={className}
      {...props}
    >
      <CardHeader>
        <div
          data-slot="stat-card-label"
          className="text-muted-foreground flex items-center gap-1.5 text-sm font-medium [&_svg:not([class*='size-'])]:size-4"
        >
          {icon ? (
            <span data-slot="stat-card-icon" className="inline-flex">
              {icon}
            </span>
          ) : null}
          {label}
        </div>
        {action ? <CardAction>{action}</CardAction> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <div className="flex items-baseline gap-2">
          <span data-slot="stat-card-value" className="text-2xl font-semibold tabular-nums">
            {isValueKnown ? value : <StatCardSkeleton className="w-24" />}
          </span>
          {delta ? (
            <StatCardDeltaBadge {...delta} upLabel={deltaUpLabel} downLabel={deltaDownLabel} />
          ) : null}
        </div>
        {description ? (
          <p data-slot="stat-card-description" className="text-muted-foreground text-sm">
            {description}
          </p>
        ) : null}
        {chart ? (
          <div data-slot="stat-card-chart" className="mt-2">
            {chart}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

export { StatCard, type StatCardProps, type StatCardDelta };
