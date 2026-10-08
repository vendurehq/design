import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A payment card with a declined badge on its corner and an unfilled number
 * line. For a payment that did not go through: a failed charge, a past-due
 * invoice, or a checkout that was canceled before payment. Pair it with a
 * "Pay now" or "Update payment method" action. Not for a project with no plan
 * at all (use `NoSubscriptionIllustration`) or a generic failure (use
 * `ErrorIllustration`).
 */
function PaymentFailedIllustration({ className, size = 160 }: IllustrationProps) {
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
      <ellipse cx="78" cy="104" rx="32" ry="5" className="fill-muted" />

      {/* card */}
      <rect
        x="38"
        y="36"
        width="74"
        height="48"
        rx="5"
        className="fill-surface stroke-muted-foreground"
      />

      {/* card number, not filled in */}
      <line x1="48" y1="70" x2="88" y2="70" className="stroke-border" strokeDasharray="3 4" />
      <line x1="48" y1="76" x2="64" y2="76" className="stroke-border" />

      {/* chip — the one brand accent */}
      <rect x="48" y="50" width="14" height="10" rx="2" className="fill-brand" />

      {/* declined badge */}
      <circle cx="112" cy="38" r="10" className="fill-surface stroke-muted-foreground" />
      <line x1="108" y1="34" x2="116" y2="42" className="stroke-muted-foreground" />
      <line x1="116" y1="34" x2="108" y2="42" className="stroke-muted-foreground" />
    </svg>
  );
}

export { PaymentFailedIllustration };
