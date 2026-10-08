import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A round seal with a solid check and short rays around it. For a finished
 * task or a queue with nothing left to do: a sign-in handed back to the
 * terminal, a plan that is now active, a review queue that is empty. Not for
 * a notifications panel with nothing new (use `NoNotificationsIllustration`)
 * or a first-run prompt (use `FirstRunIllustration`).
 */
function SuccessIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* rays */}
      <line x1="80" y1="27" x2="80" y2="21" className="stroke-border" />
      <line x1="101.9" y1="36.1" x2="106.2" y2="31.8" className="stroke-border" />
      <line x1="58.1" y1="36.1" x2="53.8" y2="31.8" className="stroke-border" />
      <line x1="111" y1="58" x2="117" y2="58" className="stroke-border" />
      <line x1="49" y1="58" x2="43" y2="58" className="stroke-border" />

      {/* seal */}
      <circle cx="80" cy="58" r="26" className="fill-surface stroke-muted-foreground" />

      {/* check — the one brand accent */}
      <polygon points="65,57.5 69.5,53 77,60.5 91,46.5 95.5,51 77,69.5" className="fill-brand" />
    </svg>
  );
}

export { SuccessIllustration };
