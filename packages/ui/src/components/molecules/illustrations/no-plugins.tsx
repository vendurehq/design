import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A module block with two pins hovering above a dashed socket of the same
 * footprint — an extension point with nothing plugged in. For an empty plugin list, or a
 * plugin catalog with nothing installed — pass as `illustration` to
 * `EmptyState`.
 *
 * Not for a search/filter miss in a populated catalog — pair that with
 * `NoResultsIllustration` instead.
 */
function NoPluginsIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* module block, hovering, with its two pins */}
      <rect x="67" y="50" width="6" height="10" rx="1" className="fill-muted-foreground" />
      <rect x="87" y="50" width="6" height="10" rx="1" className="fill-muted-foreground" />
      <rect
        x="54"
        y="18"
        width="52"
        height="34"
        rx="4"
        className="fill-surface stroke-muted-foreground"
      />
      <line x1="62" y1="28" x2="84" y2="28" className="stroke-border" />
      <line x1="62" y1="36" x2="76" y2="36" className="stroke-border" />

      {/* status light — the one brand accent */}
      <circle cx="96" cy="28" r="3" className="fill-brand" />

      {/* empty socket, same footprint, waiting below */}
      <rect
        x="54"
        y="76"
        width="52"
        height="20"
        rx="4"
        className="stroke-border"
        strokeDasharray="3 4"
      />
      <rect x="67" y="80" width="6" height="8" rx="1" className="stroke-border" />
      <rect x="87" y="80" width="6" height="8" rx="1" className="stroke-border" />
    </svg>
  );
}

export { NoPluginsIllustration };
