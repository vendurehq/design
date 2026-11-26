'use client';

import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { Progress } from '@vendure-io/ui/components/atoms/progress';
import { toneIcons } from '@vendure-io/ui/lib/tone-icons';
import { cn } from '@vendure-io/ui/lib/utils';
import * as React from 'react';

// Compound, like Timeline: the root sets the orientation and the marker kind,
// each step takes a state, and callers place a title, a description and, in a
// vertical guide, any content under it. The step draws its own marker (and, in
// a horizontal track, its own bar) from its state, so the look of a state is
// the same in every flow.
//
// An ordered flow, not a to-do list: the user moves through the steps in
// order, or the system runs them in order. Tasks the user ticks off in any
// order are a Checklist.

/**
 * Where a step stands in the flow.
 *
 * - `upcoming`: not reached yet.
 * - `current`: the step the flow is on, waiting for the user or for the
 *   system. No spinner: a waiting step can wait for days.
 * - `running`: work on this step is happening now (a build, a deploy). Only
 *   this state spins.
 * - `done`: finished.
 * - `failed`: the flow stopped here.
 */
type StepState = 'upcoming' | 'current' | 'running' | 'done' | 'failed';

type StepStateLabels = Record<StepState, string>;

const defaultStateLabels: StepStateLabels = {
  upcoming: 'not started',
  current: 'current step',
  running: 'in progress',
  done: 'done',
  failed: 'failed',
};

type StepIndicatorContextValue = {
  orientation: 'horizontal' | 'vertical';
  marker: 'number' | 'icon';
  stateLabels: StepStateLabels;
};

const StepIndicatorContext = React.createContext<StepIndicatorContextValue>({
  orientation: 'horizontal',
  marker: 'number',
  stateLabels: defaultStateLabels,
});

const StepContext = React.createContext<StepState>('upcoming');

interface StepIndicatorProps extends React.ComponentProps<'ol'> {
  /**
   * `'horizontal'` (default): a progress track, one bar per step, the steps
   * side by side (signup, the build and deploy steps of a deployment).
   * `'vertical'`: a guide, the steps one under the other on a rail, with room
   * for content under each step (a first-run guide).
   */
  orientation?: 'horizontal' | 'vertical';
  /**
   * `'number'` (default): each step shows its number until it is done,
   * running or failed. `'icon'`: each step shows a state icon only, for steps
   * the system runs, where the number adds nothing.
   */
  marker?: 'number' | 'icon';
  /**
   * What a screen reader hears after each step's title, so the state never
   * depends on colour or shape alone. Pass translations here.
   */
  stateLabels?: Partial<StepStateLabels>;
}

/**
 * The steps of an ordered flow and where the flow stands: signup, the build
 * and deploy steps of a deployment, a first-run guide. Renders an `<ol>`; give
 * it an `aria-label` ("Signup steps").
 *
 * Nothing moves on the first render. When a step changes state later, its
 * marker eases to the new state and, in a horizontal track, its bar fills.
 */
function StepIndicator({
  className,
  orientation = 'horizontal',
  marker = 'number',
  stateLabels,
  ...props
}: StepIndicatorProps) {
  // Set after the first render: the state entrances below run only once it
  // is there, so a page that loads mid-flow shows its steps at rest.
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => setReady(true), []);
  const labels = React.useMemo(() => ({ ...defaultStateLabels, ...stateLabels }), [stateLabels]);
  const context = React.useMemo(
    () => ({ orientation, marker, stateLabels: labels }),
    [orientation, marker, labels],
  );
  return (
    <StepIndicatorContext.Provider value={context}>
      <ol
        data-slot="step-indicator"
        data-orientation={orientation}
        data-ready={ready ? '' : undefined}
        className={cn(
          'group/step-indicator [counter-reset:step]',
          // A horizontal track gives each step an equal column of at least
          // 7rem, so the names stay readable; on a narrow screen the steps
          // wrap to a second row rather than cut every name short.
          orientation === 'horizontal'
            ? 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,7rem),1fr))] gap-x-3 gap-y-4'
            : 'flex flex-col',
          className,
        )}
        {...props}
      />
    </StepIndicatorContext.Provider>
  );
}

