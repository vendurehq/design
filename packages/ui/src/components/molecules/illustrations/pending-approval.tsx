import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * An hourglass mid-turn, sand piled solid at top and settling as a dashed
 * pile below. For an invitation pending, an account awaiting setup or
 * provisioning, or access awaiting approval. Not for a hard permission
 * denial (use `AccessDeniedIllustration`) or a loading spinner state.
 */
function PendingApprovalIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* frame */}
      <line x1="62" y1="26" x2="98" y2="26" className="stroke-muted-foreground" />
      <line x1="62" y1="90" x2="98" y2="90" className="stroke-muted-foreground" />

      {/* glass body, pinched at the waist */}
      <path
        d="M66,26 L66,42 Q66,58 80,58 Q94,58 94,42 L94,26 Z"
        className="fill-surface stroke-muted-foreground"
      />
      <path
        d="M66,90 L66,74 Q66,58 80,58 Q94,58 94,74 L94,90 Z"
        className="fill-surface stroke-muted-foreground"
      />

      {/* settled sand, still piling — awaiting completion */}
      <path
        d="M71,84 Q80,72 89,84 Q80,88 71,84 Z"
        className="fill-muted stroke-muted-foreground"
        strokeDasharray="2 5"
      />

      {/* remaining sand up top, already solid */}
      <path d="M70,30 L90,30 L82,44 L78,44 Z" className="fill-muted" />

      {/* falling stream, the one brand accent */}
      <circle cx="80" cy="61" r="2" className="fill-brand" />
    </svg>
  );
}

export { PendingApprovalIllustration };
