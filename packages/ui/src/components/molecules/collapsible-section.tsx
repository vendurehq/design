'use client';

import { Card } from '@vendure-io/ui/components/atoms/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@vendure-io/ui/components/atoms/collapsible';
import { cn } from '@vendure-io/ui/lib/utils';
import { cva } from 'class-variance-authority';
import { ChevronRight } from 'lucide-react';
import { type ComponentProps, type ReactNode, useState } from 'react';

// The count pill says how many rows wait behind a closed section. Open, the
// rows say it themselves, so the pill blurs out while the height opens, and
// fades back only once the height has settled on close: pill and rows never
// show together. Attention is the warning tone, on the pill only: the section
// itself stays neutral (accent rationing).
const countPillVariants = cva(
  [
    'inline-flex h-5 min-w-5 items-center justify-center rounded-full border px-1.5 text-xs font-semibold tabular-nums',
    'transition-[opacity,filter] duration-(--transition-duration-moderate) ease-(--ease-default) delay-(--transition-duration-slow)',
    'group-data-panel-open/collapsible-section-trigger:opacity-0 group-data-panel-open/collapsible-section-trigger:delay-0',
    // Reduced motion keeps the fade and drops the blur.
    'motion-safe:group-data-panel-open/collapsible-section-trigger:blur-xs',
  ],
  {
    variants: {
      tone: {
        neutral: 'border-neutral-border bg-neutral-subtle text-neutral-subtle-foreground',
        attention: 'border-warning-border bg-warning-subtle text-warning-subtle-foreground',
      },
    },
    defaultVariants: {
      tone: 'neutral',
    },
  },
);

type CollapsibleSectionProps = Omit<
  ComponentProps<typeof Collapsible>,
  'title' | 'render' | 'className' | 'children'
> & {
  /** The section title. Also the name of the toggle button. */
  title: ReactNode;
  /** How many rows the section holds. Shown in a pill while the section is closed. */
  count?: number;
  /** `attention` puts the pill in the warning tone, for rows that need the user. Default `neutral`. */
  tone?: 'neutral' | 'attention';
  /** Heading level of the title in the page outline. Default `2`. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  className?: string;
  /** The rows. Usually ListRow elements. */
  children?: ReactNode;
};

/**
 * A card-surface section whose header opens and closes its rows. The header
 * is one button: title, count pill, and a chevron that turns 90° when open.
 */
function CollapsibleSection({
  title,
  count,
  tone = 'neutral',
  headingLevel = 2,
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  children,
  ...props
}: CollapsibleSectionProps) {
  // The pill is hidden from assistive technology while open, so the section
  // tracks its own state even when uncontrolled.
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const isOpen = open ?? uncontrolledOpen;
  const Heading = `h${headingLevel}` as const;

  return (
    <Collapsible
      data-slot="collapsible-section"
      open={isOpen}
      onOpenChange={(next, details) => {
        setUncontrolledOpen(next);
        onOpenChange?.(next, details);
      }}
      render={<Card />}
      className={cn('gap-0 py-0', className)}
      {...props}
    >
      <Heading data-slot="collapsible-section-heading" className="m-0">
        <CollapsibleTrigger
          data-slot="collapsible-section-trigger"
          className="group/collapsible-section-trigger flex min-h-12 w-full cursor-pointer items-center gap-2 px-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        >
          <span data-slot="collapsible-section-title" className="text-sm font-semibold">
            {title}
          </span>
          {count != null ? (
            <span
              data-slot="collapsible-section-count"
              aria-hidden={isOpen || undefined}
              className={countPillVariants({ tone })}
            >
              {count}
            </span>
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
