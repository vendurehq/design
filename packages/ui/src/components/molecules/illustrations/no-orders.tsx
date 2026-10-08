import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * An empty shopping cart parked on the ground, with a dashed parcel outline
 * above the basket where the first order would go. For order/checkout lists
 * with nothing in them yet. Not for a search or filter that matched no orders
 * (use `NoResultsIllustration`) or a generic empty list (use
 * `EmptyCollectionIllustration`).
 */
function NoOrdersIllustration({ className, size = 160 }: IllustrationProps) {
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
      <ellipse cx="84" cy="104" rx="32" ry="5" className="fill-muted" />

      {/* parcel outline, where the first order would go */}
      <rect
        x="76"
        y="20"
        width="30"
        height="20"
        rx="3"
        className="stroke-border"
        strokeDasharray="3 4"
      />

      {/* handle */}
      <path d="M52,48 L44,26 L36,26" className="stroke-muted-foreground" />

      {/* basket, empty */}
      <path d="M52,48 L128,48 L118,82 L62,82 Z" className="fill-surface stroke-muted-foreground" />
      <line x1="59" y1="60" x2="121" y2="60" className="stroke-border" strokeDasharray="3 3" />
      <line x1="62" y1="71" x2="118" y2="71" className="stroke-border" strokeDasharray="3 3" />

      {/* wheels */}
      <circle cx="70" cy="91" r="6" className="fill-surface stroke-muted-foreground" />
      <circle cx="110" cy="91" r="6" className="fill-surface stroke-muted-foreground" />

      {/* handle grip — the one brand accent */}
      <rect x="26" y="23" width="12" height="6" rx="3" className="fill-brand" />
    </svg>
  );
}

export { NoOrdersIllustration };
