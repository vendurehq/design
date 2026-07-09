import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * Two solid avatar chips (head + shoulders) beside one dashed, empty avatar
 * slot topped with a "+" badge — an open seat waiting to be filled. For a
 * team/members list that's empty or awaiting invites — pass as `illustration`
 * to `EmptyState` alongside an "Invite a teammate" action. Not for a
 * customer/people search that came up empty (use `NoResultsIllustration`).
 */
function NoMembersIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* two team members, already seated */}
      <circle cx="42" cy="46" r="9" className="fill-surface stroke-muted-foreground" />
      <path
        d="M29,82 L29,67 A13,13 0 0,1 55,67 L55,82 Z"
        className="fill-surface stroke-muted-foreground"
      />
      <circle cx="74" cy="46" r="9" className="fill-surface stroke-muted-foreground" />
      <path
        d="M61,82 L61,67 A13,13 0 0,1 87,67 L87,82 Z"
        className="fill-surface stroke-muted-foreground"
      />

      {/* open seat, dashed and empty */}
      <circle cx="112" cy="46" r="9" className="stroke-muted-foreground" strokeDasharray="3 4" />
      <path
        d="M99,82 L99,67 A13,13 0 0,1 125,67 L125,82 Z"
        className="stroke-muted-foreground"
        strokeDasharray="3 4"
      />

      {/* invite badge — the one brand accent */}
      <polygon
        points="122,32 126,32 126,36 130,36 130,40 126,40 126,44 122,44 122,40 118,40 118,36 122,36"
        className="fill-brand"
      />
    </svg>
  );
}

export { NoMembersIllustration };
