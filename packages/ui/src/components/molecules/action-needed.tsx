'use client';

import { buttonVariants } from '@vendure-io/ui/components/atoms/button';
import { StatusBadge } from '@vendure-io/ui/components/molecules/status-badge';
import { toneIcons } from '@vendure-io/ui/lib/tone-icons';
import { cn } from '@vendure-io/ui/lib/utils';
import { ChevronDown } from 'lucide-react';
import {
  type ComponentProps,
  type CSSProperties,
  type ReactNode,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

/** The tones a finding can have, worst first. */
export const ACTION_NEEDED_TONES = ['critical', 'warning', 'info'] as const;
export type ActionNeededTone = (typeof ACTION_NEEDED_TONES)[number];

/** One finding. `key` names the occurrence: a key the fold memory has not seen opens the list. */
export interface ActionNeededItem {
  key: string;
  tone: ActionNeededTone;
  /** A short label: "Default superadmin password". */
  title: ReactNode;
  /** One sentence on what is wrong and what it costs. */
  description?: ReactNode;
  /** One action that fixes it, usually a small outline Button that opens the page. */
  action?: ReactNode;
  /** Replaces the tone icon. */
  icon?: ReactNode;
}

const RANK: Record<ActionNeededTone, number> = { critical: 0, warning: 1, info: 2 };

/** The number of findings of each tone, worst first, without the tones that have none. */
export function actionNeededCounts(items: readonly Pick<ActionNeededItem, 'tone'>[]) {
  return ACTION_NEEDED_TONES.map((tone) => ({
    tone,
    count: items.filter((item) => item.tone === tone).length,
  })).filter(({ count }) => count > 0);
}

/*
 * Fold memory. Every fold and every opening stores the choice with the keys of the findings that
 * were shown, under a memory key. On load, a finding whose key is not stored opens the list again.
 * Without new findings, the stored choice applies. Without a stored choice (the first visit), the
 * list starts as `defaultOpen` says.
 */

/** The part of `Storage` the fold memory uses, so a host can pass its own store. */
export type FoldMemoryStorage = Pick<Storage, 'getItem' | 'setItem'>;
export type FoldMemory = { open: boolean; keys: readonly string[] };

const foldStorageKey = (memoryKey: string) => `vendure-ui:action-needed:fold:${memoryKey}`;

/** The stored choice, or null when nothing is stored or the stored value has another shape. */
export function readFoldMemory(storage: FoldMemoryStorage, memoryKey: string): FoldMemory | null {
  try {
    const value: unknown = JSON.parse(storage.getItem(foldStorageKey(memoryKey)) ?? 'null');
    if (typeof value !== 'object' || value === null) return null;
    const { open, keys } = value as Record<string, unknown>;
    if (typeof open !== 'boolean' || !Array.isArray(keys)) return null;
    return { open, keys: keys.filter((key): key is string => typeof key === 'string') };
  } catch {
    // A value that is not JSON, or a storage that throws, counts as nothing stored.
    return null;
  }
}

export function storeFoldMemory(storage: FoldMemoryStorage, memoryKey: string, memory: FoldMemory) {
  try {
    storage.setItem(foldStorageKey(memoryKey), JSON.stringify(memory));
  } catch {
    // A full or blocked storage only loses the memory.
  }
}

/** Whether the list opens: when the memory says open, or for a key the memory has not seen. */
export function opensOnLoad(memory: FoldMemory, keys: readonly string[]): boolean {
  return memory.open || keys.some((key) => !memory.keys.includes(key));
}

function browserStorage(): FoldMemoryStorage | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    // Reading localStorage throws where storage is blocked.
    return null;
  }
}

interface FoldOptions {
  keys: readonly string[];
  memoryKey: string | undefined;
  storage: FoldMemoryStorage | null | undefined;
  open: boolean | undefined;
  defaultOpen: boolean;
  onOpenChange: ((open: boolean) => void) | undefined;
}

/**
 * The open state of the list. Stored choices are read in a layout effect, so a server render and
 * the first client render agree, and the list never paints in the wrong state. The choice is
 * re-read when the memory key changes (another channel), and a key that was not seen opens the
 * list. In controlled mode the hook only calls `onOpenChange`.
 */
