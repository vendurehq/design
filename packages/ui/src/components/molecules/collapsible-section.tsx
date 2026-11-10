'use client';

import { Card, CardCount, type CardCountTone } from '@vendure-io/ui/components/atoms/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@vendure-io/ui/components/atoms/collapsible';
import { cn } from '@vendure-io/ui/lib/utils';
import { ChevronDown } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

// The count says how many rows the section holds, open and closed. It is a
// CardCount, the same count as beside a card title. `detail` adds a short
// fact after it ("2 · 1 failed"). The tone goes to the CardCount of the
// detail when there is one, and to the whole count otherwise: the number stays
// muted beside a toned fact, and the section itself stays neutral (accent
// rationing).

type CollapsibleSectionProps = Omit<
  ComponentProps<typeof Collapsible>,
  'title' | 'render' | 'className' | 'children'
> & {
  /** The section title. Also the name of the toggle button. */
  title: ReactNode;
  /** How many rows the section holds, beside the title. */
  count?: number | string;
  /** A short fact after the count, such as "1 failed". Renders as "{count} · {detail}". */
  detail?: string;
  /**
   * Colours the detail, or the whole count when there is no detail. `warning`:
   * rows wait on the user. `critical`: rows have failed. Default `neutral`.
   */
  tone?: CardCountTone;
  /** Heading level of the title in the page outline. Default `2`. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
  /** The rows. Usually ListRow elements. */
  children?: ReactNode;
};

/**
 * A card-surface section whose header opens and closes its rows. The header
 * is one full-width button, filled on hover like a row: title, count, and a
 * down chevron that turns over when open. A disabled section shows no hover.
 */
function CollapsibleSection({
  title,
  count,
  detail,
  tone = 'neutral',
  headingLevel = 2,
  className,
  children,
  ...props
}: CollapsibleSectionProps) {
  const Heading = `h${headingLevel}` as const;

  return (
    <Collapsible
      data-slot="collapsible-section"
      render={<Card />}
      className={cn('gap-0 py-0', className)}
      {...props}
    >
      <Heading data-slot="collapsible-section-heading" className="m-0">
        <CollapsibleTrigger
          data-slot="collapsible-section-trigger"
          className="group/collapsible-section-trigger flex min-h-12 w-full cursor-pointer items-center gap-2 ps-4.5 pe-4 text-left outline-none transition-colors duration-fast ease-default not-data-disabled:hover:bg-muted data-disabled:cursor-default focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          {/* The title is quieter than the rows it labels. */}
          <span
            data-slot="collapsible-section-title"
            className="min-w-0 text-sm font-semibold text-foreground-secondary"
          >
            {title}
          </span>
          {count != null ? (
            <CardCount
              data-slot="collapsible-section-count"
              tone={detail ? 'neutral' : tone}
              className="ms-0 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap"
            >
              {count}
              {detail ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="sr-only">, </span>
                  <CardCount
                    data-slot="collapsible-section-count-detail"
                    tone={tone}
                    className="ms-0"
                  >
                    {detail}
                  </CardCount>
                </>
              ) : null}
            </CardCount>
          ) : null}
          {/* The chevron turns on the panel's height timing, so both settle
              together; its colour and opacity follow the hover on the fill's
              timing. A disabled header shows no hover. */}
          <ChevronDown
            aria-hidden="true"
            strokeWidth={1.75}
            className="ml-auto size-3.75 shrink-0 text-muted-foreground opacity-70 [transition:rotate_var(--transition-duration-slow)_var(--ease-height),color_var(--transition-duration-fast)_var(--ease-default),opacity_var(--transition-duration-fast)_var(--ease-default)] group-[:hover:not([data-disabled])]/collapsible-section-trigger:text-foreground group-[:hover:not([data-disabled])]/collapsible-section-trigger:opacity-100 group-data-panel-open/collapsible-section-trigger:rotate-180 motion-reduce:[transition:color_var(--transition-duration-fast)_var(--ease-default),opacity_var(--transition-duration-fast)_var(--ease-default)]"
          />
        </CollapsibleTrigger>
      </Heading>
      {/* Height runs on the height curve; under reduced motion it snaps and
          only the rows fade. */}
      <CollapsibleContent
        data-slot="collapsible-section-panel"
        className="group/collapsible-section-panel h-(--collapsible-panel-height) overflow-hidden border-t border-border data-ending-style:h-0 data-starting-style:h-0 motion-safe:transition-[height] motion-safe:duration-slow motion-safe:ease-height"
      >
        {/* Opening, the rows fade in over the second half of the height;
            closing, they leave at once so the height settles on nothing. */}
        <div
          data-slot="collapsible-section-rows"
          className="transition-opacity delay-(--transition-duration-moderate) duration-moderate ease-out group-data-ending-style/collapsible-section-panel:opacity-0 group-data-ending-style/collapsible-section-panel:delay-0 group-data-ending-style/collapsible-section-panel:duration-fast group-data-starting-style/collapsible-section-panel:opacity-0"
        >
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export { CollapsibleSection, type CollapsibleSectionProps };