// The vertical rail: a 1px `input` line from 4px under this step's marker to
// 4px above the next one, centred on the 20px marker column, on the start
// edge so it moves to the right in right-to-left. The last step draws none.
const VERTICAL_RAIL =
  "not-last:pb-6 not-last:after:absolute not-last:after:start-[9.5px] not-last:after:top-6 not-last:after:bottom-1 not-last:after:w-px not-last:after:bg-input not-last:after:content-['']";

// The bar of each state on a horizontal track. A done step fills green and a
// failed one red, as Progress does. A current step fills with a soft blue
// tint: it is on, not finished. A running step adds the moving band on the
// same tint. An upcoming step is the empty track.
const barProps: Record<StepState, Pick<React.ComponentProps<typeof Progress>, 'value' | 'tone'>> = {
  upcoming: { value: 0, tone: 'neutral' },
  current: { value: null, tone: 'progress' },
  running: { value: null, tone: 'progress' },
  done: { value: 100, tone: 'success' },
  failed: { value: 100, tone: 'critical' },
};

// Progress grows its fill from 0 when it mounts. The track shows the flow as
// it is on load, so the fill starts at its value; it still grows when a step
// moves on. A current step keeps the tint of the indeterminate bar without
// its moving band.
const BAR =
  'col-span-full mb-2.5 [&_[data-slot=progress-indicator]]:starting:scale-x-(--progress-scale,1)!';
const BAR_STILL = '[&_[data-slot=progress-indicator]]:after:hidden';

interface StepIndicatorStepProps extends React.ComponentProps<'li'> {
  /** Where this step stands. Default `upcoming`. */
  state?: StepState;
}

/**
 * One step: its marker, then a StepIndicatorTitle, an optional
 * StepIndicatorDescription and, in a vertical guide, any StepIndicatorContent.
 * The current and the running step carry `aria-current="step"`.
 */
function StepIndicatorStep({
  className,
  state = 'upcoming',
  children,
  ...props
}: StepIndicatorStepProps) {
  const { orientation } = React.useContext(StepIndicatorContext);
  const horizontal = orientation === 'horizontal';
  return (
    <StepContext.Provider value={state}>
      <li
        data-slot="step-indicator-step"
        data-state={state}
        aria-current={state === 'current' || state === 'running' ? 'step' : undefined}
        className={cn(
          'group/step relative grid min-w-0 content-start [counter-increment:step]',
          horizontal
            ? 'grid-cols-[20px_minmax(0,1fr)] gap-x-2'
            : cn('grid-cols-[20px_minmax(0,1fr)] gap-x-3', VERTICAL_RAIL),
          className,
        )}
        {...props}
      >
        {horizontal ? (
          <Progress
            aria-hidden
            {...barProps[state]}
            className={cn(BAR, state === 'current' && BAR_STILL)}
          />
        ) : null}
        <StepIndicatorMarker state={state} />
        {children}
      </li>
    </StepContext.Provider>
  );
}

// A glyph that takes the place of another, when a step changes state after
// the first render, scales up from 85% and fades in, in `normal` on the
// strong ease-out. Reduced motion keeps the fade.
const ENTER =
  'transition-[opacity,scale] duration-normal ease-out group-data-ready/step-indicator:starting:opacity-0 motion-safe:group-data-ready/step-indicator:starting:scale-85 motion-reduce:transition-opacity';

// Each state's glyph: the tone icon of the state dictionary, so done, failed
// and running look as they do in a StatusBadge. The icons are 16px in an
// icon track and fill the 20px marker in a numbered one, where they take the
// place of the numbered circle.
const DoneIcon = toneIcons.success;
const FailedIcon = toneIcons.critical;
const RunningIcon = toneIcons.progress;
const UpcomingIcon = toneIcons.neutral;

