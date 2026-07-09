import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A closed padlock centered on a shield, roped off by a dashed barrier strung
 * between two posts. For permission/authorization failures — pass as
 * `illustration` to `ErrorState` alongside a "Go back" or "Request access"
 * action, not a retry. Not for generic load failures (use `ErrorIllustration`)
 * or missing resources (use `NotFoundIllustration`).
 */
function AccessDeniedIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* barrier posts + dashed rope, blocking the way forward */}
      <line x1="44" y1="80" x2="44" y2="98" className="stroke-muted-foreground" />
      <line x1="116" y1="80" x2="116" y2="98" className="stroke-muted-foreground" />
      <path d="M44,82 Q80,96 116,82" className="stroke-border" strokeDasharray="3 4" />

      {/* shield */}
      <path
        d="M80,24 L102,32 L102,56 C102,74 92,86 80,92 C68,86 58,74 58,56 L58,32 Z"
        className="fill-surface stroke-muted-foreground"
      />

      {/* padlock: solid shackle + body */}
      <path d="M74,56 v-7 a6,6 0 0,1 12,0 v7" className="stroke-muted-foreground" />
      <rect
        x="70"
        y="56"
        width="20"
        height="17"
        rx="3"
        className="fill-surface stroke-muted-foreground"
      />

      {/* keyhole — the one brand accent */}
      <circle cx="80" cy="63" r="2" className="fill-brand" />
    </svg>
  );
}

export { AccessDeniedIllustration };
