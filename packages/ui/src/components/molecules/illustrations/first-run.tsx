import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A rocket lifting off on a dashed motion trail, with a lit porthole and two
 * drifting sparkles. For genuine first-run/onboarding moments — a feature
 * with nothing set up yet, not a filtered or failed view.
 */
function FirstRunIllustration({ className, size = 160 }: IllustrationProps) {
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
      <ellipse cx="80" cy="104" rx="26" ry="5" className="fill-muted" />

      {/* motion trail */}
      <path d="M70,100 Q66,80 74,60" className="stroke-border" strokeDasharray="3 4" />
      <path d="M90,100 Q94,80 86,60" className="stroke-border" strokeDasharray="3 4" />

      {/* body */}
      <path
        d="M80,26 C90,36 92,50 90,66 L70,66 C68,50 70,36 80,26 Z"
        className="fill-surface stroke-muted-foreground"
      />
      <polygon points="70,66 60,78 70,72" className="fill-muted-foreground" />
      <polygon points="90,66 100,78 90,72" className="fill-muted-foreground" />
      <path d="M74,66 L80,80 L86,66" className="stroke-border" strokeDasharray="2 3" />

      {/* porthole — the one brand accent */}
      <circle cx="80" cy="44" r="7" className="fill-brand" />
      <circle cx="77.5" cy="42" r="1.6" className="fill-surface" />

      {/* drifting sparkles, neutral */}
      <polygon
        points="46,28 47.5,32.5 52,34 47.5,35.5 46,40 44.5,35.5 40,34 44.5,32.5"
        className="fill-muted-foreground"
      />
      <polygon
        points="118,48 119,51 122,52 119,53 118,56 117,53 114,52 117,51"
        className="fill-muted-foreground"
      />
    </svg>
  );
}

export { FirstRunIllustration };
