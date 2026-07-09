import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A single document with a folded corner and a seal, with dashed "ghost"
 * pages stacked behind it that never got filled in. For licenses, invoices,
 * or certificates that haven't been issued yet. Not for a generic empty list
 * (use `EmptyCollectionIllustration`) or a 404 (use `NotFoundIllustration`).
 */
function NoDocumentsIllustration({ className, size = 160 }: IllustrationProps) {
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
      <ellipse cx="80" cy="104" rx="27" ry="5" className="fill-muted" />

      {/* ghost pages, never issued */}
      <rect
        x="65"
        y="20"
        width="42"
        height="56"
        rx="2"
        className="stroke-border"
        strokeDasharray="2 5"
      />
      <rect
        x="62"
        y="23"
        width="42"
        height="56"
        rx="2"
        className="stroke-border"
        strokeDasharray="3 4"
      />

      {/* document, folded corner */}
      <rect
        x="59"
        y="26"
        width="42"
        height="56"
        rx="2"
        className="fill-surface stroke-muted-foreground"
      />
      <polygon points="101,26 101,36 91,26" className="fill-muted stroke-border" />

      {/* seal ribbon, hanging off the bottom edge */}
      <path d="M75,74 L75,96 L80,90 L85,96 L85,74 Z" className="fill-muted stroke-border" />

      {/* seal — the one brand accent */}
      <circle cx="80" cy="74" r="8" className="fill-surface stroke-muted-foreground" />
      <circle cx="80" cy="74" r="2.5" className="fill-brand" />
    </svg>
  );
}

export { NoDocumentsIllustration };
