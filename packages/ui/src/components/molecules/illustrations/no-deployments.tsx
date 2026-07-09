import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A grounded server box with a dashed arrow trailing upward into empty space
 * — nothing has shipped yet. For an environment that has never been deployed
 * or an empty deployment history, not a genuine product onboarding moment
 * (use `FirstRunIllustration`) or a failed deploy (use `ErrorIllustration`).
 */
function NoDeploymentsIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* server box */}
      <rect
        x="58"
        y="64"
        width="44"
        height="28"
        rx="4"
        className="fill-surface stroke-muted-foreground"
      />

      {/* rack lines */}
      <line x1="64" y1="74" x2="96" y2="74" className="stroke-border" />
      <line x1="64" y1="84" x2="96" y2="84" className="stroke-border" />

      {/* dashed trail, nothing deployed yet */}
      <path d="M80,64 Q78,46 80,30" className="stroke-border" strokeDasharray="3 4" />

      {/* arrowhead — the one brand accent */}
      <polygon points="80,20 74,30 86,30" className="fill-brand" />
    </svg>
  );
}

export { NoDeploymentsIllustration };
