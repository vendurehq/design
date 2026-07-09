import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A single key resting on the ground, its bow-hole the only spark of color,
 * beneath a dashed keyring loop with nothing hung on it yet. For empty states
 * before any API key, access token, or registry token has been created —
 * pair with `EmptyState`. Not for a permission/authorization failure (use
 * `AccessDeniedIllustration`).
 */
function NoKeysIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* keyring, empty — nothing hung on it yet */}
      <circle cx="80" cy="40" r="18" className="stroke-border" strokeDasharray="3 4" />
      <path d="M80,58 L80,72" className="stroke-border" strokeDasharray="2 4" />

      {/* key, resting: bow + shaft + teeth */}
      <circle cx="56" cy="88" r="13" className="fill-surface stroke-muted-foreground" />
      <rect
        x="67"
        y="84"
        width="50"
        height="8"
        rx="1"
        className="fill-surface stroke-muted-foreground"
      />
      <rect x="102" y="92" width="5" height="6" className="fill-surface stroke-muted-foreground" />
      <rect x="111" y="92" width="5" height="10" className="fill-surface stroke-muted-foreground" />

      {/* bow hole — the one brand accent */}
      <circle cx="56" cy="88" r="4" className="fill-brand" />
    </svg>
  );
}

export { NoKeysIllustration };
