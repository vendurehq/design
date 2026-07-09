import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A photo tile with a sun-over-mountains glyph, floated in front of one or
 * two dashed placeholder tiles. For an empty asset/media library or an
 * empty folder in an asset browser. Not for a generic empty list (use
 * `EmptyCollectionIllustration`) or a drag-to-upload target (use
 * `UploadDropzoneIllustration`).
 */
function EmptyMediaIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* empty slots, behind the tile in front */}
      <rect
        x="36"
        y="28"
        width="40"
        height="30"
        rx="3"
        className="stroke-border"
        strokeDasharray="3 4"
        transform="rotate(-6 56 43)"
      />
      <rect
        x="94"
        y="30"
        width="34"
        height="26"
        rx="3"
        className="stroke-border"
        strokeDasharray="3 4"
        transform="rotate(5 111 43)"
      />

      {/* photo tile */}
      <rect
        x="48"
        y="34"
        width="64"
        height="46"
        rx="3"
        className="fill-surface stroke-muted-foreground"
      />

      {/* sun — the one brand accent */}
      <circle cx="64" cy="48" r="4" className="fill-brand" />

      {/* mountains */}
      <path d="M52,74 L66,58 L76,68 L86,52 L104,74" className="stroke-muted-foreground" />
    </svg>
  );
}

export { EmptyMediaIllustration };
