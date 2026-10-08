import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A cloud cut by a diagonal slash, under a signal glyph whose arcs fade out.
 * For network/connectivity failures — pass as `illustration` to `ErrorState`
 * with a "Try again" action. Not for a server-side failure while the network
 * is fine (use `ErrorIllustration`).
 */
function OfflineIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* fading signal arcs, cut off */}
      <path d="M72,26 a12,12 0 0,1 16,0" className="stroke-border" strokeDasharray="2 4" />
      <path d="M65,19 a22,22 0 0,1 30,0" className="stroke-border" strokeDasharray="2 5" />

      {/* signal source — the one brand accent */}
      <circle cx="80" cy="33" r="3" className="fill-brand" />

      {/* cloud */}
      <path
        d="M58,82 C52,82 48,77 48,71 C48,65 53,60 59,60 C60,52 67,46 76,46 C84,46 91,51 93,58 C94,58 95,57 97,57 C105,57 112,64 112,72 C112,80 105,87 97,87 L64,87 C60,87 58,85 58,82 Z"
        className="fill-surface stroke-muted-foreground"
      />

      {/* slash */}
      <line x1="46" y1="48" x2="114" y2="92" className="stroke-muted-foreground" />
    </svg>
  );
}

export { OfflineIllustration };
