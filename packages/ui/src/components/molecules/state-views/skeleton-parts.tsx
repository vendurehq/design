import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@vendure-io/ui/components/atoms/card';
import { Skeleton } from '@vendure-io/ui/components/atoms/skeleton';
import {
  ListRow,
  ListRowContent,
  ListRowLeading,
  ListRowMeta,
  ListRowTrailing,
} from '@vendure-io/ui/components/molecules/list-row';
import { cn } from '@vendure-io/ui/lib/utils';
import * as React from 'react';

// Skeleton parts: placeholders in the shape of a real component, at its height
// and spacing, so content fills in place when data arrives. Compose them inside
// a LoadingState: the LoadingState is the one live region that announces the
// wait, and every part is aria-hidden, so a screen reader hears "Loading…" once
// and never the parts one by one.
//
// Heights come from the same tokens as the real component, never from pixel
// font sizes: a text line is `1lh` of the text style it stands in for, so a
// change to a font size or line height moves the skeleton with the text. Where
// the real component can be reused as is (Card, ListRow), the part renders it.
// Where the real component carries semantics a placeholder must not have
// (PageHeader's <header> and <h1>, Field's role="group"), the part repeats its
// layout classes. The height play tests in `loading-state.stories.tsx` keep
// every part equal to its real component.

/**
 * One text line of placeholder: a box exactly one line box tall (`1lh` of the
 * inherited text style) with a bar centred in it. Size it with a text utility
 * (`text-xs`, `text-style-page-title`) and its width with `w-*`. The building
 * block of every other part; stack several for a paragraph.
 */
function SkeletonLine({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton-line"
      aria-hidden="true"
      className={cn('flex h-lh w-full items-center', className)}
      {...props}
    >
      <Skeleton className="h-[0.8lh] w-full" />
    </div>
  );
}

interface SkeletonListRowProps extends React.ComponentProps<'div'> {
  /** The leading media: a 16px icon, a default (32px) Avatar, or none. @default "icon" */
  leading?: 'icon' | 'avatar' | 'none';
  /** A second, muted line under the title (ListRowMeta). @default true */
  meta?: boolean;
  /** An action at the end of the row (a small button). @default true */
  action?: boolean;
}

/**
 * A ListRow placeholder: leading icon or avatar, a title line, an optional
 * meta line and an end action. Renders the real ListRow, so it is 48px tall
 * with one line and 60px with the meta line, like the row it stands in for.
 */
function SkeletonListRow({
  leading = 'icon',
  meta = true,
  action = true,
  className,
  ...props
}: SkeletonListRowProps) {
  return (
    <ListRow data-skeleton="list-row" aria-hidden="true" className={className} {...props}>
      {leading === 'none' ? null : (
        <ListRowLeading>
          <Skeleton
            className={leading === 'avatar' ? 'size-8 rounded-full' : 'size-4 rounded-sm'}
          />
        </ListRowLeading>
      )}
      <ListRowContent>
        <SkeletonLine className="w-2/5 max-w-60" />
        {meta ? (
          <ListRowMeta>
            <SkeletonLine className="w-1/4 max-w-40" />
          </ListRowMeta>
        ) : null}
      </ListRowContent>
      {action ? (
        <ListRowTrailing>
          <Skeleton className="h-7 w-16 rounded-xl" />
        </ListRowTrailing>
      ) : null}
    </ListRow>
  );
}

interface SkeletonCardProps extends Omit<React.ComponentProps<typeof Card>, 'variant'> {
  /** A description line under the title (CardDescription). @default false */
  description?: boolean;
  /** A small button in the header (CardAction). @default false */
  action?: boolean;
  /** Body text lines in CardContent. Ignored when children are given. @default 3 */
  lines?: number;
}

/**
 * A Card placeholder: title, optional description and header action, and body
 * lines. Renders the real Card parts, so the header and the body keep the
 * card's padding, gap and one-line header height. Pass children to replace the
 * body lines with another shape (SkeletonField, SkeletonFact, SkeletonLine).
 * Children are wrapped in a CardContent stack (gap-4), so they keep the card
 * padding: do not add your own CardContent. Children that render nothing
 * (`false`, `null`, `undefined`, `[]`) count as no children.
 */
function SkeletonCard({
  description = false,
  action = false,
  lines = 3,
  children,
  ...props
}: SkeletonCardProps) {
  const hasChildren = React.Children.toArray(children).length > 0;
  return (
    <Card data-skeleton="card" aria-hidden="true" {...props}>
      <CardHeader>
        <CardTitle>
          <SkeletonLine className="w-1/3 max-w-40" />
        </CardTitle>
        {description ? (
          <CardDescription>
            <SkeletonLine className="w-2/3 max-w-80" />
          </CardDescription>
        ) : null}
        {action ? (
          <CardAction>
            <Skeleton className="h-7 w-16 rounded-xl" />
          </CardAction>
        ) : null}
      </CardHeader>
      {hasChildren ? (
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      ) : lines > 0 ? (
        <CardContent>
          {Array.from({ length: lines }).map((_, i) => (
            <SkeletonLine
              key={i}
              className={i === lines - 1 && lines > 1 ? 'w-3/5' : undefined}
            />
          ))}
        </CardContent>
      ) : null}
    </Card>
  );
}

/**
 * A form row placeholder: the label above a 34px control, like a vertical
 * Field with an Input (12px label, snug line height, 6px gap).
 */
function SkeletonField({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-skeleton="field"
      aria-hidden="true"
      className={cn('flex w-full flex-col gap-1.5', className)}
      {...props}
    >
      <SkeletonLine className="w-24 text-xs leading-snug" />
      <Skeleton className="h-8.5 w-full rounded-lg" />
    </div>
  );
}

/**
 * A key-value fact placeholder: the label above the value, like a
 * DescriptionListItem in a vertical DescriptionList.
 */
function SkeletonFact({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-skeleton="fact"
      aria-hidden="true"
      className={cn('flex flex-col gap-0.5 text-sm', className)}
      {...props}
    >
      <SkeletonLine className="w-20" />
      <SkeletonLine className="w-32" />
    </div>
  );
}

interface SkeletonPageHeaderProps extends React.ComponentProps<'div'> {
  /** A description line under the title. @default true */
  description?: boolean;
  /** Number of default-size buttons on the end. @default 1 */
  actions?: number;
}

/**
 * A PageHeader placeholder: the page title, an optional description and the
 * actions on the end, with PageHeader's layout. The title line is one line of
 * the page-title text style.
 */
function SkeletonPageHeader({
  description = true,
  actions = 1,
  className,
  ...props
}: SkeletonPageHeaderProps) {
  return (
    <div
      data-skeleton="page-header"
      aria-hidden="true"
      className={cn('flex flex-wrap items-start justify-between gap-4', className)}
      {...props}
    >
      <div className="flex min-w-0 flex-col gap-1">
        <SkeletonLine className="text-style-page-title w-48 max-w-full" />
        {description ? <SkeletonLine className="w-80 max-w-full text-sm" /> : null}
      </div>
      {actions > 0 ? (
        <div className="flex shrink-0 items-center gap-2">
          {Array.from({ length: actions }).map((_, i) => (
            <Skeleton key={i} className="h-8.5 w-24 rounded-xl" />
          ))}
        </div>
      ) : null}
    </div>
  );
}

export {
  SkeletonCard,
  SkeletonFact,
  SkeletonField,
  SkeletonLine,
  SkeletonListRow,
  SkeletonPageHeader,
  type SkeletonCardProps,
  type SkeletonListRowProps,
  type SkeletonPageHeaderProps,
};
