import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A dashed-outline tray with a file card rising into it on an upward arrow.
 * For a drag-and-drop upload target with nothing dropped yet ("drop files
 * here to upload") — pass as `illustration` to `EmptyState`. Not for an
 * already-existing media library that just happens to be empty (use
 * `EmptyMediaIllustration`).
 */
function UploadDropzoneIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* tray — the drop target, empty */}
      <rect
        x="32"
        y="14"
        width="96"
        height="46"
        rx="10"
        className="stroke-border"
        strokeDasharray="3 4"
      />

      {/* file card, folded corner, about to be dropped */}
      <rect
        x="66"
        y="72"
        width="28"
        height="20"
        rx="2"
        className="fill-surface stroke-muted-foreground"
      />
      <polygon points="94,72 94,78 88,72" className="fill-muted stroke-border" />
      <line x1="71" y1="83" x2="85" y2="83" className="stroke-border" />
      <line x1="71" y1="88" x2="79" y2="88" className="stroke-border" />

      {/* rising into the tray */}
      <line x1="80" y1="70" x2="80" y2="40" className="stroke-muted-foreground" />
      {/* arrowhead — the one brand accent */}
      <polygon points="80,28 70,44 90,44" className="fill-brand" />
    </svg>
  );
}

export { UploadDropzoneIllustration };
