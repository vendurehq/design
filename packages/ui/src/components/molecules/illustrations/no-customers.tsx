import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A shop front with an awning and an open door, and a dashed shopper outline
 * where the first customer would stand. For a customer list or customer group
 * with nobody in it yet. Not for a team or member list (use
 * `NoMembersIllustration`) or a customer search that matched nobody (use
 * `NoResultsIllustration`).
 */
function NoCustomersIllustration({ className, size = 160 }: IllustrationProps) {
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
      <ellipse cx="80" cy="104" rx="36" ry="5" className="fill-muted" />

      {/* shop */}
      <rect
        x="36"
        y="50"
        width="60"
        height="42"
        rx="2"
        className="fill-surface stroke-muted-foreground"
      />
      <rect x="44" y="60" width="20" height="14" rx="1" className="stroke-border" />
      <rect
        x="72"
        y="62"
        width="16"
        height="30"
        className="fill-background stroke-muted-foreground"
      />

      {/* awning */}
      <polygon points="36,36 96,36 100,50 32,50" className="fill-muted stroke-muted-foreground" />
      <path
        d="M32,50 a5.667,4 0 0,0 11.333,0 a5.667,4 0 0,0 11.333,0 a5.667,4 0 0,0 11.333,0 a5.667,4 0 0,0 11.333,0 a5.667,4 0 0,0 11.333,0 a5.667,4 0 0,0 11.333,0"
        className="fill-muted stroke-muted-foreground"
      />

      {/* open sign — the one brand accent */}
      <rect x="74" y="67" width="12" height="6" rx="1.5" className="fill-brand" />

      {/* first customer, not here yet */}
      <circle cx="118" cy="60" r="7" className="stroke-muted-foreground" strokeDasharray="3 4" />
      <path
        d="M107,92 L107,78 A11,11 0 0,1 129,78 L129,92 Z"
        className="stroke-muted-foreground"
        strokeDasharray="3 4"
      />
    </svg>
  );
}

export { NoCustomersIllustration };
