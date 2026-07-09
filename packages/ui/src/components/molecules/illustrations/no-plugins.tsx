import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A module block hovering above a dashed socket outline shaped just like it —
 * an extension point with nothing plugged in. For an empty plugin list, or a
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

      {/* module block, hovering */}
      <rect
        x="62"
        y="20"
        width="36"
        height="28"
        rx="4"
        className="fill-surface stroke-muted-foreground"
      />
      <rect
        x="74"
        y="46"
        width="12"
        height="12"
        rx="2"
        className="fill-surface stroke-muted-foreground"
      />
      {/* connector pin — the one brand accent */}
      <circle cx="80" cy="52" r="2.5" className="fill-brand" />

      {/* empty socket, same shape, waiting below */}
      <rect
        x="74"
        y="70"
        width="12"
        height="12"
        rx="2"
        className="stroke-border"
        strokeDasharray="2 4"
      />
      <rect
        x="62"
        y="80"
        width="36"
        height="16"
        rx="4"
        className="stroke-border"
        strokeDasharray="3 4"
      />
    </svg>
  );
}

export { NoPluginsIllustration };
