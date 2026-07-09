import { Card, CardAction, CardContent, CardHeader } from '@vendure-io/ui/components/atoms/card';
import { Skeleton } from '@vendure-io/ui/components/atoms/skeleton';
import { cva } from 'class-variance-authority';
import { ArrowDown, ArrowUp } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

// Delta tone follows consequence, not direction: `goodWhen` says which way is
// good for this metric (revenue up vs. refund-rate down), and the token is
// derived from that — never a hardcoded green/red. Per ADR 0003: good →
// success, bad → destructive, flat → muted.
const statCardDeltaVariants = cva('inline-flex items-center gap-0.5 text-xs font-medium', {
  variants: {
    tone: {
      good: 'text-success',
      bad: 'text-destructive',
      flat: 'text-muted-foreground',
    },
  },
  defaultVariants: {
    tone: 'flat',
  },
});

interface StatCardDelta {
  /** Raw percentage change, e.g. `-3.2`. Sign drives the arrow and tone. */
  value: number;
  /** Suffix after the number. Default `'%'`. */
  label?: string;
  /** Which direction is a good outcome for this metric. Default `'up'`. */
  goodWhen?: 'up' | 'down';
}

interface StatCardProps extends ComponentProps<typeof Card> {
  label: ReactNode;
  /** Pre-formatted display value — pass `<Money>`, `<AnimatedNumber>`, a string. */
  value: ReactNode;
  /** Secondary line, e.g. "vs. previous period". */
  description?: ReactNode;
  icon?: ReactNode;
  delta?: StatCardDelta;
  /** Optional sparkline/chart slot. */
  chart?: ReactNode;
  isLoading?: boolean;
  /** Header-right slot, e.g. a menu or timeframe select. */
  action?: ReactNode;
}

function StatCardDeltaBadge({ value, label = '%', goodWhen = 'up' }: StatCardDelta) {
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const tone = direction === 'flat' ? 'flat' : direction === goodWhen ? 'good' : 'bad';

  return (
    <span data-slot="stat-card-delta" className={statCardDeltaVariants({ tone })}>
      {direction === 'up' ? (
        <ArrowUp className="size-3" />
      ) : direction === 'down' ? (
        <ArrowDown className="size-3" />
      ) : null}
      {Math.abs(value).toFixed(1)}
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
  isLoading = false,
  action,
  className,
  ...props
}: StatCardProps) {
  if (isLoading) {
    return (
      <Card data-slot="stat-card" className={className} {...props}>
        <CardHeader>
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-40" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-slot="stat-card" className={className} {...props}>
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
            {value}
          </span>
          {delta ? <StatCardDeltaBadge {...delta} /> : null}
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

export { StatCard, statCardDeltaVariants, type StatCardProps, type StatCardDelta };
