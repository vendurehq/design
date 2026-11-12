import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import { contentInsetPull } from '@vendure-io/ui/lib/content-inset';
import type { Tone } from '@vendure-io/ui/lib/state-dictionary';
import {
  statusChipFill,
  statusChipLabel,
  statusChipRing,
  statusToneText,
  statusToneVars,
} from '@vendure-io/ui/lib/tint-recipes';
import { toneIcons } from '@vendure-io/ui/lib/tone-icons';
import { cn } from '@vendure-io/ui/lib/utils';
import { cva } from 'class-variance-authority';
import type * as React from 'react';
import { isValidElement } from 'react';
// Relative: `time-tooltip` is internal.
import { InStatusDetail } from './time-tooltip.tsx';

type StatusBadgeAppearance = 'chip' | 'bare' | 'icon' | 'text' | 'dot';
type StatusBadgeSize = 'default' | 'lg';
type StatusBadgeReveal = 'always' | 'row';

// The chip takes its tone in three places, all mixed from one `--status-tone`
// colour: a faint 5% tone wash over the `muted` fill, a 1px inset outline at
// 34%, and a label tinted 30% from `foreground-secondary` towards the tone. A
// row of chips stays calm, and each one still reads its state at a glance.
// The outline is an inset ring, not a border, so it adds no width. Forced
// colours drop box shadows, so a transparent 1px outline, inset by its own
// width, draws the chip's box there instead (still no width). There is
// no solid mode: solid/brand chips stay on the base `Badge` (accent rationing
// applied at the API level).
//
// Slot = tone, with two aliases: `critical` uses the `destructive` slots (the
// token keeps its shadcn-compatible name) and `progress` uses the `info`
// slots, so a chip in motion is blue before it lands on its outcome.
// `neutral` takes `neutral-text`: the muted grey in light mode, lifted in
// dark mode so a neutral chip does not read dim. `warning` draws its
// fill and outline in `warning-indicator`: mixed from `warning-text`, they
// read beige. Its label mixes 70% of `warning-text` instead. Class strings
// are static per tone so Tailwind's scanner picks them up.
//
// `--content-inset` is the distance from the box to the first letter: the
// start padding, plus the marker (13px icon or 6px dot, 14px icon in `lg`)
// and its 6px gap. A DataTable cell pulls the chip back by it, so the label
// lines up with the column header. `bare` has no padding, so only the marker
// counts.
const toneVars = statusToneVars satisfies Record<Tone, string>;

// `reveal="row"`: the badge is transparent at rest and fades in while its row
// (`group/row`) is hovered or holds keyboard focus, on one transition (150ms,
// ease-out), the same as the IdChip row reveal. It keeps its box, so nothing
// moves when it appears and the label still lines up with the column header.
// Only opacity changes, so reduced motion keeps the fade. Without hover
// (touch), the badge always shows. A tone change keeps its outline and fill
// transition, at the reveal's pace. Without `reveal`, a chip eases to a new
// tone over 300ms.
const rowRevealClass = [
  'transition-[opacity,box-shadow,background-color,color] duration-moderate ease-out',
  'opacity-0 group-hover/row:opacity-100 group-has-[:focus-visible]/row:opacity-100 [@media(hover:none)]:opacity-100',
];

const chipLabel = statusChipLabel;

const statusBadgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-lg font-medium',
    statusChipFill,
    statusChipRing,
    chipLabel,
    'outline-1 outline-transparent -outline-offset-1',
    contentInsetPull,
  ],
  {
    variants: {
      tone: toneVars,
      size: {
        default: [
          'h-6 gap-1.5 px-2.5 text-xs/none has-data-[slot=status-badge-marker]:pl-2',
          '[--content-inset:calc(var(--spacing)*2.5)] has-data-[marker=icon]:[--content-inset:calc(var(--spacing)*6.75)] has-data-[marker=dot]:[--content-inset:calc(var(--spacing)*5)]',
        ],
        lg: [
          'h-7 gap-1.5 px-3 text-sm/none has-data-[slot=status-badge-marker]:pl-2.5',
          '[--content-inset:calc(var(--spacing)*3)] has-data-[marker=icon]:[--content-inset:calc(var(--spacing)*7.5)] has-data-[marker=dot]:[--content-inset:calc(var(--spacing)*5.5)]',
        ],
      } satisfies Record<StatusBadgeSize, string[]>,
      reveal: {
        // A tone change eases the outline and label over 300ms; the hover
        // fill of a tooltip trigger answers in 120ms.
        always:
          '[transition:box-shadow_var(--transition-duration-slow),color_var(--transition-duration-slow),background-color_var(--transition-duration-quick)]',
        row: rowRevealClass,
      } satisfies Record<StatusBadgeReveal, string | string[]>,
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'default',
      reveal: 'always',
    },
  },
);