function useFold({ keys, memoryKey, storage, open, defaultOpen, onOpenChange }: FoldOptions) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen);
  const controlled = open !== undefined;
  const current = controlled ? open : uncontrolled;
  // The memory of this visit, per memory key: it stands in when there is no storage or no key,
  // so a new finding still opens the list.
  const session = useRef(new Map<string, FoldMemory>());
  const latest = useRef({ current, controlled, onOpenChange, defaultOpen, storage });
  latest.current = { current, controlled, onOpenChange, defaultOpen, storage };
  const keyString = keys.join('\n');

  useLayoutEffect(() => {
    const { current, controlled, onOpenChange, defaultOpen, storage } = latest.current;
    const ids = keyString ? keyString.split('\n') : [];
    const store = storage === undefined ? browserStorage() : storage;
    const slot = memoryKey ?? '';
    const memory =
      (store && memoryKey !== undefined ? readFoldMemory(store, memoryKey) : null) ??
      session.current.get(slot) ??
      null;
    if (memory === null) session.current.set(slot, { open: defaultOpen, keys: ids });
    const next = memory === null ? defaultOpen : opensOnLoad(memory, ids);
    if (next === current) return;
    if (controlled) onOpenChange?.(next);
    else setUncontrolled(next);
  }, [memoryKey, keyString]);

  const toggle = () => {
    const next = !current;
    const memory = { open: next, keys };
    session.current.set(memoryKey ?? '', memory);
    const store = storage === undefined ? browserStorage() : storage;
    if (store && memoryKey !== undefined) storeFoldMemory(store, memoryKey, memory);
    if (!controlled) setUncontrolled(next);
    onOpenChange?.(next);
  };

  return { open: current, toggle };
}

/**
 * Whether a new row enters with motion. The rows that are there when the host reveals the list
 * take their place at once, so they push nothing down. A row that arrives after that enters. A
 * list that mounts revealed lets every row enter.
 */
function useEntersOnScreen(revealed: boolean, keyString: string) {
  const [enters, setEnters] = useState(revealed);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  if (!enters && revealed) {
    if (revealedKey === null) setRevealedKey(keyString);
    else if (revealedKey !== keyString) setEnters(true);
  }
  return enters;
}

// The colour of the tone icon on a row. Warning takes the brighter indicator amber, as the
// StatusBadge and the Alert do: the amber text colour reads brown at icon size.
const toneIconClass: Record<ActionNeededTone, string> = {
  critical: 'text-destructive-text',
  warning: 'text-warning-indicator',
  info: 'text-info-text',
};

const DEFAULT_COUNT_WORDS: Record<ActionNeededTone, readonly [one: string, other: string]> = {
  critical: ['error', 'errors'],
  warning: ['warning', 'warnings'],
  info: ['note', 'notes'],
};

/** The default badge text: the count and the tone word, singular for one ("1 error", "2 warnings"). */
function defaultCountLabel(count: number, tone: ActionNeededTone): string {
  const [one, other] = DEFAULT_COUNT_WORDS[tone];
  return `${count} ${count === 1 ? one : other}`;
}

/*
 * Motion. Folded: one count badge per tone. Opening: the badges fade out, then each row opens
 * from its own slot (grid rows 0fr to 1fr) and fades down 4px into place, 50ms apart, worst
 * first. Folding plays it in reverse, a bit faster. Only CSS transitions, so a second click
 * starts from where the motion is. --i is the index from the top, --r the index from the bottom.
 * Reduced motion: the badges and the rows only fade. The height and the chevron snap.
 */
const badgeClass = cn(
  'inline-flex',
  'motion-safe:[transition-property:opacity,scale,filter] motion-safe:duration-fold-badge-in motion-safe:ease-fold motion-safe:delay-[calc(var(--transition-duration-fold-hand-off)+var(--i)*var(--transition-duration-fold-step))]',
  'data-open:opacity-0 motion-safe:data-open:scale-95 motion-safe:data-open:blur-[2px] motion-safe:data-open:duration-moderate motion-safe:data-open:delay-[calc(var(--i)*var(--transition-duration-fold-step))]',
  'motion-reduce:transition-opacity motion-reduce:duration-moderate motion-reduce:ease-linear',
);

