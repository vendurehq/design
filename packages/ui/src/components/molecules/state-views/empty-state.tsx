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
  /**
   * Leading icon element, rendered in the muted icon chip, or bare in a
   * `compact` state. Ignored once `illustration` renders (see below).
   */
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
  /**
   * Draw the dashed box. Defaults to `true`. Set `false` when the empty state
   * fills a region that already has a frame, such as a table body: the table
   * owns its perimeter.
   */
  bordered?: boolean;
  /**
   * `compact` drops the illustration and tightens the spacing, for a small
   * panel or side column where the full state is too tall. An explicit `icon`
   * renders bare (no chip) above a 14px title. Keep it to a title, a
   * description and at most one action. Defaults to `default`.
   */
  size?: 'default' | 'compact';
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
  bordered = true,
  size = 'default',
  className,
  ...props
}: EmptyStateProps) {
  const compact = size === 'compact';
  // Precedence: an explicit `illustration` (including `null`, to opt out)
  // always wins; otherwise an explicit `icon` keeps rendering exactly as
  // before. Only when neither is touched does the default illustration fill
  // the media slot, so existing icon-only consumers see no change.
  const resolvedIllustration = compact ? null : illustration !== undefined ? (
    illustration
  ) : icon === undefined ? (
    <EmptyCollectionIllustration />
  ) : null;

  return (
    <Empty
      data-slot="empty-state"
      data-size={size}
      className={cn(
        // Unbordered clears the atom's dashed style, so a border the consumer
        // adds through `className` is solid.
        bordered ? 'border' : 'rounded-none border-solid',
        compact && 'gap-3 p-6 py-10',
        className,
      )}
      {...props}
    >
      <EmptyHeader className={cn(compact && 'gap-1')}>
        {resolvedIllustration ? (
          <EmptyMedia>{resolvedIllustration}</EmptyMedia>
        ) : icon ? (
          <EmptyMedia variant={compact ? 'bare' : 'icon'}>{icon}</EmptyMedia>
        ) : null}
        <EmptyTitle className={cn(compact && 'text-style-card-title')}>{title}</EmptyTitle>
        {description ? (
          <EmptyDescription className={cn(compact && 'text-sm')}>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {children ? <EmptyContent className={cn(compact && 'gap-2')}>{children}</EmptyContent> : null}
    </Empty>
  );
}

export { EmptyState };
