import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A terminal window with a title bar and a few dashed, empty log lines below
 * a blinking prompt caret waiting for output. For an empty log stream or
 * console with nothing captured yet — pass as `illustration` to `EmptyState`.
 * Not for a generic error (use `ErrorIllustration`).
 */
function NoLogsIllustration({ className, size = 160 }: IllustrationProps) {
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
      <ellipse cx="80" cy="104" rx="30" ry="5" className="fill-muted" />

      {/* terminal window */}
      <rect
        x="26"
        y="22"
        width="108"
        height="68"
        rx="4"
        className="fill-surface stroke-muted-foreground"
      />

      {/* title bar, with window dots */}
      <line x1="26" y1="36" x2="134" y2="36" className="stroke-border" />
      <circle cx="34" cy="29" r="2" className="fill-muted-foreground" />
      <circle cx="42" cy="29" r="2" className="fill-muted-foreground" />
      <circle cx="50" cy="29" r="2" className="fill-muted-foreground" />

      {/* empty log lines — nothing captured yet */}
      <line x1="38" y1="50" x2="96" y2="50" className="stroke-border" strokeDasharray="3 4" />
      <line x1="38" y1="60" x2="112" y2="60" className="stroke-border" strokeDasharray="3 4" />
      <line x1="38" y1="70" x2="80" y2="70" className="stroke-border" strokeDasharray="3 4" />

      {/* prompt caret, blinking on an empty line — the one brand accent */}
      <rect x="38" y="78" width="8" height="10" rx="1" className="fill-brand" />
    </svg>
  );
}

export { NoLogsIllustration };