// The `bare` appearance: the chip without its box. The same icon and tinted
// label, no fill, outline or padding, for a state inside a tinted or accent
// surface, where a chip would be a box inside a box.
const bareVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap font-medium',
    chipLabel,
    contentInsetPull,
  ],
  {
    variants: {
      tone: toneVars,
      size: {
        default:
          'text-xs/none has-data-[marker=icon]:[--content-inset:calc(var(--spacing)*4.75)] has-data-[marker=dot]:[--content-inset:calc(var(--spacing)*3)]',
        lg: 'text-sm/none has-data-[marker=icon]:[--content-inset:calc(var(--spacing)*5)] has-data-[marker=dot]:[--content-inset:calc(var(--spacing)*3)]',
      } satisfies Record<StatusBadgeSize, string>,
      reveal: {
        always: 'transition-colors duration-slow',
        row: rowRevealClass,
      } satisfies Record<StatusBadgeReveal, string | string[]>,
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'default',
      reveal: 'always',
    },
  },
);

// The `icon` appearance: the tone icon with no box, then the label in neutral
// text, and an optional second line under it. It is the status of a table row
// that every row has. A grid puts the icon in a column of its own, spanning
// both lines and centred against them, and the second line under the label.
// With a second line, the lines are 18px and 15px high (`text-sm/4.5`,
// `text-xs/3.75`): 33px, and a DataTable cell drops to 6px vertical padding
// for it (`py-1.5`), so the row is 46px with its divider. The 16px icon and its 8px gap make
// the `--content-inset`, so the label lines up with the column header.
const iconAppearanceClass = [
  'inline-grid w-fit shrink-0 grid-cols-[auto_auto] items-center gap-x-2 whitespace-nowrap text-sm text-foreground-secondary',
  '[--content-inset:calc(var(--spacing)*6)]',
  contentInsetPull,
];

// The marker colour of each tone: the icon or spinner stroke.
const toneText: Record<Tone, string> = statusToneText;

// The dot fill of each tone. A dot is a filled shape, not a stroke or a
// word, so warning takes `warning-indicator`, the amber the warning chip
// fill mixes from: in `warning-text` the dot reads brown.
const toneDot: Record<Tone, string> = {
  ...toneText,
  warning: 'text-warning-indicator',
};

// The `text` appearance: the word itself carries the tone. A neutral word
// steps down to muted text at the same weight, so the column stays quiet and
// every word in it has the same weight.
const toneWord: Record<Tone, string> = {
  neutral: 'text-muted-foreground',
  info: 'text-info-text',
  success: 'text-success-text',
  warning: 'text-warning-text',
  critical: 'text-destructive-text',
  progress: 'text-info-text',
};

// The focus ring of a badge that opens a tooltip: the system's 2px ring, 2px
// out, on the badge's radius (4px for a word or a bare badge). At rest a chip
// keeps its transparent forced-colours outline.
const triggerFocus =
  'focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring';

// One revolution per 1.6s: slower than the default spin, so a status that
// stays in progress for minutes does not read as urgent. Under reduced motion
// the spinner stands still; the icon shape still says "in motion".
const spinnerClass = 'animate-spin-slow motion-reduce:animate-none';

// The icon a chip shows when the caller passes none comes from `toneIcons`,
// the map the toast reads too. `progress` always spins its loader.
const ProgressIcon = toneIcons.progress;