const slotClass = cn(
  'grid grid-rows-[0fr] data-open:grid-rows-[1fr]',
  'motion-safe:[transition:grid-template-rows_var(--transition-duration-fold-close)_var(--ease-fold)_calc(var(--r)*var(--transition-duration-fold-step))]',
  'motion-safe:data-open:[transition:grid-template-rows_var(--transition-duration-fold-open)_var(--ease-height)_calc(var(--transition-duration-fold-hand-off)+var(--i)*var(--transition-duration-fold-stagger))]',
  // A row that arrives while the list is open and on screen opens from its own slot.
  'motion-safe:data-enter:data-open:starting:grid-rows-[0fr]',
);

const rowMotionClass = cn(
  'opacity-0 data-open:opacity-100 motion-safe:-translate-y-1 motion-safe:data-open:translate-y-0',
  'motion-safe:[transition:opacity_var(--transition-duration-fold-row-out)_var(--ease-fold)_calc(var(--r)*var(--transition-duration-fold-step)),translate_var(--transition-duration-fold-row-out)_var(--ease-fold)_calc(var(--r)*var(--transition-duration-fold-step))]',
  'motion-safe:data-open:[transition:opacity_var(--transition-duration-fold-row-in)_var(--ease-height)_calc(var(--transition-duration-fold-hand-off)+var(--transition-duration-fold-step)+var(--i)*var(--transition-duration-fold-stagger)),translate_var(--transition-duration-fold-row-in)_var(--ease-height)_calc(var(--transition-duration-fold-hand-off)+var(--transition-duration-fold-step)+var(--i)*var(--transition-duration-fold-stagger))]',
  'motion-reduce:transition-opacity motion-reduce:duration-moderate motion-reduce:ease-linear',
  'data-enter:data-open:starting:opacity-0 motion-safe:data-enter:data-open:starting:-translate-y-1',
);

// The chevron turns when the list opens. On hover of the fold row it darkens and moves 1px its way.
const chevronClass = cn(
  'size-5! text-foreground-secondary',
  'motion-safe:[transition-property:rotate,translate,color] motion-safe:duration-normal motion-safe:ease-out motion-reduce:transition-colors motion-reduce:duration-normal',
  'group-hover/action-needed-trigger:text-foreground motion-safe:group-hover/action-needed-trigger:translate-y-px',
  'group-aria-expanded/action-needed-trigger:rotate-180 motion-safe:group-aria-expanded/action-needed-trigger:group-hover/action-needed-trigger:-translate-y-px',
);

type ActionNeededRowProps = Omit<ComponentProps<'div'>, 'title'> &
  Pick<ActionNeededItem, 'tone' | 'title' | 'description' | 'action' | 'icon'>;

/**
 * One finding as a plain row: the tone icon, the title and its sentence, and the action at the
 * end. The tone is on the icon only. From a 28rem-wide row down, the action moves under the text.
 */
function ActionNeededRow({
  tone,
  title,
  description,
  action,
  icon,
  className,
  ...props
}: ActionNeededRowProps) {
  const ToneIcon = toneIcons[tone];
  return (
    <div
      data-slot="action-needed-row"
      data-tone={tone}
      className={cn(
        '@container/action-needed-row grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 py-3 text-sm',
        className,
      )}
      {...props}
    >
      <span
        data-slot="action-needed-icon"
        className={cn(
          'row-span-2 flex h-lh items-center self-start [&_svg:not([class*=size-])]:size-4 [&_svg:not([class*=stroke-])]:stroke-[1.75]',
          toneIconClass[tone],
        )}
      >
        {icon ?? <ToneIcon aria-hidden />}
      </span>
      <div data-slot="action-needed-text" className="col-start-2 row-span-2 min-w-0">
        <div data-slot="action-needed-title" className="font-medium text-foreground">
          {title}
        </div>
        {description ? (
          <div data-slot="action-needed-description" className="text-pretty text-muted-foreground">
            {description}
          </div>
        ) : null}
      </div>
      {action ? (
        <div
          data-slot="action-needed-action"
          className="col-start-3 row-span-2 row-start-1 flex items-center gap-2 ps-3 @max-md/action-needed-row:col-start-2 @max-md/action-needed-row:row-span-1 @max-md/action-needed-row:row-start-3 @max-md/action-needed-row:mt-2 @max-md/action-needed-row:ps-0"
        >
          {action}
        </div>
      ) : null}
    </div>
  );
}

