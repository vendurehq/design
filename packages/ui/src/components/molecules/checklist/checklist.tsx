// Portions adapted from paragonhq/stealth-ui@b7f23382e7dbbac3815dee70cb1b4759c040205c (components/ui/checklist.tsx), MIT, Copyright (c) 2026 Paragon.
'use client';

import { Button } from '@vendure-io/ui/components/atoms/button';
import { Card, CardCount } from '@vendure-io/ui/components/atoms/card';
import { Checkbox } from '@vendure-io/ui/components/atoms/checkbox';
import { Progress } from '@vendure-io/ui/components/atoms/progress';
import { ArrowLink } from '@vendure-io/ui/components/molecules/arrow-link';
import { cn } from '@vendure-io/ui/lib/utils';
import { ChevronDown, X } from 'lucide-react';
import { AnimatePresence, LayoutGroup, motion, useIsPresent, useReducedMotion } from 'motion/react';
import * as React from 'react';

// What was taken from Stealth UI's Checklist: the two lists (open steps, then
// a "Completed" group) joined by a shared `layoutId`, so a finished step flies
// into the group; the strike as a 1px background that sweeps across the
// label; the hold that keeps a step in place until it may move. The look,
// the tokens, the parts, the system mode, the hold rule and the rolling count
// are ours.
//
// The motion, in tokens. Motion for React takes numbers, so the values are
// named here after their token, as Tooltip does for `tooltip-delay`:
// - A step moves to its new list on a spring with no bounce that settles in
//   `slow` (300ms). So do the lists around it.
// - The strike sweeps in `slow` on the strong ease-out; the label greys in the
//   same time. Unchecked, the strike draws back quicker, in `moderate`. The
//   count's digits roll in `slow` on the strong ease-out.
// - A row that appears or leaves without a place to go fades in `moderate`
//   (150ms) on `soft`. A row that turns done while the Completed group is
//   closed also folds its height in `slow` on `height`, so the card and the
//   group under it close up with it rather than jump.
// - The Completed group opens and closes its height in `slow` on `height`.
// - The Completed header and the dismiss button fade in `moderate` on `soft`
//   when they first show after the Checklist mounted.
// Reduced motion: nothing moves and nothing sweeps. Rows, the strike and the
// group change at once; rows, the header, the dismiss button and the system
// tick fade.
const MOVE = { type: 'spring', visualDuration: 0.3, bounce: 0 } as const;
const FADE = { duration: 0.15, ease: [0.25, 0.1, 0.25, 1] } as const;
const HEIGHT = { duration: 0.3, ease: [0.25, 1, 0.5, 1] } as const;
const INSTANT = { duration: 0 } as const;

/**
 * On a touch screen there is no hover: a step the user checks off waits this
 * long after the tap, then moves. Long enough to see the tick and the strike,
 * and to tap again to undo; short enough that the list does not feel stuck.
 */
const TOUCH_SETTLE_MS = 700;

// ── The hold rule ───────────────────────────────────────────────────────────

/** Which list a step shows in. */
type ChecklistSection = 'open' | 'done';

/** How the user checked a step off, which decides what lets it move. */
type ChecklistInput = 'mouse' | 'pen' | 'touch' | 'keyboard';

/**
 * A step the user just checked or unchecked stays in the list it was in until
 * `release` happens: `pointer` when the pointer leaves the row, `focus` when
 * focus leaves it, `timer` after the touch pause.
 */
type ChecklistHold = { from: ChecklistSection; release: 'pointer' | 'focus' | 'timer' };

type ChecklistHoldEvent =
  | { type: 'toggle'; id: string; from: ChecklistSection; input: ChecklistInput }
  | { type: 'pointerleave'; id: string }
  | { type: 'focusout'; id: string }
  | { type: 'timer'; id: string };

/**
 * The hold rule of a manual Checklist, as a pure function: the held steps
 * after an event. Exported for its tests.
 *
 * - A toggle holds the step in the list it was in. A second toggle before the
 *   step moved keeps the first list, so checking and unchecking again cancels
 *   the move.
 * - A mouse or pen toggle lets go when the pointer leaves the row; a keyboard
 *   toggle when focus leaves it; a touch toggle after the touch pause.
 * - Any other event leaves the holds as they are.
 */
