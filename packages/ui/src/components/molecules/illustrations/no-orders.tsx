import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * An empty cart standing still, with faded motion dashes behind it where
 * incoming orders would trail in. For order/checkout lists with nothing in
 * them yet.
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
      <ellipse cx="78" cy="104" rx="30" ry="5" className="fill-muted" />

      {/* stillness dashes, nothing rolling in */}
      <line x1="10" y1="56" x2="22" y2="56" className="stroke-border" strokeDasharray="2 4" />
      <line x1="6" y1="66" x2="20" y2="66" className="stroke-border" strokeDasharray="2 4" />
      <line x1="10" y1="76" x2="22" y2="76" className="stroke-border" strokeDasharray="2 4" />

      {/* handle */}
      <path d="M42,50 L32,26 L44,26" className="stroke-muted-foreground" />

      {/* basket */}
      <path d="M40,50 L120,50 L108,86 L54,86 Z" className="fill-surface stroke-muted-foreground" />
      <line x1="52" y1="62" x2="106" y2="62" className="stroke-border" strokeDasharray="3 3" />
      <line x1="55" y1="74" x2="103" y2="74" className="stroke-border" strokeDasharray="3 3" />

      {/* wheels */}
      <circle cx="60" cy="94" r="6" className="fill-surface stroke-muted-foreground" />
      <circle cx="100" cy="94" r="6" className="fill-surface stroke-muted-foreground" />

      {/* waiting indicator — the one brand accent */}
      <circle cx="112" cy="42" r="5" className="fill-brand" />
    </svg>
  );
}

export { NoOrdersIllustration };