type ActionNeededProps<T extends ActionNeededItem> = Omit<
  ComponentProps<'div'>,
  'children' | 'defaultValue'
> & {
  /** The findings. They show worst first; findings of one tone keep their order. */
  items: readonly T[];
  /** Renders one finding. Default: an `ActionNeededRow` of the item's parts. */
  renderItem?: (item: T) => ReactNode;
  /** The fold row's text. Default "Action needed". Not shown when `title` is set. */
  label?: ReactNode;
  /**
   * Header mode: the card's own title, such as "Store setup". The card header becomes the fold
   * row: the title, the count badges after it, the chevron at the end and `description` under
   * the title. Render the ActionNeeded as the only child of a Card; it takes the card's padding.
   */
  title?: ReactNode;
  /** Header mode: the line under the title. */
  description?: ReactNode;
  /**
   * The text of one folded count badge, such as "2 warnings". Pass it to translate the badges
   * with the plural rules of the language. Default: English, "1 error", "2 warnings", "3 notes".
   */
  countLabel?: (count: number, tone: ActionNeededTone) => ReactNode;
  /** Names the fold memory, such as a channel id. Without it, the choice lasts for this visit. */
  memoryKey?: string;
  /** Where the fold memory lives. Default `localStorage`. `null` keeps it for this visit only. */
  storage?: FoldMemoryStorage | null;
  /** Controlled open state. */
  open?: boolean;
  /** Open state on the first visit, before anything is stored. Default `true`. */
  defaultOpen?: boolean;
  /** Called with the new state when the user folds or opens the list, or a new finding opens it. */
  onOpenChange?: (open: boolean) => void;
  /**
   * False while the host keeps the list hidden until its layout is known. The rows there when it
   * turns true take their place at once; rows that arrive later enter with motion. Default `true`.
   */
  revealed?: boolean;
};

/**
 * "Action needed": a fold row with one count badge per tone, over a list of findings with a
 * divider between rows. The whole fold row opens and folds the list. The rows stay in the page
 * while folded, inert, so the motion runs both ways. A finding with a key the memory has not seen
 * opens the list again. Renders nothing without findings.
 *
 * With `title`, the card header is the fold row instead: the title, the badges after it, the
 * chevron at the end and the description under the title. The badges stay in both states.
 */