function reduceChecklistHold(
  holds: Readonly<Record<string, ChecklistHold>>,
  event: ChecklistHoldEvent,
): Record<string, ChecklistHold> {
  const hold = holds[event.id];
  if (event.type === 'toggle') {
    const release =
      event.input === 'keyboard' ? 'focus' : event.input === 'touch' ? 'timer' : 'pointer';
    return { ...holds, [event.id]: { from: hold?.from ?? event.from, release } };
  }
  const releases = { pointerleave: 'pointer', focusout: 'focus', timer: 'timer' } as const;
  if (!hold || hold.release !== releases[event.type]) return holds;
  const { [event.id]: _released, ...rest } = holds;
  return rest;
}

/** The list a step shows in: the held list while it is held, else its state. */
function checklistSection(done: boolean, hold: ChecklistHold | undefined): ChecklistSection {
  return hold?.from ?? (done ? 'done' : 'open');
}

// ── Contexts ────────────────────────────────────────────────────────────────

type ChecklistContextValue = {
  mode: 'system' | 'manual';
  groupId: string;
  reduce: boolean;
  isDone: (id: string) => boolean;
  /** Whether the step was in the Checklist before this render: a step that moves keeps it. */
  isKnown: (id: string) => boolean;
  /** Whether the step turned done since the last render: it strikes and ticks as it arrives. */
  justDone: (id: string) => boolean;
  doneLabel: string;
  openLabel: string;
  toggle: (id: string, checked: boolean, input: ChecklistInput) => void;
  release: (id: string, event: 'pointerleave' | 'focusout') => void;
};

const ChecklistContext = React.createContext<ChecklistContextValue | null>(null);

function useChecklist(part: string) {
  const context = React.useContext(ChecklistContext);
  if (!context) throw new Error(`${part} must be used inside a Checklist.`);
  return context;
}

type StepContextValue = {
  id: string;
  done: boolean;
  /** The step mounted done right after it turned done: its strike and tick play on arrival. */
  arrived: boolean;
  labelId: string;
  controlId: string;
};

const StepContext = React.createContext<StepContextValue | null>(null);

function useStep(part: string) {
  const context = React.useContext(StepContext);
  if (!context) throw new Error(`${part} must be used inside a ChecklistStep.`);
  return context;
}

// ── Checklist ───────────────────────────────────────────────────────────────

type ChecklistProps = Omit<React.ComponentProps<'div'>, 'title' | 'children'> & {
  /** The checklist title, such as "Set up your project". Also names the list. */
  title: React.ReactNode;
  /** Heading level of the title in the page outline. Default `2`. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /**
   * Who marks a step done.
   *
   * - `'system'` (default): the app, from its own data. Each step shows a
   *   tick, not a checkbox. A step that turns done moves to Completed at once.
   * - `'manual'`: the user, with a checkbox on each step. A step the user
   *   checks off stays in place until the pointer leaves the row (focus, for
   *   the keyboard; a short pause, on touch), so a mis-click can be undone.
   */
  mode?: 'system' | 'manual';
  /** Manual mode: called when the user checks or unchecks a step. */
  onStepCheckedChange?: (id: string, checked: boolean) => void;
  /**
   * Shows a dismiss button once every step is done. The Checklist does not
   * hide itself: remove it in this callback.
   */
  onDismiss?: () => void;
  /** Accessible name of the dismiss button. Default "Dismiss checklist". */
  dismissLabel?: string;
  /** Label of the group of finished steps. Default "Completed". */
  completedLabel?: string;
  /** Whether the Completed group is open (controlled). */
  completedOpen?: boolean;
  /** Whether the Completed group starts open. Default `true`. */
  defaultCompletedOpen?: boolean;
  onCompletedOpenChange?: (open: boolean) => void;
  /** What a screen reader hears after a done step's label in system mode. Default "done". */
  stepDoneLabel?: string;
  /** What a screen reader hears after an open step's label in system mode. Default "not done". */
  stepOpenLabel?: string;
  /** The count beside the title. Default "2 of 6". */
  formatCount?: (done: number, total: number) => string;
  /** What a screen reader hears when the count changes. Default "2 of 6 steps done". */
  formatAnnouncement?: (done: number, total: number) => string;
  /** The steps: ChecklistStep elements, as direct children (fragments and arrays are fine). */
  children?: React.ReactNode;
};

