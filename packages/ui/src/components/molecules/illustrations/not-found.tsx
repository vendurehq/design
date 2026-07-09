import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A compass whose needle points off a dashed trail that dead-ends in an "x".
 * For 404s and missing-resource errors — pass as `illustration` to
 * `ErrorState` alongside a "Go back" action.
 */
function NotFoundIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* map, folded corner */}
      <rect x="30" y="30" width="60" height="44" rx="2" className="fill-surface stroke-border" />
      <polygon points="90,30 90,42 78,30" className="fill-muted stroke-border" />

      {/* trail off the edge, lost */}
      <path d="M96,70 Q120,80 148,64" className="stroke-border" strokeDasharray="3 4" />
      <line x1="144" y1="60" x2="152" y2="68" className="stroke-muted-foreground" />
      <line x1="152" y1="60" x2="144" y2="68" className="stroke-muted-foreground" />

      {/* compass */}
      <circle cx="76" cy="58" r="20" className="fill-surface stroke-muted-foreground" />
      <line x1="76" y1="40" x2="76" y2="44" className="stroke-border" />
      <line x1="76" y1="72" x2="76" y2="76" className="stroke-border" />
      <line x1="58" y1="58" x2="62" y2="58" className="stroke-border" />
      <line x1="90" y1="58" x2="94" y2="58" className="stroke-border" />
      <polygon points="76,58 82,44 76,50" className="fill-muted-foreground" />
      {/* needle tip — the one brand accent */}
      <polygon points="76,58 70,72 76,66" className="fill-brand" />
      <circle cx="76" cy="58" r="2" className="fill-surface stroke-muted-foreground" />
    </svg>
  );
}

export { NotFoundIllustration };
