import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A vertical timeline rail with hollow nodes and dashed ghost rows beside
 * them — the rail exists but no entries have landed on it yet.
 * For audit logs / history / timeline views with nothing recorded — pass as
 * `illustration` to `EmptyState`. For a generic empty list with no timeline
 * shape, use `EmptyCollectionIllustration` instead.
 */
function NoActivityIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* the timeline rail itself — present, just nothing on it */}
      <line x1="50" y1="24" x2="50" y2="90" className="stroke-muted-foreground" />

      {/* nodes, hollow — no entries recorded at any of them */}
      <circle cx="50" cy="30" r="6" className="fill-surface stroke-muted-foreground" />
      <circle cx="50" cy="57" r="6" className="fill-surface stroke-muted-foreground" />
      <circle cx="50" cy="84" r="6" className="fill-surface stroke-muted-foreground" />

      {/* newest node — the one brand accent */}
      <circle cx="50" cy="30" r="2.5" className="fill-brand" />

      {/* ghost rows beside each node, waiting for content */}
      <rect
        x="64"
        y="25"
        width="50"
        height="10"
        rx="5"
        className="stroke-border"
        strokeDasharray="3 4"
      />
      <rect
        x="64"
        y="52"
        width="38"
        height="10"
        rx="5"
        className="stroke-border"
        strokeDasharray="3 4"
      />
      <rect
        x="64"
        y="79"
        width="44"
        height="10"
        rx="5"
        className="stroke-border"
        strokeDasharray="3 4"
      />
    </svg>
  );
}

export { NoActivityIllustration };