type StepElement = React.ReactElement<ChecklistStepProps>;

/** The ChecklistStep elements among the children, through fragments and arrays. */
function collectSteps(children: React.ReactNode): StepElement[] {
  const steps: StepElement[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    if (child.type === React.Fragment) {
      steps.push(...collectSteps((child.props as { children?: React.ReactNode }).children));
    } else if (child.type === ChecklistStep) {
      steps.push(child as StepElement);
    }
  });
  return steps;
}

/**
 * A short list of steps a person completes, with its progress: a title, a
 * count ("2 of 6") that rolls when it changes, a thin bar, the open steps,
 * then the finished ones in a Completed group that opens and closes. A step
 * that turns done strikes through and moves into the group.
 *
 * Compound: put a ChecklistStep per step as a direct child, and build each
 * step from its parts (label, description, detail, action, guide, body).
 * Renders a card, a region named by the title.
 */
function Checklist({
  title,
  headingLevel = 2,
  mode = 'system',
  onStepCheckedChange,
  onDismiss,
  dismissLabel = 'Dismiss checklist',
  completedLabel = 'Completed',
  stepDoneLabel = 'done',
  stepOpenLabel = 'not done',
  completedOpen: completedOpenProp,
  defaultCompletedOpen = true,
  onCompletedOpenChange,
  formatCount = (done, total) => `${done} of ${total}`,
  formatAnnouncement = (done, total) => `${done} of ${total} steps done`,
  className,
  children,
  ...props
}: ChecklistProps) {
  const reduce = useReducedMotion() ?? false;
  const groupId = React.useId();
  const titleId = React.useId();
  const completedId = React.useId();
  const Heading = `h${headingLevel}` as const;

  const steps = collectSteps(children);
  // Uncontrolled steps (`defaultDone`) keep the user's toggles here.
  const [toggled, setToggled] = React.useState<Record<string, boolean>>({});
  const doneOf = (step: StepElement) =>
    step.props.done ?? toggled[step.props.id] ?? step.props.defaultDone ?? false;
  const doneById = new Map(steps.map((step) => [step.props.id, doneOf(step)]));

  // The steps of the last render. A step that mounts in the other list is
  // moving there and arrives whole; only a new step fades in.
  // A step that was open in the last render and arrives done in Completed
  // mounts there with its strike and tick already set: it replays them from
  // the start (see `data-arrived`).
  const known = React.useRef(new Map<string, boolean>());
  const knownBefore = known.current;
  React.useEffect(() => {
    known.current = doneById;
  });
  // False in the first render: what shows then is there on arrival and does
  // not fade in.
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
  }, []);
  const arriving = mounted.current ? '' : undefined;

  const [holds, setHolds] = React.useState<Record<string, ChecklistHold>>({});
  const holdsRef = React.useRef(holds);
  holdsRef.current = holds;
  const timers = React.useRef(new Map<string, ReturnType<typeof setTimeout>>());
  // The step whose row had focus when it moved: its control gets focus back
  // in its new list.
  const refocus = React.useRef<string | null>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const dispatch = React.useCallback((event: ChecklistHoldEvent) => {
    const next = reduceChecklistHold(holdsRef.current, event);
    if (next === holdsRef.current) return;
    const root = rootRef.current;
    const row = root?.querySelector(`[data-step-id="${CSS.escape(event.id)}"]`);
    if (!(event.id in next) && row?.contains(document.activeElement)) refocus.current = event.id;
    holdsRef.current = next;
    setHolds(next);
  }, []);

  React.useEffect(() => {
    const map = timers.current;
    return () => {
      for (const timer of Array.from(map.values())) clearTimeout(timer);
    };
  }, []);

  const [completedOpenState, setCompletedOpenState] = React.useState(defaultCompletedOpen);
  const completedOpen = completedOpenProp ?? completedOpenState;
  const setCompletedOpen = (open: boolean) => {
    setCompletedOpenState(open);
    onCompletedOpenChange?.(open);
  };

  const context: ChecklistContextValue = {
    mode,
    groupId,
    reduce,
    isDone: (id) => doneById.get(id) ?? false,
    isKnown: (id) => knownBefore.has(id),
    justDone: (id) => knownBefore.get(id) === false && doneById.get(id) === true,
    doneLabel: stepDoneLabel,
    openLabel: stepOpenLabel,
    toggle: (id, checked, input) => {
      const from = checklistSection(!checked, holdsRef.current[id]);
      setToggled((prev) => ({ ...prev, [id]: checked }));
      onStepCheckedChange?.(id, checked);
      dispatch({ type: 'toggle', id, from, input });
      clearTimeout(timers.current.get(id));
      if (input === 'touch') {
        timers.current.set(
          id,
          setTimeout(() => {
            timers.current.delete(id);
            dispatch({ type: 'timer', id });
          }, TOUCH_SETTLE_MS),
        );
      }
    },
    release: (id, event) => dispatch({ type: event, id }),
  };

  const open: StepElement[] = [];
  const finished: StepElement[] = [];
  for (const step of steps) {
    const section = checklistSection(doneOf(step), holds[step.props.id]);
    (section === 'done' ? finished : open).push(step);
  }
  const total = steps.length;
  const complete = steps.filter(doneOf).length;
  const allDone = total > 0 && complete === total;

  // After a step moved, give its control focus back, or the Completed toggle
  // when the step went into a closed group.
  React.useEffect(() => {
    const id = refocus.current;
    if (!id) return;
    refocus.current = null;
    const root = rootRef.current;
    // The row that leaves fades out for a moment beside its new copy: look in
    // the list the step moved to.
    const list = open.some((step) => step.props.id === id)
      ? 'checklist-steps'
      : 'checklist-completed-steps';
    const control = root?.querySelector<HTMLElement>(
      `[data-slot=${list}] [data-step-id="${CSS.escape(id)}"] [data-slot=checklist-step-control]`,
    );
    (
      control ?? root?.querySelector<HTMLElement>('[data-slot=checklist-completed-trigger]')
    )?.focus();
  });

  // The polite announcement: only for a change, never on mount.
  const [announcement, setAnnouncement] = React.useState('');
  const lastCount = React.useRef({ complete, total });
  React.useEffect(() => {
    if (lastCount.current.complete === complete && lastCount.current.total === total) return;
    lastCount.current = { complete, total };
    setAnnouncement(formatAnnouncement(complete, total));
  }, [complete, total, formatAnnouncement]);

  const layout = reduce ? false : 'position';

  return (
    <ChecklistContext.Provider value={context}>
      {/* A card that is a labelled region: the title names it. */}
      <Card
        ref={rootRef}
        role="region"
        data-slot="checklist"
        data-mode={mode}
        aria-labelledby={titleId}
        className={cn('gap-0 pb-0', className)}
        {...props}
      >
        <div
          data-slot="checklist-header"
          className="flex flex-col gap-3 ps-(--card-ps) pe-(--card-px) pb-3"
        >
          <div className="flex min-h-7 items-center gap-3">
            <Heading
              id={titleId}
              data-slot="checklist-title"
              className="m-0 min-w-0 flex-1 truncate text-sm font-semibold"
            >
              {title}
            </Heading>
            <span
              data-slot="checklist-count"
              aria-hidden="true"
              className="text-muted-foreground shrink-0 text-xs font-semibold tabular-nums"
            >
              <RollingCount value={complete} format={(value) => formatCount(value, total)} />
            </span>
            {allDone && onDismiss ? (
              <span
                data-arrived={arriving}
                className="flex transition-opacity duration-moderate ease-soft data-arrived:starting:opacity-0"
              >
                <Button
                  data-slot="checklist-dismiss"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={dismissLabel}
                  onClick={onDismiss}
                  className="-me-1.5"
                >
                  <X />
                </Button>
              </span>
            ) : null}
          </div>
          <Progress
            data-slot="checklist-progress"
            value={complete}
            max={Math.max(total, 1)}
            aria-labelledby={titleId}
            getAriaValueText={() => formatCount(complete, total)}
            tone={allDone ? 'success' : 'default'}
          />
          <span role="status" className="sr-only">
            {announcement}
          </span>
        </div>

        <LayoutGroup id={groupId}>
          <ul
            data-slot="checklist-steps"
            aria-labelledby={titleId}
            className="relative flex flex-col border-t border-border empty:hidden"
          >
            {/* With the Completed group open, a row that turns done flies to
                it and leaves no gap. With it closed, the row has nowhere to
                go: it stays in the flow and folds (see ChecklistStep). */}
            <AnimatePresence
              initial={false}
              mode={completedOpen ? 'popLayout' : 'sync'}
              custom={!completedOpen}
            >
              {open.map((step) => React.cloneElement(step, { key: step.props.id }))}
            </AnimatePresence>
          </ul>

          {finished.length > 0 ? (
            <motion.div
              layout={layout}
              transition={MOVE}
              data-slot="checklist-completed"
              className="border-t border-border"
            >
              <button
                type="button"
                data-slot="checklist-completed-trigger"
                data-arrived={arriving}
                aria-expanded={completedOpen}
                aria-controls={completedOpen ? completedId : undefined}
                onClick={() => setCompletedOpen(!completedOpen)}
                className="group/checklist-completed text-foreground-secondary flex min-h-11 w-full cursor-pointer items-center gap-2 ps-(--card-ps) pe-(--card-px) text-start text-sm font-medium outline-none [transition:color_var(--transition-duration-fast)_var(--ease-default),background-color_var(--transition-duration-fast)_var(--ease-default),opacity_var(--transition-duration-moderate)_var(--ease-soft)] data-arrived:starting:opacity-0 hover:bg-muted focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring"
              >
                {completedLabel}
                <CardCount className="ms-0">{finished.length}</CardCount>
                <ChevronDown
                  aria-hidden="true"
                  strokeWidth={1.75}
                  className={cn(
                    'text-muted-foreground ms-auto size-3.75 shrink-0 opacity-70 [transition:rotate_var(--transition-duration-slow)_var(--ease-height),opacity_var(--transition-duration-fast)_var(--ease-default)] group-hover/checklist-completed:opacity-100 motion-reduce:[transition:opacity_var(--transition-duration-fast)_var(--ease-default)]',
                    completedOpen && 'rotate-180',
                  )}
                />
              </button>
              <CompletedPanel open={completedOpen} reduce={reduce}>
                <ul
                  id={completedId}
                  data-slot="checklist-completed-steps"
                  aria-label={completedLabel}
                  className="relative flex flex-col"
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    {finished.map((step) => React.cloneElement(step, { key: step.props.id }))}
                  </AnimatePresence>
                </ul>
              </CompletedPanel>
            </motion.div>
          ) : null}
        </LayoutGroup>
      </Card>
    </ChecklistContext.Provider>
  );
}