interface StatusBadgeProps extends useRender.ComponentProps<'span'> {
  /** Semantic tone. Defaults to `neutral`. */
  tone?: Tone;
  /**
   * How the status renders.
   * - `chip` (default): a tinted chip with a tone outline.
   * - `bare`: the chip's icon and tinted label without the box. Use it for a
   *   state inside a tinted or accent surface (a card that is already
   *   coloured), where a chip would be a box inside a box.
   * - `icon`: the tone icon with no box, then the label in neutral text, with
   *   an optional second line (`detail`). Use it for a status every row of a
   *   table shows (a deployments table).
   * - `text`: only the word, in the tone colour. Not for a table column:
   *   a column uses `icon`.
   * - `dot`: a lone 7px tone dot. The label stays in the DOM as screen-reader
   *   text. Use it only where there is no room for a word.
   * @default 'chip'
   */
  appearance?: StatusBadgeAppearance;
  /** Chip height: `default` (24px) or `lg` (28px, for page headers). For `bare`, the matching text and icon size. Only for `appearance="chip"` and `"bare"`. @default 'default' */
  size?: StatusBadgeSize;
  /**
   * Show a leading dot in the tone colour in place of the tone icon, for a
   * group of chips that is not a list column (a list column uses
   * `appearance="icon"`). Only for `appearance="chip"` and `"bare"`. `progress` keeps its
   * spinner, regardless of this prop.
   */
  dot?: boolean;
  /**
   * The leading icon, in the tone colour. Only for `appearance="chip"`, `"bare"` and `"icon"`.
   * - Leave it out for the tone's own icon: `CircleCheck` (success),
   *   `TriangleAlert` (warning), `CircleX` (critical), `CircleDot` (info),
   *   `CircleDashed` (neutral) and a spinning `Loader` (progress).
   * - Pass a lucide icon element for a state whose shape says more, e.g.
   *   `<MoonStarIcon />` for Asleep. It replaces the dot and the spinner too.
   * - Pass `false` or `null` for no icon, on an inline chip whose label
   *   already names the tone. `progress` still shows its spinner, and `dot`
   *   still shows the dot. `appearance="icon"` always shows an icon.
   *
   * Never put an icon in `children`: the chip already brings one.
   */
  icon?: React.ReactNode;
  /**
   * `'row'` shows the badge only while its table row is hovered or holds
   * keyboard focus. Pass it for the normal state of a list column (for
   * example "Enabled"), and leave it out for the other states ("Disabled"),
   * so only the exceptions show at rest. The badge stays in the layout and in
   * the accessibility tree. The row needs the `group/row` class (the
   * `DataTable` rows have it). @default 'always'
   */
  reveal?: StatusBadgeReveal;
  /**
   * A second line under the label, in small muted text, for
   * `appearance="icon"` only. Put one time in it, the one that matters for
   * the state: an `ElapsedTime` for a state that is happening or waiting, a
   * `RelativeTime` for when it finished ("2 minutes ago"), and a
   * `RelativeTime` with `display="duration"` for how long a state that
   * continues has lasted ("for 13 days"). The icon centres against both lines
   * together. A time here with a tooltip is a tab stop, and its tooltip opens
   * beside the status block, so the label stays readable.
   */
  detail?: React.ReactNode;
}

