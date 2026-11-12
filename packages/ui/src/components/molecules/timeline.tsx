import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import type { Tone } from '@vendure-io/ui/lib/state-dictionary';
import { cn } from '@vendure-io/ui/lib/utils';
import type * as React from 'react';

// Compound-only, like ListRow: callers assemble the parts, so an entry can
// hold a plain sentence, an icon, detail content, an actor and a link without
// an ever-growing prop set.
//
// The v3 look: one rail of 1px `input` lines. Each entry is a 14px marker
// column and the text, 12px apart. The 8px dot sits 6px down, centred on the
// first 20px line of the sentence. The line under an entry starts 4px below
// its marker and stops 4px above the next marker, so the rail runs between
// the dots, never through them. Entries are 16px apart.
//
// The rail is the entry's ::after, drawn from the marker of this entry to the
// marker of the next one, so the last entry draws none. The line ends 2px
// below the entry (4px above the next dot, which sits 6px down), or 1px above
// it when the next entry has an icon (an icon sits 3px down).
const ITEM_RAIL =
  "not-last:after:absolute not-last:after:start-[6.5px] not-last:after:top-[18px] not-last:after:-bottom-0.5 not-last:after:w-px not-last:after:bg-input not-last:after:content-[''] has-[[data-slot=timeline-marker][data-marker=icon]]:after:top-[21px] [&:has(+li_[data-slot=timeline-marker][data-marker=icon])]:after:bottom-px";

// Interactive elements inside an entry with a TimelineLink (buttons, links,
// tooltip triggers) are lifted above the stretched link, so they keep their
// own click and their own tab stop. The class names stay literal so Tailwind
// can scan them.
const LIFT_CONTROLS =
  '[&_:is(a,button,input,select,textarea,[role=button],[tabindex],[data-tooltip-trigger],[data-timeline-control]):not([data-slot=timeline-link])]:relative [&_:is(a,button,input,select,textarea,[role=button],[tabindex],[data-tooltip-trigger],[data-timeline-control]):not([data-slot=timeline-link])]:z-10';

// The ListRow entrance: an entry the user just added (`enter="new"`) opens
// its height on the `height` curve in `row-enter`, so the entries below glide
// down, then its content fades in from a 3px blur a `fast` beat later.
// @starting-style runs it on mount only. The 16px gap under the entry opens
// with it. Reduced motion keeps the fade only.
const ENTER_NEW =
  'data-[enter=new]:overflow-clip data-[enter=new]:[interpolate-size:allow-keywords] motion-safe:data-[enter=new]:[transition:height_var(--transition-duration-row-enter)_var(--ease-height),padding-bottom_var(--transition-duration-row-enter)_var(--ease-height),opacity_var(--transition-duration-slow)_var(--ease-soft)_var(--transition-duration-fast),filter_var(--transition-duration-slow)_var(--ease-out)_var(--transition-duration-fast)] motion-safe:data-[enter=new]:starting:h-0 motion-safe:data-[enter=new]:starting:pb-0 motion-safe:data-[enter=new]:starting:blur-[3px] data-[enter=new]:starting:opacity-0 motion-reduce:data-[enter=new]:[transition:opacity_var(--transition-duration-normal)_var(--ease-default)]';

/**
 * A feed of activity entries on one vertical rail, newest first: a crash, a
 * restart, a refund, a note. Renders an `<ol>` of TimelineItems.
 *
 * For entries grouped by day, put a TimelineGroupHeading before each group's
 * own Timeline.
 */
function Timeline({ className, ...props }: React.ComponentProps<'ol'>) {
  return <ol data-slot="timeline" className={cn('flex flex-col', className)} {...props} />;
}

/**
 * The heading of a group of entries, such as a day ("Today", "Yesterday"):
 * the type of the ListRow day heading, a step above the entry time. Place it
 * before the Timeline of its group. Renders a `div`; pass `render={<h3 />}`
 * when the groups belong in the page outline.
 */
function TimelineGroupHeading({ className, render, ...props }: useRender.ComponentProps<'div'>) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: mergeProps<'div'>(
      {
        className: cn(
          'pt-4 pb-2.5 text-xs leading-3 font-semibold text-foreground-secondary first:pt-0',
          className,
        ),
      },
      props,
    ),
    state: { slot: 'timeline-group-heading' },
  });
}

interface TimelineItemProps extends React.ComponentProps<'li'> {
  /**
   * How an entry added while the page is open enters: `'new'` opens its
   * height, then fades its content in, like a new ListRow. Leave it unset on
   * the entries of the first render, so the feed does not animate on load.
   */
  enter?: 'new';
}

/**
 * One entry: a TimelineMarker and a TimelineContent. With a TimelineLink
 * inside, the whole entry opens the link; keyboard focus on the link draws a
 * ring around the entry.
 */