function StepIndicatorMarker({ state }: { state: StepState }) {
  const { marker } = React.useContext(StepIndicatorContext);
  const iconSize = marker === 'number' ? 'size-5' : 'size-4';
  let glyph: React.ReactNode;
  // The key changes with the glyph, so a new glyph mounts and plays ENTER,
  // while the numbered circle stays and eases its colours from upcoming to
  // current.
  if (state === 'done') {
    glyph = <DoneIcon key="done" className={cn(iconSize, 'text-success-text', ENTER)} />;
  } else if (state === 'failed') {
    glyph = <FailedIcon key="failed" className={cn(iconSize, 'text-destructive-text', ENTER)} />;
  } else if (state === 'running') {
    glyph = (
      <span key="running" className={cn('flex', ENTER)}>
        <RunningIcon
          className={cn(iconSize, 'text-info-text animate-spin-slow motion-reduce:animate-none')}
        />
      </span>
    );
  } else if (marker === 'number') {
    glyph = (
      <span
        key="number"
        className={cn(
          'flex size-5 items-center justify-center rounded-full border text-xs leading-none font-medium tabular-nums',
          'before:content-[counter(step)]',
          'transition-[color,border-color] duration-normal ease-soft',
          state === 'current'
            ? 'border-info-text text-info-text'
            : 'border-input text-muted-foreground',
        )}
      />
    );
  } else if (state === 'current') {
    // A waiting step: blue, and no icon that could read as loading.
    glyph = <span key="current" className={cn('size-2 rounded-full bg-info-text', ENTER)} />;
  } else {
    glyph = (
      <UpcomingIcon key="upcoming" className={cn(iconSize, 'text-muted-foreground', ENTER)} />
    );
  }
  return (
    <span
      aria-hidden
      data-slot="step-indicator-marker"
      data-marker={marker}
      className="flex size-5 items-center justify-center [&_svg]:stroke-[1.75]"
    >
      {glyph}
    </span>
  );
}

/**
 * The name of the step, in 14px on a 20px line beside the marker. A screen
 * reader hears the step's state after it ("Build, done"). An upcoming step's
 * title is muted. Renders a `p`; pass `render={<h3 />}` when the steps of a
 * guide belong in the page outline.
 */
function StepIndicatorTitle({
  className,
  render,
  children,
  ...props
}: useRender.ComponentProps<'p'>) {
  const { orientation, stateLabels } = React.useContext(StepIndicatorContext);
  const state = React.useContext(StepContext);
  return useRender({
    defaultTagName: 'p',
    render,
    props: mergeProps<'p'>(
      {
        className: cn(
          'col-start-2 text-sm leading-5 font-medium transition-colors duration-normal ease-soft',
          state === 'upcoming' ? 'text-muted-foreground' : 'text-foreground',
          orientation === 'horizontal' && 'truncate',
          className,
        ),
        children: (
          <>
            {children}
            <span className="sr-only">, {stateLabels[state]}</span>
          </>
        ),
      },
      props,
    ),
    state: { slot: 'step-indicator-title' },
  });
}

/**
 * The line under the title: what the step does, or the time it took. Muted,
 * with tabular figures so a running time stays steady.
 */
function StepIndicatorDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="step-indicator-description"
      className={cn(
        'col-start-2 mt-0.5 text-sm text-muted-foreground tabular-nums text-pretty',
        className,
      )}
      {...props}
    />
  );
}

/**
 * Content under a step of a vertical guide: the actions of the current step,
 * a command to run, a note.
 */
function StepIndicatorContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="step-indicator-content"
      className={cn('col-start-2 mt-3 min-w-0', className)}
      {...props}
    />
  );
}

export {
  StepIndicator,
  StepIndicatorContent,
  StepIndicatorDescription,
  StepIndicatorStep,
  StepIndicatorTitle,
};
export type { StepIndicatorProps, StepIndicatorStepProps, StepState, StepStateLabels };
