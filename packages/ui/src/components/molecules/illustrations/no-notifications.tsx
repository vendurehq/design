import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A bell at rest, its clapper still, with faint dashed arcs trailing off
 * where a ring would sound — nothing new has come in. For an empty
 * notifications/alerts panel where the user is caught up — pass as
 * `illustration` to `EmptyState`. Not for a generic empty list with no bell
 * shape (use `EmptyCollectionIllustration` instead).
 */
function NoNotificationsIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* faint arcs where a ring would sound — dashed, trailing off */}
      <path d="M48,44 Q40,52 48,60" className="stroke-border" strokeDasharray="2 5" />
      <path d="M112,44 Q120,52 112,60" className="stroke-border" strokeDasharray="2 5" />

      {/* hanging loop */}
      <circle cx="80" cy="29" r="3" className="fill-surface stroke-muted-foreground" />

      {/* bell body, dome flaring to a flat skirt */}
      <path
        d="M62,68 C62,48 70,34 80,34 C90,34 98,48 98,68 C101,68 103,70 103,71 L57,71 C57,70 59,68 62,68 Z"
        className="fill-surface stroke-muted-foreground"
      />

      {/* clapper, still and centered — nothing ringing it */}
      <circle cx="80" cy="72" r="2.5" className="fill-muted-foreground" />

      {/* check mark — the one brand accent, caught up */}
      <path
        d="M95,78 L92.6,75.6 L91.9,76.4 L95,79.5 L101.6,72.9 L100.8,72.1 Z"
        className="fill-brand"
      />
    </svg>
  );
}

export { NoNotificationsIllustration };