/**
 * The Completed group's rows. Its height opens and closes; it clips only while
 * it does, so a step that flies in from the open list is never cut off.
 */
function CompletedPanel({
  open,
  reduce,
  children,
}: {
  open: boolean;
  reduce: boolean;
  children: React.ReactNode;
}) {
  const [clip, setClip] = React.useState(false);
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key="completed"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={reduce ? { height: INSTANT, opacity: FADE } : { ...HEIGHT, opacity: FADE }}
          onAnimationStart={() => setClip(true)}
          onAnimationComplete={() => setClip(false)}
          className={clip ? 'overflow-hidden' : undefined}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

// ── Rolling count ───────────────────────────────────────────────────────────

/**
 * The count beside the title. Each digit is a column of 0–9 that slides to
 * its value, so a change rolls digit by digit. The text around the number
 * comes from `format`. Decorative: the Checklist announces the count itself.
 */
function RollingCount({ value, format }: { value: number; format: (value: number) => string }) {
  const text = format(value);
  const number = String(value);
  const at = text.indexOf(number);
  if (at < 0) return text;
  const digits = number.split('');
  return (
    <>
      {text.slice(0, at)}
      <span data-slot="checklist-count-value" className="inline-flex">
        {digits.map((digit, index) => (
          // Keyed from the right, so the ones column stays the ones column
          // when the number gains a digit.
          <span
            key={digits.length - index}
            className="relative inline-block h-[1lh] overflow-hidden"
          >
            <span
              className="flex flex-col transition-[translate] duration-slow ease-out motion-reduce:transition-none"
              style={{ translate: `0 ${-Number(digit) * 10}%` }}
            >
              {'0123456789'.split('').map((d) => (
                <span key={d}>{d}</span>
              ))}
            </span>
          </span>
        ))}
      </span>
      {text.slice(at + number.length)}
    </>
  );
}

// ── Steps ───────────────────────────────────────────────────────────────────

type ChecklistStepProps = Omit<React.ComponentProps<'li'>, 'id' | 'children'> & {
  /** A stable id, unique in the Checklist. */
  id: string;
  /** Whether the step is done (controlled). In system mode, set it from the app's data. */
  done?: boolean;
  /** Manual mode: whether the step starts done, when the Checklist keeps the state. */
  defaultDone?: boolean;
  /** The step's parts: ChecklistStepLabel, and optionally the others. */
  children?: React.ReactNode;
};

// The row grid. The label and the detail share the first line; the
// description and the guide stack under the label. The detail ends at the
// row's end edge, so it lines up on every row. From a 448px row (`@md`) the
// action sits in the same end column, under the detail; on a narrower row it
// goes under the text, at its start. The body spans the row under it all. Empty
// rows take no space: every part brings its own top margin.
const STEP_GRID =
  'grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 [grid-template-areas:"label_detail""description_description""guide_guide""action_action""body_body"] @md:[grid-template-areas:"label_detail""description_action""guide_action""body_body"]';

/**
 * One step of a Checklist: the tick or the checkbox, then its parts. Must be
 * a direct child of the Checklist (fragments and arrays are fine), which
 * places it in the open list or in Completed.
 */
function ChecklistStep({
  id,
  done: _done,
  defaultDone: _defaultDone,
  className,
  children,
  onPointerDown,
  onPointerEnter,
  onPointerLeave,
  onKeyDown,
  onBlur,
  ...props
}: ChecklistStepProps) {
  const checklist = useChecklist('ChecklistStep');
  const done = checklist.isDone(id);
  const labelId = React.useId();
  const controlId = React.useId();
  // How the user last pressed on this row: the toggle that follows lets go
  // by the same means.
  const input = React.useRef<ChecklistInput>('keyboard');
  // Latched at mount: a row that arrives done right after the step turned
  // done plays its strike and tick as it lands.
  const [arrived] = React.useState(() => checklist.justDone(id));
  const present = useIsPresent();
  const reduce = checklist.reduce;
  const step = React.useMemo(
    () => ({ id, done, arrived: arrived && done, labelId, controlId }),
    [id, done, arrived, labelId, controlId],
  );

  return (
    <StepContext.Provider value={step}>
      <motion.li
        layout={reduce ? false : 'position'}
        layoutId={reduce ? undefined : `${checklist.groupId}-${id}`}
        // The row flies whole: no crossfade with the copy it leaves behind,
        // so the rows it passes never show through it.
        layoutCrossfade={false}
        initial={checklist.isKnown(id) ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        // `fold` comes from the list's AnimatePresence: true when the row
        // leaves with no place to go and the rows under it must close up.
        variants={{
          exit: (fold: boolean) =>
            fold
              ? {
                  opacity: 0,
                  height: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                  borderTopWidth: 0,
                  transition: reduce ? { ...INSTANT, opacity: FADE } : { ...HEIGHT, opacity: FADE },
                }
              : { opacity: 0, transition: FADE },
        }}
        exit="exit"
        transition={reduce ? { ...INSTANT, opacity: FADE } : { ...MOVE, opacity: FADE }}
        data-slot="checklist-step"
        data-step-id={id}
        data-done={done ? '' : undefined}
        className={cn(
          'bg-card relative flex items-start gap-3 border-t border-border py-3 ps-(--card-ps) pe-(--card-px) first:border-t-0',
          !present && 'overflow-hidden',
          className,
        )}
        onPointerDown={(event) => {
          input.current = event.pointerType as ChecklistInput;
          onPointerDown?.(event);
        }}
        onPointerEnter={onPointerEnter}
        onPointerLeave={(event) => {
          // A finger "leaves" as it lifts, before the tap's click: touch lets
          // go on the pause instead.
          if (event.pointerType !== 'touch') checklist.release(id, 'pointerleave');
          onPointerLeave?.(event);
        }}
        onKeyDown={(event) => {
          input.current = 'keyboard';
          onKeyDown?.(event);
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            checklist.release(id, 'focusout');
          }
          onBlur?.(event);
        }}
        {...(props as React.ComponentProps<typeof motion.li>)}
      >
        <span className="flex h-5 shrink-0 items-center">
          {checklist.mode === 'manual' ? (
            // A native button, so the label's `htmlFor` reaches it and a
            // click on the label toggles the step.
            <Checkbox
              nativeButton
              render={<button type="button" />}
              id={controlId}
              data-slot="checklist-step-control"
              aria-labelledby={labelId}
              checked={done}
              onCheckedChange={(checked) => checklist.toggle(id, checked, input.current)}
            />
          ) : (
            <SystemTick done={done} arrived={step.arrived} />
          )}
        </span>
        <div className="@container min-w-0 flex-1">
          <div className={STEP_GRID}>{children}</div>
        </div>
      </motion.li>
    </StepContext.Provider>
  );
}

/**
 * System mode: a round tick, not a control. Open, an empty ring; done, the
 * ring fills and the tick draws in. A row that arrives done in Completed
 * starts from the open look (`@starting-style`), so the fill and the draw play
 * as it lands. Reduced motion: the fill and the tick fade.
 */
function SystemTick({ done, arrived }: { done: boolean; arrived: boolean }) {
  return (
    <span
      data-slot="checklist-step-tick"
      data-done={done ? '' : undefined}
      data-arrived={arrived ? '' : undefined}
      aria-hidden="true"
      className="group/tick border-control-border relative grid size-4 place-items-center rounded-full border transition-[border-color] duration-slow ease-out data-done:border-primary data-arrived:starting:border-control-border"
    >
      <span className="bg-primary absolute -inset-px rounded-full opacity-0 transition-opacity duration-moderate ease-soft group-data-done/tick:opacity-100 group-data-arrived/tick:starting:opacity-0" />
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary-foreground relative size-3"
      >
        <path
          d="M5 12.5l4.5 4.5L19 7.5"
          pathLength={1}
          className="[stroke-dasharray:1] [stroke-dashoffset:1] transition-[stroke-dashoffset] duration-fast ease-soft group-data-done/tick:[stroke-dashoffset:0] group-data-done/tick:delay-(--transition-duration-fast) group-data-done/tick:duration-slow group-data-done/tick:ease-out motion-safe:group-data-arrived/tick:starting:[stroke-dashoffset:1] motion-reduce:transition-opacity motion-reduce:[stroke-dashoffset:0] motion-reduce:opacity-0 motion-reduce:group-data-done/tick:opacity-100"
        />
      </svg>
    </span>
  );
}

/**
 * The step's name. In manual mode it labels the checkbox, and a click on it
 * toggles the step. A done step strikes through: the line sweeps across from
 * the start edge, over every wrapped line. A row that arrives done in
 * Completed sweeps as it lands.
 */
function ChecklistStepLabel({ className, children, ...props }: React.ComponentProps<'span'>) {
  const checklist = useChecklist('ChecklistStepLabel');
  const step = useStep('ChecklistStepLabel');
  const Tag = checklist.mode === 'manual' ? 'label' : 'span';
  return (
    <Tag
      id={step.labelId}
      htmlFor={checklist.mode === 'manual' ? step.controlId : undefined}
      data-slot="checklist-step-label"
      className={cn(
        'min-w-0 font-medium leading-5 [grid-area:label]',
        checklist.mode === 'manual' && 'cursor-pointer',
        className,
      )}
      {...(props as React.ComponentProps<'label'>)}
    >
      <span
        data-done={step.done ? '' : undefined}
        data-arrived={step.arrived ? '' : undefined}
        className="data-arrived:starting:text-foreground motion-safe:data-arrived:starting:[background-size:0%_1px] text-foreground data-done:text-muted-foreground bg-linear-to-r from-current to-current bg-no-repeat [background-position:0_55%] rtl:[background-position:100%_55%] [background-size:0%_1px] [transition:background-size_var(--transition-duration-moderate)_var(--ease-out),color_var(--transition-duration-moderate)_var(--ease-out)] data-done:[background-size:100%_1px] motion-safe:data-done:[transition:background-size_var(--transition-duration-slow)_var(--ease-out),color_var(--transition-duration-slow)_var(--ease-out)] motion-reduce:[transition:color_var(--transition-duration-moderate)_var(--ease-soft)]"
      >
        {children}
      </span>
      {checklist.mode === 'system' ? (
        <span className="sr-only">, {step.done ? checklist.doneLabel : checklist.openLabel}</span>
      ) : null}
    </Tag>
  );
}

/** A sentence under the label: what the step does or why it matters. */
function ChecklistStepDescription({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="checklist-step-description"
      className={cn('text-muted-foreground m-0 mt-0.5 [grid-area:description]', className)}
      {...props}
    />
  );
}

/** A short fact at the end of the label's line: an estimate, a date, an owner. */
function ChecklistStepDetail({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="checklist-step-detail"
      className={cn(
        'text-muted-foreground justify-self-end text-xs leading-5 tabular-nums whitespace-nowrap [grid-area:detail]',
        className,
      )}
      {...props}
    />
  );
}

/**
 * The one thing that does the step: a Button (pass `render` for a router
 * link) or a link styled as one. Shows while the step is open only.
 */
function ChecklistStepAction({ className, ...props }: React.ComponentProps<'div'>) {
  const step = useStep('ChecklistStepAction');
  if (step.done) return null;
  return (
    <div
      data-slot="checklist-step-action"
      className={cn(
        'mt-3 flex shrink-0 items-center justify-self-start [grid-area:action] @md:mt-0 @md:self-center @md:justify-self-end',
        className,
      )}
      {...props}
    />
  );
}

/**
 * A link to the guide that explains the step: an external ArrowLink. It opens
 * a new tab unless you pass `target`; a screen reader then hears
 * `newTabLabel` after the text. Shows on open and done steps.
 */
function ChecklistStepGuide({
  className,
  children,
  target = '_blank',
  rel = target === '_blank' ? 'noreferrer' : undefined,
  newTabLabel = '(opens in a new tab)',
  ...props
}: React.ComponentProps<'a'> & {
  /** Read after the text when the link opens a new tab. Default "(opens in a new tab)". */
  newTabLabel?: string;
}) {
  return (
    <ArrowLink
      direction="external"
      data-slot="checklist-step-guide"
      target={target}
      rel={rel}
      className={cn('mt-1 w-fit [grid-area:guide]', className)}
      {...props}
    >
      {children}
      {target === '_blank' ? <span className="sr-only"> {newTabLabel}</span> : null}
    </ArrowLink>
  );
}

/**
 * More content under an open step, across the row: the commands to run, a
 * short form. Shows while the step is open only.
 */
function ChecklistStepBody({ className, ...props }: React.ComponentProps<'div'>) {
  const step = useStep('ChecklistStepBody');
  if (step.done) return null;
  return (
    <div
      data-slot="checklist-step-body"
      className={cn('mt-3 min-w-0 [grid-area:body]', className)}
      {...props}
    />
  );
}

export {
  Checklist,
  ChecklistStep,
  ChecklistStepLabel,
  ChecklistStepDescription,
  ChecklistStepDetail,
  ChecklistStepAction,
  ChecklistStepGuide,
  ChecklistStepBody,
  reduceChecklistHold,
  checklistSection,
};
export type {
  ChecklistProps,
  ChecklistStepProps,
  ChecklistHold,
  ChecklistHoldEvent,
  ChecklistInput,
  ChecklistSection,
};
