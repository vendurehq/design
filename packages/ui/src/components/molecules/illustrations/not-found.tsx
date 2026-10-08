import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A compass whose needle points off a dashed trail that dead-ends in an "x".
 * For 404s and missing-resource errors — pass as `illustration` to
 * `ErrorState` alongside a "Go back" action. Not for a search that matched
 * nothing (use `NoResultsIllustration`) or a resource the user may not see
 * (use `AccessDeniedIllustration`).
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
      <rect x="34" y="30" width="60" height="44" rx="2" className="fill-surface stroke-border" />
      <polygon points="94,30 94,42 82,30" className="fill-muted stroke-border" />

      {/* trail off the map, lost */}
      <path d="M86,68 Q104,84 120,70" className="stroke-border" strokeDasharray="3 4" />
      <line x1="120" y1="62" x2="128" y2="70" className="stroke-muted-foreground" />
      <line x1="128" y1="62" x2="120" y2="70" className="stroke-muted-foreground" />

      {/* compass */}
      <circle cx="68" cy="58" r="20" className="fill-surface stroke-muted-foreground" />
      <line x1="68" y1="40" x2="68" y2="44" className="stroke-border" />
      <line x1="68" y1="72" x2="68" y2="76" className="stroke-border" />
      <line x1="50" y1="58" x2="54" y2="58" className="stroke-border" />
      <line x1="82" y1="58" x2="86" y2="58" className="stroke-border" />
      <polygon points="68,58 74,44 68,50" className="fill-muted-foreground" />
      {/* needle tip — the one brand accent */}
      <polygon points="68,58 62,72 68,66" className="fill-brand" />
      <circle cx="68" cy="58" r="2" className="fill-surface stroke-muted-foreground" />
    </svg>
  );
}

export { NotFoundIllustration };
