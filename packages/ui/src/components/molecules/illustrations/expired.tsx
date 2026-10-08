import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A stopwatch whose hand is back at twelve and whose dashed track has run out.
 * For something time-limited that ended: a trial or evaluation, an expired
 * link, or a sign-in request that timed out. Pair it with an action that
 * starts it again. Not for a request still waiting on someone (use
 * `PendingApprovalIllustration`) or a generic failure (use
 * `ErrorIllustration`).
 */
function ExpiredIllustration({ className, size = 160 }: IllustrationProps) {
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
      <ellipse cx="80" cy="104" rx="28" ry="5" className="fill-muted" />

      {/* crown stem + side button */}
      <rect
        x="77"
        y="26"
        width="6"
        height="8"
        rx="1"
        className="fill-surface stroke-muted-foreground"
      />
      <line x1="101" y1="41" x2="105" y2="37" className="stroke-muted-foreground" />

      {/* body */}
      <circle cx="80" cy="62" r="28" className="fill-surface stroke-muted-foreground" />

      {/* track, run out */}
      <circle cx="80" cy="62" r="21" className="stroke-border" strokeDasharray="2 4" />

      {/* hand, back at twelve */}
      <line x1="80" y1="62" x2="80" y2="45" className="stroke-muted-foreground" />
      <circle cx="80" cy="62" r="2.5" className="fill-muted-foreground" />

      {/* restart button — the one brand accent */}
      <rect x="72" y="19" width="16" height="7" rx="3.5" className="fill-brand" />
    </svg>
  );
}

export { ExpiredIllustration };