function ActionNeeded<T extends ActionNeededItem>({
  items,
  renderItem,
  label = 'Action needed',
  title,
  description,
  countLabel = defaultCountLabel,
  memoryKey,
  storage,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  revealed = true,
  className,
  ...props
}: ActionNeededProps<T>) {
  const sorted = [...items].sort((a, b) => RANK[a.tone] - RANK[b.tone]);
  const keys = sorted.map((item) => item.key);
  const { open, toggle } = useFold({
    keys,
    memoryKey,
    storage,
    open: openProp,
    defaultOpen,
    onOpenChange,
  });
  const enters = useEntersOnScreen(revealed, keys.join('\n'));
  const listId = useId();
  const state = { 'data-open': open || undefined, 'data-enter': enters || undefined };
  const header = title !== undefined;

  if (sorted.length === 0) return null;

  return (
    <div
      data-slot="action-needed"
      data-mode={header ? 'header' : 'label'}
      {...state}
      className={cn(
        'flex flex-col',
        // Header mode fills the card: it takes over the card's vertical padding, so the whole
        // header is the fold row, and the badges stay put, so the rows start without a hand-off.
        header && '-my-(--card-gap) [--transition-duration-fold-hand-off:0ms]',
        className,
      )}
      {...props}
    >
      <button
        aria-controls={listId}
        aria-expanded={open}
        data-slot="action-needed-trigger"
        className={cn(
          'group/action-needed-trigger flex w-full cursor-pointer text-start text-sm outline-none',
          header
            ? 'items-start gap-3 py-(--card-gap) ps-(--card-ps) pe-(--card-px) focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset rounded-2xl'
            : 'min-h-9 items-center gap-2.5 rounded-md focus-visible:ring-2 focus-visible:ring-ring',
        )}
        type="button"
        onClick={toggle}
      >
        {header ? (
          <span className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span
                data-slot="action-needed-heading"
                className="font-heading text-sm font-semibold tracking-[-0.005em] text-foreground"
              >
                {title}
              </span>
              <span
                data-slot="action-needed-counts"
                className="flex flex-wrap items-center gap-1.5"
              >
                {actionNeededCounts(sorted).map(({ tone, count }, index) => (
                  <span
                    key={tone}
                    data-slot="action-needed-count"
                    {...state}
                    className={header ? 'inline-flex' : badgeClass}
                    style={{ '--i': index } as CSSProperties}
                  >
                    <StatusBadge
                      className="tabular-nums"
                      size={header ? 'default' : 'lg'}
                      tone={tone}
                    >
                      {countLabel(count, tone)}
                    </StatusBadge>
                  </span>
                ))}
              </span>
            </span>
            {description ? (
              <span
                data-slot="action-needed-description"
                className="text-sm text-foreground-secondary"
              >
                {description}
              </span>
            ) : null}
          </span>
        ) : (
          <>
            <span data-slot="action-needed-label" className="shrink-0 font-medium text-foreground">
              {label}
            </span>
            <span
              aria-hidden={open || undefined}
              data-slot="action-needed-counts"
              className="flex min-w-0 flex-wrap items-center gap-1.5"
            >
              {actionNeededCounts(sorted).map(({ tone, count }, index) => (
                <span
                  key={tone}
                  data-slot="action-needed-count"
                  {...state}
                  className={header ? 'inline-flex' : badgeClass}
                  style={{ '--i': index } as CSSProperties}
                >
                  <StatusBadge
                    className="tabular-nums"
                    size={header ? 'default' : 'lg'}
                    tone={tone}
                  >
                    {countLabel(count, tone)}
                  </StatusBadge>
                </span>
              ))}
            </span>
          </>
        )}
        {/* The row is the toggle. The chevron only looks like a button: a hover anywhere on the
            row gives it the ghost hover fill, so the row reads as clickable. */}
        <span
          aria-hidden
          className={cn(
            buttonVariants({ size: 'icon-sm', variant: 'ghost' }),
            header && '-my-1 shrink-0',
            'ms-auto group-hover/action-needed-trigger:bg-muted group-hover/action-needed-trigger:text-foreground',
          )}
        >
          {/* A wrapper, so the Button's own icon transition (on its direct svg child) does not
              replace the chevron's. */}
          <span className="flex">
            <ChevronDown
              data-slot="action-needed-chevron"
              className={chevronClass}
              strokeWidth={2.25}
            />
          </span>
        </span>
      </button>
      <div
        id={listId}
        role="list"
        data-slot="action-needed-list"
        className={cn(header && 'ps-(--card-ps) pe-(--card-px)')}
      >
        {sorted.map((item, index) => (
          <div
            key={item.key}
            role="listitem"
            data-slot="action-needed-slot"
            {...state}
            className={slotClass}
            style={{ '--i': index, '--r': sorted.length - 1 - index } as CSSProperties}
          >
            <div className="min-h-0 overflow-hidden" inert={!open}>
              {/* The divider moves with its row, so a folding row takes its line with it. */}
              <div
                data-slot="action-needed-item"
                {...state}
                className={cn(
                  rowMotionClass,
                  'border-t border-border',
                  // Header mode: the card's bottom padding folds away with the last row.
                  header && index === sorted.length - 1 && 'mb-(--card-gap)',
                )}
              >
                {renderItem ? (
                  renderItem(item)
                ) : (
                  <ActionNeededRow
                    action={item.action}
                    description={item.description}
                    icon={item.icon}
                    title={item.title}
                    tone={item.tone}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export { ActionNeeded, ActionNeededRow, type ActionNeededProps, type ActionNeededRowProps };
