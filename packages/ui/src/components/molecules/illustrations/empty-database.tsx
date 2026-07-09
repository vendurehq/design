import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A database cylinder with a solid rim but dashed walls and dividing bands —
 * a shell with nothing provisioned inside. For no database provisioned yet,
 * or no backups exist. Not for a generic empty list (use
 * `EmptyCollectionIllustration`).
 */
function EmptyDatabaseIllustration({ className, size = 160 }: IllustrationProps) {
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

      {/* rim — the only solid, present surface */}
      <ellipse cx="80" cy="34" rx="24" ry="8" className="fill-surface stroke-muted-foreground" />

      {/* walls, empty */}
      <line x1="56" y1="34" x2="56" y2="82" className="stroke-border" strokeDasharray="3 4" />
      <line x1="104" y1="34" x2="104" y2="82" className="stroke-border" strokeDasharray="3 4" />

      {/* dividing bands, nothing stacked between them */}
      <path d="M56,50 A24,8 0 0,0 104,50" className="stroke-border" strokeDasharray="3 4" />
      <path d="M56,66 A24,8 0 0,0 104,66" className="stroke-border" strokeDasharray="3 4" />
      <path d="M56,82 A24,8 0 0,0 104,82" className="stroke-border" strokeDasharray="3 4" />

      {/* status dot — the one brand accent */}
      <circle cx="100" cy="28" r="4" className="fill-brand" />
    </svg>
  );
}

export { EmptyDatabaseIllustration };
