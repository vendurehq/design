import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@vendure-io/ui/components/atoms/empty';
import { EmptyCollectionIllustration } from '@vendure-io/ui/components/molecules/illustrations/empty-collection';
import { cn } from '@vendure-io/ui/lib/utils';

// `title` is redefined as `ReactNode`, so drop the native string `title` attr.
export interface EmptyStateProps extends Omit<React.ComponentProps<typeof Empty>, 'title'> {
  /** Leading icon element, rendered in the muted icon chip. Ignored once `illustration` renders (see below). */
  icon?: React.ReactNode;
  /**
   * Illustration rendered above the title, in place of `icon`. Defaults to
   * `EmptyCollectionIllustration`. Pass a different illustration to match the
   * scenario, or `illustration={null}` to fall back to `icon` (or nothing).
   */
  illustration?: React.ReactNode | null;
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
function EmptyState({
  icon,
  illustration,
  title,
  description,
  children,
  className,
  ...props
}: EmptyStateProps) {
  // Precedence: an explicit `illustration` (including `null`, to opt out)
  // always wins; otherwise an explicit `icon` keeps rendering exactly as
  // before. Only when neither is touched does the default illustration fill
  // the media slot, so existing icon-only consumers see no change.
  const resolvedIllustration =
    illustration !== undefined ? (
      illustration
    ) : icon === undefined ? (
      <EmptyCollectionIllustration />
    ) : null;

  return (
    <Empty data-slot="empty-state" className={cn('border', className)} {...props}>
      <EmptyHeader>
        {resolvedIllustration ? (
          <EmptyMedia>{resolvedIllustration}</EmptyMedia>
        ) : icon ? (
          <EmptyMedia variant="icon">{icon}</EmptyMedia>
        ) : null}
        <EmptyTitle>{title}</EmptyTitle>
        {description ? <EmptyDescription>{description}</EmptyDescription> : null}
      </EmptyHeader>
      {children ? <EmptyContent>{children}</EmptyContent> : null}
    </Empty>
  );
}

export { EmptyState };
