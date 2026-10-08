import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * Two cable connectors that don't meet, with a dashed gap and a spark where
 * the connection failed. The `ErrorState` default — deliberately neutral, not
 * destructive-tinted; the "this failed" weight comes from the state view's
 * `role="alert"` and copy, not the illustration. Not for a lost network
 * connection (use `OfflineIllustration`), a 404 (use `NotFoundIllustration`)
 * or a failed payment (use `PaymentFailedIllustration`).
 */
function ErrorIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* left plug + trailing cable */}
      <path d="M28,64 Q16,64 16,48" className="stroke-muted-foreground" />
      <rect
        x="28"
        y="53"
        width="34"
        height="22"
        rx="4"
        className="fill-surface stroke-muted-foreground"
      />
      <rect x="60" y="58" width="10" height="3" rx="1.5" className="fill-muted-foreground" />
      <rect x="60" y="66" width="10" height="3" rx="1.5" className="fill-muted-foreground" />

      {/* right socket + trailing cable */}
      <path d="M132,64 Q144,64 144,48" className="stroke-muted-foreground" />
      <rect
        x="98"
        y="53"
        width="34"
        height="22"
        rx="4"
        className="fill-surface stroke-muted-foreground"
      />
      <rect x="92" y="58" width="8" height="3" rx="1.5" className="fill-background stroke-border" />
      <rect x="92" y="66" width="8" height="3" rx="1.5" className="fill-background stroke-border" />

      {/* the gap */}
      <line x1="72" y1="64" x2="90" y2="64" className="stroke-border" strokeDasharray="2 5" />

      {/* spark — the one brand accent */}
      <polygon
        points="81,56 82.5,62.5 89,64 82.5,65.5 81,72 79.5,65.5 73,64 79.5,62.5"
        className="fill-brand"
      />
    </svg>
  );
}

export { ErrorIllustration };
