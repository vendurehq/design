import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A vertical timeline rail with dashed, hollow nodes and faint dashed row
 * lines beside them — the rail exists but no entries have landed on it yet.
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
      <line x1="50" y1="26" x2="50" y2="88" className="stroke-muted-foreground" />

      {/* nodes, hollow — no entries recorded at any of them */}
      <circle cx="50" cy="32" r="5" className="stroke-muted-foreground" strokeDasharray="3 4" />
      <circle cx="50" cy="58" r="5" className="stroke-muted-foreground" strokeDasharray="3 4" />
      <circle cx="50" cy="84" r="5" className="stroke-muted-foreground" strokeDasharray="3 4" />

      {/* newest node — the one brand accent */}
      <circle cx="50" cy="32" r="2" className="fill-brand" />

      {/* faint row placeholders beside each node, waiting for content */}
      <line x1="64" y1="29" x2="106" y2="29" className="stroke-border" strokeDasharray="2 5" />
      <line x1="64" y1="36" x2="90" y2="36" className="stroke-border" strokeDasharray="2 5" />
      <line x1="64" y1="55" x2="114" y2="55" className="stroke-border" strokeDasharray="2 5" />
      <line x1="64" y1="62" x2="96" y2="62" className="stroke-border" strokeDasharray="2 5" />
      <line x1="64" y1="81" x2="102" y2="81" className="stroke-border" strokeDasharray="2 5" />
      <line x1="64" y1="88" x2="84" y2="88" className="stroke-border" strokeDasharray="2 5" />
    </svg>
  );
}

export { NoActivityIllustration };
