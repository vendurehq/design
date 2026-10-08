import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * An open folder with a dashed sheet inside where the first project would go,
 * and a label on its front. For a list of projects that is empty: a customer
 * with no projects provisioned, or an account whose projects are all
 * archived. Not for the account's first-run "Create your first project"
 * moment (use `FirstRunIllustration`) or a search that matched no projects
 * (use `NoResultsIllustration`).
 */
function NoProjectsIllustration({ className, size = 160 }: IllustrationProps) {
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
      <ellipse cx="82" cy="104" rx="34" ry="5" className="fill-muted" />

      {/* back panel with tab */}
      <path
        d="M44,28 L62,28 L68,36 L116,36 C117.1,36 118,36.9 118,38 L118,88 C118,89.1 117.1,90 116,90 L44,90 C42.9,90 42,89.1 42,88 L42,30 C42,28.9 42.9,28 44,28 Z"
        className="fill-muted stroke-muted-foreground"
      />

      {/* sheet, not there yet */}
      <rect
        x="64"
        y="22"
        width="44"
        height="40"
        rx="2"
        className="fill-background stroke-border"
        strokeDasharray="3 4"
      />

      {/* front flap, tilted open */}
      <path d="M48,56 L124,56 L118,90 L42,90 Z" className="fill-surface stroke-muted-foreground" />

      {/* label — the one brand accent */}
      <rect x="70" y="68" width="24" height="7" rx="3.5" className="fill-brand" />
    </svg>
  );
}

export { NoProjectsIllustration };
