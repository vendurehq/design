import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A price tag on a string with no price written on it, in front of a dashed
 * second tag. For an empty catalog: no products, variants, or collection
 * contents yet. Not for a search or filter that matched no products (use
 * `NoResultsIllustration`) or an empty promotions list (use
 * `NoPromotionsIllustration`).
 */
function NoProductsIllustration({ className, size = 160 }: IllustrationProps) {
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
      <ellipse cx="80" cy="104" rx="30" ry="5" className="fill-muted" />

      {/* second tag, not there yet */}
      <path
        d="M68,36 L118,36 Q122,36 122,40 L122,72 Q122,76 118,76 L68,76 L50,56 Z"
        className="stroke-border"
        strokeDasharray="3 4"
      />

      {/* string */}
      <path d="M53,68 C42,62 38,48 46,36" className="stroke-muted-foreground" />

      {/* tag */}
      <path
        d="M58,48 L108,48 Q112,48 112,52 L112,84 Q112,88 108,88 L58,88 L40,68 Z"
        className="fill-surface stroke-muted-foreground"
      />

      {/* price, not set */}
      <line x1="66" y1="62" x2="102" y2="62" className="stroke-border" strokeDasharray="3 4" />
      <line x1="66" y1="74" x2="90" y2="74" className="stroke-border" strokeDasharray="3 4" />

      {/* eyelet — the one brand accent */}
      <circle cx="53" cy="68" r="4" className="fill-brand" />
    </svg>
  );
}

export { NoProductsIllustration };
