import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@vendure-io/ui/components/atoms/empty';
import { cn } from '@vendure-io/ui/lib/utils';

// `title` is redefined as `ReactNode`, so drop the native string `title` attr.
export interface EmptyStateProps extends Omit<React.ComponentProps<typeof Empty>, 'title'> {
  /** Leading icon element, rendered in the muted icon chip. */
  icon?: React.ReactNode;
  /** The headline. */
  title: React.ReactNode;
  /** Optional supporting copy. */
  description?: React.ReactNode;
  /** Actions/CTA — rendered in the content slot below the header. */
  children?: React.ReactNode;
}

/**
 * The canonical "there's nothing here yet" panel. A thin wrapper over the
 * `Empty` atom's header/media/title/description/content stack that three
 * codebases (custom-ui, ops-admin, dashboard-common) kept re-assembling inline.
 *
 * The `Empty` atom ships `border-dashed` but no `border` width so it stays
 * shadcn-aligned; the molecule adds `border` to draw the dashed box every donor
 * implementation had (spike decision).
 */
function EmptyState({ icon, title, description, children, className, ...props }: EmptyStateProps) {
  return (
    <Empty data-slot="empty-state" className={cn('border', className)} {...props}>
      <EmptyHeader>
        {icon ? <EmptyMedia variant="icon">{icon}</EmptyMedia> : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {children ? <EmptyContent>{children}</EmptyContent> : null}
    </Empty>
  );
}

export { EmptyState };
