import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A coupon with notched sides and a percent sign, its tear-off stub marked
 * with a star. For a promotions, discounts, or coupon codes list with nothing
 * set up yet. Not for an empty product catalog (use `NoProductsIllustration`)
 * or a search that matched no promotions (use `NoResultsIllustration`).
 */
function NoPromotionsIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* coupon */}
      <path
        d="M40,38 L120,38 Q124,38 124,42 L124,54 A6,6 0 0,0 124,66 L124,78 Q124,82 120,82 L40,82 Q36,82 36,78 L36,66 A6,6 0 0,0 36,54 L36,42 Q36,38 40,38 Z"
        className="fill-surface stroke-muted-foreground"
      />

      {/* perforation */}
      <line x1="96" y1="42" x2="96" y2="78" className="stroke-border" strokeDasharray="2 4" />

      {/* percent sign */}
      <circle cx="56" cy="52" r="4" className="stroke-muted-foreground" />
      <circle cx="76" cy="68" r="4" className="stroke-muted-foreground" />
      <line x1="76" y1="48" x2="56" y2="72" className="stroke-muted-foreground" />

      {/* star on the stub — the one brand accent */}
      <polygon
        points="110,53 111.7,57.65 116.66,57.84 112.76,60.9 114.11,65.66 110,62.9 105.89,65.66 107.24,60.9 103.34,57.84 108.3,57.65"
        className="fill-brand"
      />
    </svg>
  );
}

export { NoPromotionsIllustration };
