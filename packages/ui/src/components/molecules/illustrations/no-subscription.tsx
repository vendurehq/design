import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A pricing card in front of two dashed plan cards, with a plan name pill and
 * feature rows that are still empty. For a project or account with no
 * plan or subscription yet, next to a "Choose a plan" or "Start a trial"
 * action. Not for a trial that ran out (use `ExpiredIllustration`) or a plan
 * whose payment failed (use `PaymentFailedIllustration`).
 */
function NoSubscriptionIllustration({ className, size = 160 }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      width={size}
      height={(size * 120) / 160}
      fill="none"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
    >
      <ellipse cx="80" cy="104" rx="34" ry="5" className="fill-muted" />

      {/* other plans, not chosen */}
      <rect
        x="30"
        y="34"
        width="34"
        height="50"
        rx="3"
        className="stroke-border"
        strokeDasharray="3 4"
      />
      <rect
        x="96"
        y="34"
        width="34"
        height="50"
        rx="3"
        className="stroke-border"
        strokeDasharray="3 4"
      />

      {/* plan card */}
      <rect
        x="56"
        y="22"
        width="48"
        height="72"
        rx="4"
        className="fill-surface stroke-muted-foreground"
      />
      <line x1="64" y1="44" x2="90" y2="44" className="stroke-muted-foreground" />

      {/* feature rows, nothing included yet */}
      <circle cx="67" cy="58" r="2.5" className="stroke-border" />
      <line x1="73" y1="58" x2="96" y2="58" className="stroke-border" strokeDasharray="3 4" />
      <circle cx="67" cy="68" r="2.5" className="stroke-border" />
      <line x1="73" y1="68" x2="92" y2="68" className="stroke-border" strokeDasharray="3 4" />
      <circle cx="67" cy="78" r="2.5" className="stroke-border" />
      <line x1="73" y1="78" x2="96" y2="78" className="stroke-border" strokeDasharray="3 4" />

      {/* plan name pill — the one brand accent */}
      <rect x="64" y="30" width="20" height="7" rx="3.5" className="fill-brand" />
    </svg>
  );
}

export { NoSubscriptionIllustration };
