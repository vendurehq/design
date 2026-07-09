import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * An open, hollow box with its flaps folded back and a dashed "what goes
 * here" outline floating above. The default for "nothing exists yet" —
 * first-run lists, collections, catalogs. Not for a filtered/searched miss
 * (use `NoResultsIllustration`).
 */
function EmptyCollectionIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* open flaps, behind the box front */}
      <polygon points="45,58 30,34 62,34 65,58" className="fill-muted stroke-muted-foreground" />
      <polygon points="115,58 130,34 98,34 95,58" className="fill-muted stroke-muted-foreground" />

      {/* hollow interior */}
      <ellipse
        cx="80"
        cy="64"
        rx="27"
        ry="5"
        className="fill-background stroke-border"
        strokeDasharray="3 3"
      />

      {/* box body */}
      <path
        d="M45,58 L115,58 L115,86 C115,88 113.5,89 112,89 L48,89 C46.5,89 45,88 45,86 Z"
        className="fill-surface stroke-muted-foreground"
      />

      {/* floating "what belongs here" outline */}
      <rect
        x="64"
        y="12"
        width="32"
        height="24"
        rx="3"
        className="stroke-border"
        strokeDasharray="3 4"
      />

      {/* sparkle — the one brand accent */}
      <polygon
        points="104,10 105.5,14.5 110,16 105.5,17.5 104,22 102.5,17.5 98,16 102.5,14.5"
        className="fill-brand"
      />
    </svg>
  );
}

export { EmptyCollectionIllustration };