function StatusBadge({
  className,
  tone = 'neutral',
  appearance = 'chip',
  size = 'default',
  dot = false,
  icon,
  reveal = 'always',
  detail,
  render,
  children,
  ...props
}: StatusBadgeProps) {
  // The component never transforms or translates the label — children win.
  // A consumer passes their translated string; `defaultLabel` from the
  // dictionary is a fallback the caller resolves, not something rendered here.
  let classes: string;
  let content: React.ReactNode;
  const hasDetail =
    appearance === 'icon' && detail !== undefined && detail !== null && detail !== false;

  if (appearance === 'dot') {
    content = <span className="sr-only">{children}</span>;
    // A lone dot stays still, also in progress: it marks a state in a
    // breadcrumb or a menu, where motion would pull the eye from the page.
    classes = cn(
      'inline-flex size-1.75 shrink-0 rounded-full bg-current',
      toneDot[tone],
      reveal === 'row' && rowRevealClass,
    );
  } else if (appearance === 'icon') {
    classes = cn(iconAppearanceClass, reveal === 'row' && rowRevealClass);
    content = (
      <>
        <StatusBadgeMarker
          tone={tone}
          size="icon"
          dot={false}
          // The icon always shows here: it carries the tone.
          icon={isValidElement(icon) ? icon : undefined}
          className={hasDetail ? 'row-span-2' : undefined}
        />
        <span data-slot="status-badge-label" className={hasDetail ? 'leading-4.5' : undefined}>
          {children}
        </span>
        {hasDetail ? (
          <span
            data-slot="status-badge-detail"
            className="col-start-2 text-xs/3.75 text-muted-foreground tabular-nums"
          >
            {/* A RelativeTime or ElapsedTime here is a tab stop, and its
                tooltip opens beside the whole status block. */}
            <InStatusDetail.Provider value={true}>{detail}</InStatusDetail.Provider>
          </span>
        ) : null}
      </>
    );
  } else if (appearance === 'text') {
    classes = cn(
      'inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium',
      toneWord[tone],
      reveal === 'row' && rowRevealClass,
    );
    // The spinner comes after the word, so every word in a column starts on
    // the same edge.
    content = (
      <>
        {children}
        {tone === 'progress' ? (
          <ProgressIcon aria-hidden className={cn('size-3 shrink-0 stroke-2', spinnerClass)} />
        ) : null}
      </>
    );
  } else {
    classes =
      appearance === 'bare'
        ? bareVariants({ tone, size, reveal })
        : statusBadgeVariants({ tone, size, reveal });
    content = (
      <>
        <StatusBadgeMarker tone={tone} size={size} dot={dot} icon={icon} />
        {children}
      </>
    );
  }

  // As a TooltipTrigger render target, the badge explains its state on hover
  // and on focus, so it is a tab stop with the focus ring. A chip also takes
  // the hover fill in place of its tone wash. A lone dot stays out of the tab
  // order: it is too small to be a target.
  const isTrigger = 'data-tooltip-trigger' in props && appearance !== 'dot';

  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {
        className: cn(
          classes,
          isTrigger && triggerFocus,
          isTrigger && (appearance === 'chip' ? 'hover:bg-accent' : 'rounded-md'),
          className,
        ),
        tabIndex: isTrigger ? 0 : undefined,
      },
      props,
      { children: content },
    ),
    render,
    state: {
      slot: 'status-badge',
      tone,
      appearance,
      // `data-reveal="row"` only when the badge reveals.
      reveal: reveal === 'row' ? 'row' : undefined,
      // `data-detail` when a second line shows: a DataTable cell takes less
      // vertical padding for it.
      detail: hasDetail || undefined,
    },
  });
}

function StatusBadgeMarker({
  tone,
  size,
  dot,
  icon,
  className,
}: {
  tone: Tone;
  size: StatusBadgeSize | 'icon';
  dot: boolean;
  icon: React.ReactNode;
  className?: string;
}) {
  // 13px icons in the 12px chip, 14px in the 13px chip, 16px beside the
  // 13px label of the `icon` appearance, all at stroke 2. The
  // marker eases to a new tone with the outline, when a status changes in place.
  // Size and stroke are `!important`: a Button sizes every icon inside it to
  // 16px at stroke 1.75, with a selector that outranks this one, and a badge
  // inside a Button keeps its own icon.
  const iconClasses = cn(
    'inline-flex shrink-0 transition-colors duration-slow [&_svg]:shrink-0 [&_svg]:stroke-2!',
    size === 'icon'
      ? '[&_svg]:size-4!'
      : size === 'lg'
        ? '[&_svg]:size-3.5!'
        : '[&_svg]:size-3.25!',
    toneText[tone],
    className,
  );

  if (isValidElement(icon)) {
    return (
      <span aria-hidden data-marker="icon" data-slot="status-badge-marker" className={iconClasses}>
        {icon}
      </span>
    );
  }

  // `progress` keeps its spinner over a dot and without an icon: the motion is
  // its meaning, and without it the chip looks like `info`.
  if (tone === 'progress') {
    return (
      <span aria-hidden data-marker="icon" data-slot="status-badge-marker" className={iconClasses}>
        <ProgressIcon className={spinnerClass} />
      </span>
    );
  }

  if (!dot) {
    // `false`, `null` and any other value that is not an element (`''`, `0`)
    // mean no icon. Only a left-out `icon` gets the tone's own.
    if (icon !== undefined) return null;
    const ToneIcon = toneIcons[tone];
    return (
      <span aria-hidden data-marker="icon" data-slot="status-badge-marker" className={iconClasses}>
        <ToneIcon />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      data-marker="dot"
      data-slot="status-badge-marker"
      className={cn('size-1.5 shrink-0 rounded-full bg-current', toneDot[tone])}
    />
  );
}

export { StatusBadge, statusBadgeVariants };
export type { StatusBadgeAppearance, StatusBadgeProps, StatusBadgeReveal, StatusBadgeSize };
