import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';
import { DirectionLink, ExternalArrow } from './direction-link.tsx';

// Compound-only, by decision: there is no simple-props sugar and
// no dual-mode root. Callers assemble the parts, which keeps one way to build a
// header and lets variance in the wild (back links, badge rows beside the title,
// mono subtitles) live as free children rather than as an ever-growing prop set.

/**
 * The header row: title/description on the left, actions on the right. The row
 * wraps, so on a narrow screen the actions move below the title instead of
 * squeezing it.
 */
function PageHeader({ className, ...props }: React.ComponentProps<'header'>) {
  return (
    <header
      data-slot="page-header"
      className={cn('flex flex-wrap items-start justify-between gap-4', className)}
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
      className={cn('text-style-page-title break-words', className)}
      {...props}
    />
  );
}

function PageHeaderDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="page-header-description"
      className={cn('text-sm text-foreground-secondary', className)}
      {...props}
    />
  );
}

/** Right-hand action slot (buttons, menus). Moves below the title when the row has no room. */
function PageHeaderActions({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-actions"
      className={cn('flex shrink-0 items-center gap-2', className)}
      {...props}
    />
  );
}

/**
 * The facts under the title: branch, region, host, owner. 13px text in
 * `foreground-secondary`, 18px between facts and 6px between rows when they
 * wrap. Put it in PageHeaderContent, below the title.
 */
function PageHeaderFacts({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-facts"
      className={cn(
        'flex flex-wrap items-center gap-x-4.5 gap-y-1.5 text-style-body text-foreground-secondary',
        className,
      )}
      {...props}
    />
  );
}

/** One fact: an optional leading icon at 45% and its text, 7px apart. */
function PageHeaderFact({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="page-header-fact"
      className={cn(
        'inline-flex min-w-0 items-center gap-1.75 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:stroke-[1.75] [&>svg]:opacity-45',
        className,
      )}
      {...props}
    />
  );
}

// A fact that opens another site, such as the environment's hostname. At rest
// it reads like PageHeaderFact. On hover or keyboard focus its text goes from
// `foreground-secondary` to `foreground`, its leading icon from 45% to full
// strength in `brand-indicator`, and the trailing diagonal arrow brightens
// and moves 1.5px out (ExternalArrow, the arrow of ArrowLink `external`).
// No underline. Colour and opacity ease in `moderate` on `soft`. The class
// names stay literal so Tailwind can scan them.
const FACT_LINK_ICON =
  '[&>svg:not([data-slot=page-header-fact-arrow])]:[transition:color_var(--transition-duration-moderate)_var(--ease-soft),opacity_var(--transition-duration-moderate)_var(--ease-soft)] hover:[&>svg:not([data-slot=page-header-fact-arrow])]:text-brand-indicator hover:[&>svg:not([data-slot=page-header-fact-arrow])]:opacity-100 focus-visible:[&>svg:not([data-slot=page-header-fact-arrow])]:text-brand-indicator focus-visible:[&>svg:not([data-slot=page-header-fact-arrow])]:opacity-100';

/**
 * A fact that is a link to another site: the environment's hostname, a
 * repository. Put a leading icon and the text in it, as in PageHeaderFact;
 * it adds the trailing up-right arrow. Wrap a long value in a
 * `<span className="truncate">`. Renders an `<a>`; pass `render` for another
 * element. Set `target` and `rel` yourself when it opens a new tab.
 */
function PageHeaderFactLink({
  className,
  render,
  children,
  ...props
}: useRender.ComponentProps<'a'>) {
  return useRender({
    defaultTagName: 'a',
    render,
    props: mergeProps<'a'>(
      {
        className: cn(
          'group/arrow-link inline-flex min-w-0 cursor-pointer items-center gap-1.75 [&>svg]:shrink-0 [&>svg:not([data-slot=page-header-fact-arrow])]:size-4 [&>svg:not([data-slot=page-header-fact-arrow])]:stroke-[1.75] [&>svg:not([data-slot=page-header-fact-arrow])]:opacity-45',
          'transition-colors duration-moderate ease-soft hover:text-foreground focus-visible:text-foreground',
          FACT_LINK_ICON,
          'rounded-md outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
          className,
        ),
        children: (
          <>
            {children}
            <ExternalArrow data-slot="page-header-fact-arrow" />
          </>
        ),
      },
      props,
    ),
    state: { slot: 'page-header-fact-link' },
  });
}

/** Optional row rendered above the header: holds a PageHeaderBack. */
function PageHeaderBackRow({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="page-header-back-row"
      className={cn('flex items-center text-style-body text-muted-foreground', className)}
      {...props}
    />
  );
}

/**
 * The link up one level, above the title: "Deployments", "All profiles".
 * Renders an `<a>` with a leading chevron in `muted-foreground`; the look,
 * motion and right-to-left handling are ArrowLink's, pointing back. Pass
 * `render` to use a router link.
 */
function PageHeaderBack({ className, ...props }: useRender.ComponentProps<'a'>) {
  return (
    <DirectionLink
      direction="back"
      slot="page-header-back"
      iconSlot="page-header-back-chevron"
      className={cn('text-muted-foreground', className)}
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
  PageHeaderBackRow,
  PageHeaderBack,
  PageHeaderFacts,
  PageHeaderFact,
  PageHeaderFactLink,
};
