import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A cloud cut by a diagonal slash, with fading signal arcs above it. For
 * network/connectivity failures — pass as `illustration` to `ErrorState`.
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

      {/* fading signal, cut off */}
      <path d="M70,20 a14,14 0 0,1 20,0" className="stroke-border" strokeDasharray="2 4" />
      <path d="M65,12 a24,24 0 0,1 30,0" className="stroke-border" strokeDasharray="2 5" />

      {/* cloud */}
      <path
        d="M46,66 C40,66 36,61 36,55 C36,49 41,44 47,44 C48,36 55,30 64,30 C72,30 79,35 81,42 C82,42 83,41 85,41 C93,41 100,48 100,56 C100,64 93,71 85,71 L52,71 C48,71 46,69 46,66 Z"
        className="fill-surface stroke-muted-foreground"
      />

      {/* slash */}
      <line x1="32" y1="32" x2="104" y2="74" className="stroke-muted-foreground" />

      {/* reconnect dot — the one brand accent */}
      <circle cx="104" cy="74" r="4" className="fill-brand" />
    </svg>
  );
}

export { OfflineIllustration };
