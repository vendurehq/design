import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * Two cable connectors that don't meet, with a dashed gap and a spark where
 * the connection failed. The `ErrorState` default — deliberately neutral, not
 * destructive-tinted; the "this failed" weight comes from the state view's
 * `role="alert"` and copy, not the illustration.
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
      <path d="M20,60 Q6,60 6,44" className="stroke-muted-foreground" />
      <rect
        x="20"
        y="50"
        width="36"
        height="20"
        rx="4"
        className="fill-surface stroke-muted-foreground"
      />
      <rect x="54" y="56" width="10" height="3" rx="1.5" className="fill-muted-foreground" />
      <rect x="54" y="63" width="10" height="3" rx="1.5" className="fill-muted-foreground" />

      {/* right socket + trailing cable */}
      <path d="M140,60 Q154,60 154,44" className="stroke-muted-foreground" />
      <rect
        x="104"
        y="50"
        width="36"
        height="20"
        rx="4"
        className="fill-surface stroke-muted-foreground"
      />
      <rect x="98" y="56" width="8" height="3" rx="1.5" className="fill-background stroke-border" />
      <rect x="98" y="63" width="8" height="3" rx="1.5" className="fill-background stroke-border" />

      {/* the gap */}
      <line x1="66" y1="60" x2="94" y2="60" className="stroke-border" strokeDasharray="2 5" />

      {/* spark — the one brand accent */}
      <polygon
        points="80,52 81.5,58.5 88,60 81.5,61.5 80,68 78.5,61.5 72,60 78.5,58.5"
        className="fill-brand"
      />
    </svg>
  );
}

export { ErrorIllustration };
