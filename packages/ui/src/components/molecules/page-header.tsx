import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';

// Compound-only, by decision (spike OSS-604): there is no simple-props sugar and
// no dual-mode root. Callers assemble the parts, which keeps one way to build a
// header and lets variance in the wild (back links, badge rows beside the title,
// mono subtitles) live as free children rather than as an ever-growing prop set.

/** The header row: title/description on the left, actions on the right. */
function PageHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return (
    <header
      data-slot="page-header"
      className={cn('flex items-start justify-between gap-4', className)}
      {...props}
    />
  );
}

/** Left column holding the title, description, and any inline badges. */
function PageHeaderContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-content"
      className={cn('flex min-w-0 flex-col gap-1', className)}
      {...props}
    />
  );
}

function PageHeaderTitle({ className, ...props }: React.ComponentProps<'h1'>) {
  return (
    <h1
      data-slot="page-header-title"
      className={cn('font-heading break-words text-2xl font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

function PageHeaderDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="page-header-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

/** Right-hand action slot (buttons, menus). Stays put as the title wraps. */
function PageHeaderActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn('flex shrink-0 items-center gap-2', className)}
      {...props}
    />
  );
}

/** Optional row rendered above the header — typically a back link. */
function PageHeaderBackLink({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-back-link"
      className={cn('flex items-center gap-1 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  PageHeader,
  PageHeaderContent,
  PageHeaderTitle,
  PageHeaderDescription,
  PageHeaderActions,
  PageHeaderBackLink,
};