function TimelineItem({ className, enter, ...props }: TimelineItemProps) {
  return (
    <li
      data-slot="timeline-item"
      data-enter={enter}
      className={cn(
        'group/timeline-item relative grid grid-cols-[14px_minmax(0,1fr)] gap-x-3 not-last:pb-4',
        ITEM_RAIL,
        'has-data-[slot=timeline-link]:cursor-pointer',
        LIFT_CONTROLS,
        ENTER_NEW,
        className,
      )}
      {...props}
    />
  );
}

// The dot fill of each tone, as StatusBadge draws its dot. A dot is a filled
// shape, so warning takes `warning-indicator`: in `warning-text` it reads
// brown. Neutral is the `neutral-text` grey.
const toneDot: Record<Tone, string> = {
  neutral: 'text-neutral-text',
  info: 'text-info-text',
  success: 'text-success-text',
  warning: 'text-warning-indicator',
  critical: 'text-destructive-text',
  progress: 'text-info-text',
};

// An icon marker takes the tone's text colour: it is a stroke, as in
// StatusBadge.
const toneIcon: Record<Tone, string> = {
  ...toneDot,
  warning: 'text-warning-text',
};

interface TimelineMarkerProps extends React.ComponentProps<'span'> {
  /** The tone of the entry, from the state dictionary. Defaults to `neutral`. */
  tone?: Tone;
}

/**
 * The mark on the rail. Without children it is an 8px dot in its tone colour.
 * With children (a 14px icon, or a live indicator) they take the place of the
 * dot, centred on the first line of the sentence, in the tone colour.
 * Decorative: the sentence carries the meaning.
 */
function TimelineMarker({ className, tone = 'neutral', children, ...props }: TimelineMarkerProps) {
  const icon = children != null && children !== false;
  return (
    <span
      aria-hidden
      data-slot="timeline-marker"
      data-marker={icon ? 'icon' : 'dot'}
      data-tone={tone}
      className={cn(
        'justify-self-center',
        icon
          ? cn(
              "mt-0.75 flex size-3.5 items-center justify-center [&_svg:not([class*='size-'])]:size-3.5 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
              toneIcon[tone],
            )
          : cn('mt-1.5 size-2 rounded-full bg-current', toneDot[tone]),
        className,
      )}
      {...props}
    >
      {icon ? children : null}
    </span>
  );
}

/** The text column: the sentence, then the meta line and any detail. */
function TimelineContent({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="timeline-content" className={cn('min-w-0', className)} {...props} />;
}

const titleClassName = 'text-sm leading-5 text-foreground text-pretty';

/** The sentence of an entry: what happened, in 13px on a 20px line. */
function TimelineTitle({ className, ...props }: React.ComponentProps<'p'>) {
  return <p data-slot="timeline-title" className={cn(titleClassName, className)} {...props} />;
}

/**
 * The sentence of an entry that opens something. Renders a `<button>` for an
 * `onClick` handler; pass `render={<a href="…" />}` (or a router link element)
 * to open a URL. It covers the whole entry, so a click on any point of it
 * opens the link. Its children are the accessible name: keep them to the
 * sentence.
 */
function TimelineLink({ className, render, ...props }: useRender.ComponentProps<'button'>) {
  return useRender({
    defaultTagName: 'button',
    render,
    props: mergeProps<'button'>(
      {
        // A native button submits its form by default; a rendered anchor or
        // router link takes no type.
        type: render ? undefined : 'button',
        className: cn(
          titleClassName,
          'block max-w-full cursor-pointer text-start outline-none',
          // The stretched area covers the entry, 6px out to the sides and 4px
          // above and below, but not the 16px gap to the next entry. Keyboard
          // focus draws the ring around it.
          'after:absolute after:-inset-x-1.5 after:-inset-y-1 after:rounded-md group-not-last/timeline-item:after:bottom-3',
          'focus-visible:after:outline-2 focus-visible:after:outline-solid focus-visible:after:outline-ring',
          'decoration-muted-foreground/60 underline-offset-2 group-hover/timeline-item:underline',
          className,
        ),
      },
      props,
    ),
    state: { slot: 'timeline-link' },
  });
}

/**
 * The 12px muted line under the sentence: the time, as a RelativeTime, and
 * who did it ("Mara Lindqvist · 5 min ago"). Tabular figures keep times
 * steady.
 */
function TimelineMeta({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="timeline-meta"
      className={cn('mt-0.5 text-xs leading-4.5 text-muted-foreground tabular-nums', className)}
      {...props}
    />
  );
}

/**
 * Optional content under the meta line: a note, an amount, a state change, a
 * list of the changed lines.
 */
function TimelineDetail({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="timeline-detail"
      className={cn('mt-2 text-sm text-foreground-secondary', className)}
      {...props}
    />
  );
}

export {
  Timeline,
  TimelineContent,
  TimelineDetail,
  TimelineGroupHeading,
  TimelineItem,
  TimelineLink,
  TimelineMarker,
  TimelineMeta,
  TimelineTitle,
};
export type { TimelineItemProps, TimelineMarkerProps };
