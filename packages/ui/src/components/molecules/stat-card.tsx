import { Card, CardAction, CardContent, CardHeader } from '@vendure-io/ui/components/atoms/card';
import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
import { SkeletonLine } from '@vendure-io/ui/components/molecules/state-views/skeleton-parts';
import { cn } from '@vendure-io/ui/lib/utils';
import { cva } from 'class-variance-authority';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';
import { warnDeprecated } from '../../lib/deprecated.ts';
import { useMessages } from '../../lib/format-messages.ts';

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
   * the color; a change that rounds to `0.0` has neither. `undefined` means
   * not known yet: the delta draws a skeleton. `NaN` and `±Infinity` (a change
   * from zero) show "—".
   */
  value: number | undefined;
  /**
   * A unit for a change that is not a percentage, e.g. `' pp'` for percentage
   * points. The number is then a plain decimal in the `FormatProvider` locale,
   * followed by this unit. `undefined` → a percent in that locale ("12.4%",
   * "12,4 %").
   */
  unit?: string;
  /**
   * @deprecated Use `unit`. `'%'` (the 2.x default) is the locale percent,
   * so leave `unit` out for it. Removed in 4.0.
   */
  label?: string;
  /** Which direction is a good outcome for this metric. @default "up" */
  goodWhen?: 'up' | 'down';
}

interface StatCardProps extends ComponentProps<typeof Card> {
  label: ReactNode;
  /**
   * Pre-formatted display value: `<Money>`, `<AnimatedNumber>`, a string.
   * `undefined` means not known yet: a skeleton of the value's height draws
   * under the real label, so nothing moves when the value arrives. `null`
   * means there is no value and renders `fallback`. `0` and `''` are real
   * values.
   */
  value?: ReactNode;
  /** Rendered when `value` is `null`. @default "—" */
  fallback?: ReactNode;
  /** Secondary line, e.g. "vs. previous period". */
  description?: ReactNode;
  icon?: ReactNode;
  delta?: StatCardDelta;
  /** Optional sparkline/chart slot. */
  chart?: ReactNode;
  /** Header-right slot, e.g. a menu or timeframe select. */
  action?: ReactNode;
  /** Screen-reader text while the value loads. @default `messages.statCard.loading`, "Loading value" */
  loadingLabel?: string;
  /** Screen-reader word before a rising delta. @default `messages.statCard.up`, "up" */
  deltaUpLabel?: string;
  /** Screen-reader word before a falling delta. @default `messages.statCard.down`, "down" */
  deltaDownLabel?: string;
  /** @deprecated Leave `value` undefined while it loads. Removed in 4.0. */
  isLoading?: boolean;
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
  upWord: string;
  downWord: string;
}

function StatCardDeltaBadge({
  value,
  unit,
  goodWhen = 'up',
  upWord,
  downWord,
}: StatCardDeltaBadgeProps) {
  const { locale } = useFormatSettings();

  if (value === undefined) {
    return (
      <span data-slot="stat-card-delta" className={statCardDeltaVariants({ outcome: 'flat' })}>
        <StatCardSkeleton className="w-10" />
      </span>
    );
  }

  // A change from zero is ±Infinity: there is no percentage to show.
  if (!Number.isFinite(value)) {
    return (
      <span data-slot="stat-card-delta" className={statCardDeltaVariants({ outcome: 'flat' })}>
        —
      </span>
    );
  }

  // One fraction digit in the locale ("12.4%", "12,4 %"), or the decimal and
  // the caller's unit. The direction follows the shown number, so a change
  // that rounds to 0.0 has no arrow and a neutral tone.
  const digits = { minimumFractionDigits: 1, maximumFractionDigits: 1 };
  const shown = Math.round(Math.abs(value) * 10) / 10;
  const direction = shown === 0 ? 'flat' : value > 0 ? 'up' : 'down';
  const outcome = direction === 'flat' ? 'flat' : direction === goodWhen ? 'good' : 'bad';
  const formatted =
    unit === undefined
      ? new Intl.NumberFormat(locale, { style: 'unit', unit: 'percent', ...digits }).format(shown)
      : new Intl.NumberFormat(locale, digits).format(shown);

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
        <span className="sr-only">{direction === 'up' ? upWord : downWord} </span>
      ) : null}
      {formatted}
      {unit}
    </span>
  );
}

function StatCard({
  label,
  value: valueProp,
  fallback = '—',
  description,
  icon,
  delta: deltaProp,
  chart,
  action,
  loadingLabel,
  deltaUpLabel,
  deltaDownLabel,
  isLoading,
  className,
  ...props
}: StatCardProps) {
  if (isLoading !== undefined) warnDeprecated('StatCard', 'isLoading', 'value={undefined}');
  if (deltaProp?.label !== undefined) warnDeprecated('StatCard', 'delta.label', 'delta.unit');
  // 2.x: `isLoading` hid the value and the delta; `label` was the unit, with
  // `'%'` for a percent.
  const value = isLoading ? undefined : valueProp;
  const delta =
    deltaProp === undefined
      ? undefined
      : {
          ...deltaProp,
          value: isLoading ? undefined : deltaProp.value,
          unit: deltaProp.unit ?? (deltaProp.label === '%' ? undefined : deltaProp.label),
        };
  const t = useMessages('statCard', {
    loading: loadingLabel,
    up: deltaUpLabel,
    down: deltaDownLabel,
  });
  const isBusy = value === undefined || (delta !== undefined && delta.value === undefined);

  return (
    <Card
      data-slot="stat-card"
      aria-busy={isBusy ? true : undefined}
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
            {value === undefined ? (
              <>
                <StatCardSkeleton className="w-24" />
                <span className="sr-only">{t.loading}</span>
              </>
            ) : value === null ? (
              fallback
            ) : (
              value
            )}
          </span>
          {delta ? <StatCardDeltaBadge {...delta} upWord={t.up} downWord={t.down} /> : null}
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
