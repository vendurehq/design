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
   * Leading icon element, drawn bare: 28px, a light stroke and 40% opacity.
   * Ignored once `illustration` renders (see below).
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
   * Draw a dashed box around the state. Defaults to `false`: the state sits
   * bare in its region. Set `true` for a drop zone or a slot that needs a
   * visible outline.
   */
  bordered?: boolean;
  /**
   * `compact` drops the illustration and tightens the spacing. Use it with an
   * `icon` inside a card, a secondary panel or a side column: the icon sits
   * above a 14px title. Keep the `default` size with an illustration for a
   * whole page or a whole list. Keep compact to a title, a description and at
   * most one action. Defaults to `default`.
   */
  size?: 'default' | 'compact';
}

/**
 * The canonical "there's nothing here yet" panel. A thin wrapper over the
 * `Empty` atom's header/media/title/description/content stack that three
 * codebases (custom-ui, ops-admin, dashboard-common) kept re-assembling inline.
 *
 * The v3 look has no box: a bare icon, a 16px title and the copy. The `Empty`
 * atom ships `border-dashed` but no `border` width, so the molecule adds
 * `border` only when `bordered` asks for the dashed box.
 */
function EmptyState({
  icon,
  illustration,
  title,
  description,
  children,
  bordered = false,
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
          // 20px from the icon to the title in the default size.
          <EmptyMedia variant="bare" className={cn(!compact && 'mb-3')}>
            {icon}
          </EmptyMedia>
        ) : null}
        <EmptyTitle className={cn(compact && 'text-style-card-title leading-5.25')}>{title}</EmptyTitle>
        {description ? (
          <EmptyDescription className={cn(compact && 'text-sm')}>{description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
      {children ? <EmptyContent className={cn(compact && 'gap-2')}>{children}</EmptyContent> : null}
    </Empty>
  );
}

export { EmptyState };
