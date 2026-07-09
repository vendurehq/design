import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A magnifying glass turning up nothing: dashed ghost rows behind the lens
 * instead of results. For a search/filter that matched zero rows — pair with
 * `EmptyState`. Not for "nothing exists yet" (use `EmptyCollectionIllustration`).
 */
function NoResultsIllustration({ className, size = 160 }: IllustrationProps) {
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
      <ellipse cx="80" cy="104" rx="32" ry="5" className="fill-muted" />

      {/* ghost result rows, unmatched */}
      <rect
        x="30"
        y="40"
        width="56"
        height="10"
        rx="5"
        className="stroke-border"
        strokeDasharray="3 4"
      />
      <rect
        x="30"
        y="56"
        width="44"
        height="10"
        rx="5"
        className="stroke-border"
        strokeDasharray="3 4"
      />
      <rect
        x="30"
        y="72"
        width="50"
        height="10"
        rx="5"
        className="stroke-border"
        strokeDasharray="3 4"
      />

      {/* lens */}
      <circle cx="100" cy="48" r="22" className="fill-surface stroke-muted-foreground" />
      <line x1="116" y1="64" x2="134" y2="82" className="stroke-muted-foreground" />
      <line x1="93" y1="41" x2="107" y2="55" className="stroke-border" />
      <line x1="107" y1="41" x2="93" y2="55" className="stroke-border" />

      {/* sparkle — the one brand accent */}
      <polygon
        points="128,20 129.5,24.5 134,26 129.5,27.5 128,32 126.5,27.5 122,26 126.5,24.5"
        className="fill-brand"
      />
    </svg>
  );
}

export { NoResultsIllustration };
