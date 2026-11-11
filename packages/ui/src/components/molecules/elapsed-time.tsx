'use client';

import { formatElapsed, isoDuration } from '@vendure-io/ui/lib/format-elapsed';
import { cn } from '@vendure-io/ui/lib/utils';
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';

// One shared clock for every timer on the page: one interval, whole seconds.
// It runs only while at least one visible timer listens.
const listeners = new Set<() => void>();
let clockNow = 0;
let clockTimer: ReturnType<typeof setInterval> | undefined;

function wholeSecond() {
  return Math.floor(Date.now() / 1000) * 1000;
}

function subscribeClock(listener: () => void) {
  listeners.add(listener);
  if (clockTimer === undefined) {
    clockNow = wholeSecond();
    clockTimer = setInterval(() => {
      clockNow = wholeSecond();
      for (const notify of listeners) notify();
    }, 1000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && clockTimer !== undefined) {
      clearInterval(clockTimer);
      clockTimer = undefined;
    }
  };
}

function readClock() {
  // Without a running clock, read the time now (to the second, so two reads
  // in one render agree).
  return clockTimer === undefined ? wholeSecond() : clockNow;
}

// The server has no reader's clock: it renders the fallback, and so does the
// first client render during hydration. The count starts right after.
function readServerClock(): number | null {
  return null;
}

function noSubscription() {
  return () => {};
}

function toTime(value: string | number | Date | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const time = (value instanceof Date ? value : new Date(value)).getTime();
  return Number.isNaN(time) ? null : time;
}

// True while the element is on screen and the tab is visible. Starts true, so
// a timer counts from its first render; the observer turns it off when the
// element is off screen.
function useOnScreen(element: React.RefObject<HTMLElement | null>) {
  const [onScreen, setOnScreen] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const node = element.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[entries.length - 1];
      if (entry) setOnScreen(entry.isIntersecting);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [element]);

  useEffect(() => {
    const update = () => setTabVisible(document.visibilityState !== 'hidden');
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  return onScreen && tabVisible;
}

interface ElapsedTimeProps extends Omit<ComponentProps<'time'>, 'dateTime' | 'children'> {
  /** When the count started: a Date, an ISO string or epoch milliseconds. */
  since: string | number | Date | null | undefined;
  /**
   * When the count stopped. Leave it out for a live count, which ticks every
   * second. With `until`, the text is fixed.
   */
  until?: string | number | Date | null;
  /**
   * Rendered for nullish or invalid input, and on the server and the first
   * client render of a live count (the server has no reader's clock).
   * Default `'—'`.
   */
  fallback?: ReactNode;
  /** Formats the elapsed milliseconds. Default `formatElapsed`: `1m 15s`. */
  format?: (ms: number) => string;
}

/**
 * How long something has run, counting up every second: `31s`, `1m 15s`,
 * `1h 05m`. Use it for a state that is happening now (Building, Deploying) or
 * waiting (Queued).
 *
 * - The digits are tabular, so the text does not shift while it counts.
 * - It stops ticking while it is off screen or the tab is hidden, and catches
 *   up when it shows again. All timers on a page share one interval.
 * - The server and the first client render show `fallback`, so hydration
 *   matches; the count starts right after.
 * - It renders a `<time>` with the ISO duration (`PT1M15S`). Screen readers
 *   do not announce each tick.
 */
function ElapsedTime({
  since,
  until,
  fallback = '—',
  format = formatElapsed,
  className,
  ...props
}: ElapsedTimeProps) {
  const ref = useRef<HTMLTimeElement>(null);
  const start = toTime(since);
  const end = toTime(until);
  const live = start !== null && end === null;
  const active = useOnScreen(ref) && live;
  const subscribe = useCallback(
    (listener: () => void) => (active ? subscribeClock(listener) : noSubscription()),
    [active],
  );
  const now = useSyncExternalStore(subscribe, readClock, readServerClock);

  const reference = end ?? now;
  const elapsed = start !== null && reference !== null ? reference - start : null;

  return (
    <time
      ref={ref}
      data-slot="elapsed-time"
      dateTime={elapsed === null ? undefined : isoDuration(elapsed)}
      className={cn('tabular-nums', className)}
      {...props}
    >
      {elapsed === null ? fallback : format(elapsed)}
    </time>
  );
}

export { ElapsedTime, type ElapsedTimeProps };
