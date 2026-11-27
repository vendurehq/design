'use client';

import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
import { cn } from '@vendure-io/ui/lib/utils';
import {
  type ComponentProps,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { warnDeprecated } from '../../lib/deprecated.ts';
import { formatElapsed, isoDuration } from '../../lib/format-elapsed.ts';
import { useMessages } from '../../lib/format-messages.ts';
// Relative: `time-tooltip` is internal.
import {
  sampleText,
  TimeSkeleton,
  TimeSpan,
  TimeTooltip,
  toTime,
  useReadersClock,
} from './time-tooltip.tsx';

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

type ElapsedTimeValue = string | number | Date | null | undefined;

interface ElapsedTimeProps extends Omit<ComponentProps<'time'>, 'dateTime' | 'children'> {
  /**
   * When the count started: a Date, an ISO string or epoch milliseconds.
   * `undefined` means not loaded yet and renders a one-line skeleton. `null`
   * and an invalid date render `fallback`.
   */
  from?: ElapsedTimeValue;
  /**
   * When the count stopped. With `to`, the text is fixed. Omitted,
   * `undefined` or `null` means it has not stopped: a live count that ticks
   * every second. `to` never shows a skeleton; only `from={undefined}` does.
   * When the end loads separately from the start, keep `from` `undefined`
   * until both are known, or the count runs live until `to` arrives.
   */
  to?: string | number | Date | null;
  /** @deprecated Use `from`. Removed in 4.0. */
  since?: ElapsedTimeValue;
  /** @deprecated Use `to`. Removed in 4.0. */
  until?: string | number | Date | null;
  /** Screen-reader text while `from` is `undefined`. @default `messages.elapsedTime.loading`, "Loading duration" */
  loadingLabel?: string;
  /**
   * Rendered for `null` or invalid input, and on the server and the first
   * client render of a server-rendered page (the server has no reader's
   * clock or locale). An app that renders only in the browser shows the count
   * from the first paint.
   * Default `'—'`.
   */
  fallback?: ReactNode;
  /**
   * Formats the elapsed milliseconds. Default `formatElapsed` in `locale`:
   * `1m 15s` in English.
   */
  format?: (ms: number) => string;
  /**
   * A tooltip on hover and focus. Default `false`. `true` shows when the
   * count started in the reader's locale (with `to`, the range and how
   * long it took). Pass content to show that instead. The tooltip content is
   * the accessible description too.
   */
  tooltip?: boolean | ReactNode;
  /**
   * Make the time a tab stop so keyboard users can open the tooltip. Default
   * `false`, and `true` under a status label (a StatusBadge `detail`). Never
   * inside interactive content such as a link or a button. Needs `tooltip`.
   */
  focusable?: boolean;
  /** The locale of the count and the tooltip times. Default: the FormatProvider's. */
  locale?: string;
}

/**
 * How long something has run, counting up every second: `31s`, `1m 15s`,
 * `1h 05m` in English, in the reader's locale from the FormatProvider. Use it for a state that is happening now (Building, Deploying) or
 * waiting (Queued).
 *
 * - The digits are tabular, so the text does not shift while it counts.
 * - It stops ticking while it is off screen or the tab is hidden, and catches
 *   up when it shows again. All timers on a page share one interval.
 * - The server and the first client render show `fallback`, also with
 *   `to`, so hydration matches; the count shows right after. In an app
 *   that renders only in the browser it shows from the first paint.
 * - It renders a `<time>` with the ISO duration (`PT1M15S`). Screen readers
 *   do not announce each tick.
 * - With `tooltip`, under a status label (a StatusBadge `detail`), the time is
 *   a tab stop and the tooltip opens beside the whole status block.
 */
function ElapsedTime({
  from: fromProp,
  since,
  to: toProp,
  until,
  fallback = '—',
  loadingLabel,
  format,
  tooltip = false,
  focusable,
  locale,
  className,
  ...props
}: ElapsedTimeProps) {
  if (since !== undefined) warnDeprecated('ElapsedTime', 'since', 'from');
  if (until !== undefined) warnDeprecated('ElapsedTime', 'until', 'to');
  const from = fromProp !== undefined ? fromProp : since;
  const to = toProp !== undefined ? toProp : until;
  const ref = useRef<HTMLTimeElement>(null);
  const descriptionId = useId();
  const settings = useFormatSettings();
  const t = useMessages('elapsedTime', { loading: loadingLabel });
  const start = toTime(from);
  const end = toTime(to);
  const live = start !== null && end === null;
  const active = useOnScreen(ref) && live;
  const subscribe = useCallback(
    (listener: () => void) => (active ? subscribeClock(listener) : noSubscription()),
    [active],
  );
  const now = useSyncExternalStore(subscribe, readClock, readServerClock);
  // A fixed count (`to`) does not need the clock, but its text and its
  // description depend on the reader's locale: the server renders the
  // fallback for it too, the same as RelativeTime.
  const readersClock = useReadersClock();

  const reference = end ?? now;
  const elapsed = start !== null && reference !== null ? reference - start : null;

  const timeProps = {
    'data-slot': 'elapsed-time',
    dateTime: elapsed === null ? undefined : isoDuration(elapsed),
    className: cn('tabular-nums', className),
    ...props,
  };
  const resolvedLocale = locale ?? settings.locale;

  if (from === undefined) {
    return (
      <TimeSkeleton
        slot="elapsed-time"
        // A typical count: "1m 15s" in English.
        sample={sampleText(
          () => (format ? format(75_000) : formatElapsed(75_000, { locale: resolvedLocale })),
          '1m 15s',
        )}
        loadingLabel={t.loading}
        className={className}
        {...props}
      />
    );
  }

  const text =
    elapsed === null || !readersClock
      ? fallback
      : format
        ? format(elapsed)
        : formatElapsed(elapsed, { locale: resolvedLocale });

  if (tooltip === false || tooltip === null || start === null) {
    return (
      <time ref={ref} {...timeProps}>
        {text}
      </time>
    );
  }

  const content =
    typeof tooltip !== 'boolean' ? (
      tooltip
    ) : end === null ? (
      new Date(start).toLocaleString(resolvedLocale, { timeZone: settings.timeZone })
    ) : (
      <TimeSpan start={start} end={end} locale={resolvedLocale} timeZone={settings.timeZone} />
    );
  const describedBy = [props['aria-describedby'], descriptionId].filter(Boolean).join(' ');

  return (
    <TimeTooltip
      content={content}
      focusable={focusable}
      render={<time ref={ref} {...timeProps} aria-describedby={describedBy} />}
    >
      {text}
      {/* A hidden child, so the component renders one element; aria-describedby still resolves it. */}
      <span id={descriptionId} hidden>
        {readersClock ? content : null}
      </span>
    </TimeTooltip>
  );
}

export { ElapsedTime, type ElapsedTimeProps };
