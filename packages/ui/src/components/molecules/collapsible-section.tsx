'use client';

import { Card, CardCount } from '@vendure-io/ui/components/atoms/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@vendure-io/ui/components/atoms/collapsible';
import { cn } from '@vendure-io/ui/lib/utils';
import { cva } from 'class-variance-authority';
import { ChevronRight } from 'lucide-react';
import type { ComponentProps, ReactNode } from 'react';

// The count says how many rows the section holds, open and closed. It is a
// CardCount, the same count as beside a card title. `detail` adds a short
// fact after it ("2 · 1 failed"). The tone colours the detail when there is
// one, and the whole count otherwise: the number stays muted beside a toned
// fact, and the section itself stays neutral (accent rationing).
const toneVariants = cva('', {
  variants: {
    tone: {
      neutral: 'text-muted-foreground',
      attention: 'text-warning-text',
      critical: 'text-destructive-text',
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
  /** How many rows the section holds, beside the title. */
  count?: number | string;
  /** A short fact after the count, such as "1 failed". Renders as "{count} · {detail}". */
  detail?: string;
  /**
   * Colours the detail, or the whole count when there is no detail. `attention`
   * (warning tone): rows wait on the user. `critical` (destructive tone): rows
   * have failed. Default `neutral`.
   */
  tone?: 'neutral' | 'attention' | 'critical';
  /** Heading level of the title in the page outline. Default `2`. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
  /** The rows. Usually ListRow elements. */
  children?: ReactNode;
};

/**
 * A card-surface section whose header opens and closes its rows. The header
 * is one button: title, count, and a chevron that turns 90° when open.
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
          className="group/collapsible-section-trigger flex min-h-12 w-full cursor-pointer items-center gap-2 px-4 text-left outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
        >
          <span data-slot="collapsible-section-title" className="min-w-0 text-sm font-semibold">
            {title}
          </span>
          {count != null ? (
            <CardCount
              data-slot="collapsible-section-count"
              className={cn(
                'ms-0 inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap',
                detail ? undefined : toneVariants({ tone }),
              )}
            >
              {count}
              {detail ? (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="sr-only">, </span>
                  <span
                    data-slot="collapsible-section-count-detail"
                    className={toneVariants({ tone })}
                  >
                    {detail}
                  </span>
                </>
              ) : null}
            </CardCount>
          ) : null}
          <ChevronRight
            aria-hidden="true"
            strokeWidth={1.75}
            className="ml-auto size-4 shrink-0 text-muted-foreground transition-[color,rotate] duration-(--transition-duration-slow) ease-(--ease-drawer) group-hover/collapsible-section-trigger:text-foreground group-data-panel-open/collapsible-section-trigger:rotate-90 motion-reduce:transition-colors"
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
