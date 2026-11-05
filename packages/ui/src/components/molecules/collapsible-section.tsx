'use client';

import { Card } from '@vendure-io/ui/components/atoms/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@vendure-io/ui/components/atoms/collapsible';
import { cn } from '@vendure-io/ui/lib/utils';
import { cva } from 'class-variance-authority';
import { ChevronDown } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

// The count says how many rows the section holds, open and closed, like a
// CardCount beside a card title. Attention colours its text in the warning
// tone, for rows that need the user: the section itself stays neutral
// (accent rationing).
const countVariants = cva('text-xs font-semibold tabular-nums', {
  variants: {
    tone: {
      neutral: 'text-muted-foreground',
      attention: 'text-warning-text',
    },
  },
  defaultVariants: {
    tone: 'neutral',
  },
});

type CollapsibleSectionProps = Omit<
  ComponentProps<typeof Collapsible>,
  'title' | 'render' | 'className' | 'children'
> & {
  /** The section title. Also the name of the toggle button. */
  title: ReactNode;
  /** How many rows the section holds, beside the title. A number, or text such as "2 · 1 failed". */
  count?: ReactNode;
  /** `attention` colours the count in the warning tone, for rows that need the user. Default `neutral`. */
  tone?: 'neutral' | 'attention';
  /** Heading level of the title in the page outline. Default `2`. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
  /** The rows. Usually ListRow elements. */
  children?: ReactNode;
};

/**
 * A card-surface section whose header opens and closes its rows. The header
 * is one full-width button, filled on hover like a row: title, count, and a
 * down chevron that turns over when open.
 */
function CollapsibleSection({
  title,
  count,
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
          className="group/collapsible-section-trigger flex min-h-12 w-full cursor-pointer items-center gap-2 px-4 text-left outline-none transition-colors duration-fast hover:bg-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          {/* The title is quieter than the rows it labels. */}
          <span
            data-slot="collapsible-section-title"
            className="text-sm font-semibold text-foreground-secondary"
          >
            {title}
          </span>
          {count != null ? (
            <span data-slot="collapsible-section-count" className={countVariants({ tone })}>
              {count}
            </span>
          ) : null}
          {/* The chevron turns on the panel's height timing, so both settle
              together; its colour and opacity follow the hover faster. */}
          <ChevronDown
            aria-hidden="true"
            strokeWidth={1.75}
            className="ml-auto size-3.75 shrink-0 text-muted-foreground opacity-70 [transition:rotate_var(--transition-duration-slow)_var(--ease-drawer),color_var(--transition-duration-moderate),opacity_var(--transition-duration-moderate)] group-hover/collapsible-section-trigger:text-foreground group-hover/collapsible-section-trigger:opacity-100 group-data-panel-open/collapsible-section-trigger:rotate-180 motion-reduce:[transition:color_var(--transition-duration-moderate),opacity_var(--transition-duration-moderate)]"
          />
        </CollapsibleTrigger>
      </Heading>
      {/* Height runs on the drawer curve; under reduced motion it snaps and
          only the rows fade. */}
      <CollapsibleContent
        data-slot="collapsible-section-panel"
        className="group/collapsible-section-panel h-(--collapsible-panel-height) overflow-hidden border-t border-border data-ending-style:h-0 data-starting-style:h-0 motion-safe:transition-[height] motion-safe:duration-(--transition-duration-slow) motion-safe:ease-(--ease-drawer)"
      >
        {/* Opening, the rows fade in over the second half of the height;
            closing, they leave at once so the height settles on nothing. */}
        <div
          data-slot="collapsible-section-rows"
          className="transition-opacity delay-(--transition-duration-moderate) duration-(--transition-duration-moderate) ease-(--ease-out) group-data-ending-style/collapsible-section-panel:opacity-0 group-data-ending-style/collapsible-section-panel:delay-0 group-data-ending-style/collapsible-section-panel:duration-(--transition-duration-fast) group-data-starting-style/collapsible-section-panel:opacity-0"
        >
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export { CollapsibleSection, type CollapsibleSectionProps };
