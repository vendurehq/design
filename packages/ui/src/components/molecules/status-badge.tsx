import { mergeProps } from '@base-ui/react/merge-props';
import { useRender } from '@base-ui/react/use-render';
import type { Tone } from '@vendure-io/ui/lib/state-dictionary';
import { cn } from '@vendure-io/ui/lib/utils';
import { cva } from 'class-variance-authority';
import {
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  CircleXIcon,
  LoaderIcon,
  type LucideIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import type * as React from 'react';
import { isValidElement } from 'react';

type StatusBadgeAppearance = 'chip' | 'bare' | 'text' | 'dot';
type StatusBadgeSize = 'default' | 'lg';

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
// `neutral` takes the muted text colour as its tone. `warning` draws its
// fill and outline in `warning-indicator`: mixed from `warning-text`, they
// read beige. Its label mixes 70% of `warning-text` instead. Class strings
// are static per tone so Tailwind's scanner picks them up.
const toneVars = {
  neutral: '[--status-tone:var(--muted-foreground)]',
  info: '[--status-tone:var(--info-text)]',
  success: '[--status-tone:var(--success-text)]',
  warning:
    '[--status-label-mix:70%] [--status-label-tone:var(--warning-text)] [--status-tone:var(--warning-indicator)]',
  critical: '[--status-tone:var(--destructive-text)]',
  progress: '[--status-tone:var(--info-text)]',
} satisfies Record<Tone, string>;

// The label colour every chip shares: 30% of the tone (70% of `warning-text`
// for warning) into `foreground-secondary`.
const chipLabel =
  'text-[color-mix(in_oklab,var(--status-label-tone,var(--status-tone))_var(--status-label-mix,30%),var(--foreground-secondary))]';

const statusBadgeVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-lg font-medium leading-none',
    'bg-[color-mix(in_oklab,var(--status-tone)_5%,var(--muted))] inset-ring inset-ring-[color-mix(in_oklab,var(--status-tone)_34%,transparent)]',
    chipLabel,
    'outline-1 outline-transparent -outline-offset-1',
    'transition-[box-shadow,background-color,color] duration-slow',
  ],
  {
    variants: {
      tone: toneVars,
      size: {
        default: 'h-6 gap-1.5 px-2.5 text-xs has-data-[slot=status-badge-marker]:pl-2',
        lg: 'h-7 gap-1.5 px-3 text-sm has-data-[slot=status-badge-marker]:pl-2.5',
      } satisfies Record<StatusBadgeSize, string>,
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'default',
    },
  },
);

// The `bare` appearance: the chip without its box. The same icon and tinted
// label, no fill, outline or padding, for a state inside a tinted or accent
// surface, where a chip would be a box inside a box.
const bareVariants = cva(
  [
    'inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap font-medium leading-none',
    chipLabel,
    'transition-colors duration-slow',
  ],
  {
    variants: {
      tone: toneVars,
      size: {
        default: 'text-xs',
        lg: 'text-sm',
      } satisfies Record<StatusBadgeSize, string>,
    },
    defaultVariants: {
      tone: 'neutral',
      size: 'default',
    },
  },
);

// The icon a chip shows when the caller passes none: the shape says the state
// again, so a chip never depends on colour alone. `progress` always spins its
// `Loader` (see StatusBadgeMarker).
const toneIcon: Record<Exclude<Tone, 'progress'>, LucideIcon> = {
  neutral: CircleDashedIcon,
  info: CircleDotIcon,
  success: CircleCheckIcon,
  warning: TriangleAlertIcon,
  critical: CircleXIcon,
};

// The marker colour of each tone: the dot fill, and the icon or spinner stroke.
// `neutral` has no tone slot, so it uses the muted text colour.
const toneText: Record<Tone, string> = {
  neutral: 'text-muted-foreground',
  info: 'text-info-text',
  success: 'text-success-text',
  warning: 'text-warning-text',
  critical: 'text-destructive-text',
  progress: 'text-info-text',
};

// The `text` appearance: the word itself carries the tone. A neutral word
// steps down to muted text and regular weight, so the column stays quiet.
const toneWord: Record<Tone, string> = {
  neutral: 'text-muted-foreground font-normal',
  info: 'text-info-text',
  success: 'text-success-text',
  warning: 'text-warning-text',
  critical: 'text-destructive-text',
  progress: 'text-info-text',
};

// One revolution per 1.6s: slower than the default spin, so a status that
// stays in progress for minutes does not read as urgent. Under reduced motion
// the spinner stands still; the icon shape still says "in motion".
const spinnerClass = 'animate-spin-slow motion-reduce:animate-none';

interface StatusBadgeProps extends useRender.ComponentProps<'span'> {
  /** Semantic tone. Defaults to `neutral`. */
  tone?: Tone;
  /**
   * How the status renders.
   * - `chip` (default): a tinted chip with a tone outline.
   * - `bare`: the chip's icon and tinted label without the box. Use it for a
   *   state inside a tinted or accent surface (a card that is already
   *   coloured), where a chip would be a box inside a box.
   * - `text`: only the word, in the tone colour. Use it in a fixed status
   *   column of a list, where a column of chips is too heavy.
   * - `dot`: a lone 8px tone dot. The label stays in the DOM as screen-reader
   *   text. Use it only where there is no room for a word.
   * @default 'chip'
   */
  appearance?: StatusBadgeAppearance;
  /** Chip height: `default` (24px) or `lg` (28px, for page headers). For `bare`, the matching text and icon size. Only for `appearance="chip"` and `"bare"`. @default 'default' */
  size?: StatusBadgeSize;
  /**
   * Show a leading dot in the tone colour in place of the tone icon, for a
   * group of chips that is not a list column (a list column uses
   * `appearance="text"`). Only for `appearance="chip"` and `"bare"`. `progress` keeps its
   * spinner, regardless of this prop.
   */
  dot?: boolean;
  /**
   * The leading icon, in the tone colour. Only for `appearance="chip"` and `"bare"`.
   * - Leave it out for the tone's own icon: `CircleCheck` (success),
   *   `TriangleAlert` (warning), `CircleX` (critical), `CircleDot` (info),
   *   `CircleDashed` (neutral) and a spinning `Loader` (progress).
   * - Pass a lucide icon element for a state whose shape says more, e.g.
   *   `<MoonStarIcon />` for Asleep. It replaces the dot and the spinner too.
   * - Pass `false` or `null` for no icon, on an inline chip whose label
   *   already names the tone. `progress` still shows its spinner, and `dot`
   *   still shows the dot.
   *
   * Never put an icon in `children`: the chip already brings one.
   */
  icon?: React.ReactNode;
}

function StatusBadge({
  className,
  tone = 'neutral',
  appearance = 'chip',
  size = 'default',
  dot = false,
  icon,
  render,
  children,
  ...props
}: StatusBadgeProps) {
  // The component never transforms or translates the label — children win.
  // A consumer passes their translated string; `defaultLabel` from the
  // dictionary is a fallback the caller resolves, not something rendered here.
  let classes: string;
  let content: React.ReactNode;

  if (appearance === 'dot') {
    content = <span className="sr-only">{children}</span>;
    classes = cn(
      'inline-flex size-2 shrink-0 rounded-full bg-current',
      toneText[tone],
      // A lone dot cannot spin; in progress it pulses instead, and stands still
      // under reduced motion.
      tone === 'progress' && 'motion-safe:animate-pulse',
    );
  } else if (appearance === 'text') {
    classes = cn(
      'inline-flex w-fit shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium',
      toneWord[tone],
    );
    // The spinner comes after the word, so every word in a column starts on
    // the same edge.
    content = (
      <>
        {children}
        {tone === 'progress' ? (
          <LoaderIcon aria-hidden className={cn('size-3 shrink-0', spinnerClass)} />
        ) : null}
      </>
    );
  } else {
    classes =
      appearance === 'bare' ? bareVariants({ tone, size }) : statusBadgeVariants({ tone, size });
    content = (
      <>
        <StatusBadgeMarker tone={tone} size={size} dot={dot} icon={icon} />
        {children}
      </>
    );
  }

  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>({ className: cn(classes, className) }, props, {
      children: content,
    }),
    render,
    state: {
      slot: 'status-badge',
      tone,
      appearance,
    },
  });
}

function StatusBadgeMarker({
  tone,
  size,
  dot,
  icon,
}: {
  tone: Tone;
  size: StatusBadgeSize;
  dot: boolean;
  icon: React.ReactNode;
}) {
  // 13px icons in the 12px chip, 14px in the 13px chip, at stroke 2. The
  // marker eases to a new tone with the outline, when a status changes in place.
  const iconClasses = cn(
    'inline-flex shrink-0 transition-colors duration-slow [&_svg]:shrink-0 [&_svg]:stroke-2',
    size === 'lg' ? '[&_svg]:size-3.5' : '[&_svg]:size-3.25',
    toneText[tone],
  );

  if (isValidElement(icon)) {
    return (
      <span aria-hidden data-slot="status-badge-marker" className={iconClasses}>
        {icon}
      </span>
    );
  }

  // `progress` keeps its spinner over a dot and without an icon: the motion is
  // its meaning, and without it the chip looks like `info`.
  if (tone === 'progress') {
    return (
      <span aria-hidden data-slot="status-badge-marker" className={iconClasses}>
        <LoaderIcon className={spinnerClass} />
      </span>
    );
  }

  if (!dot) {
    // `false`, `null` and any other value that is not an element (`''`, `0`)
    // mean no icon. Only a left-out `icon` gets the tone's own.
    if (icon !== undefined) return null;
    const ToneIcon = toneIcon[tone];
    return (
      <span aria-hidden data-slot="status-badge-marker" className={iconClasses}>
        <ToneIcon />
      </span>
    );
  }

  return (
    <span
      aria-hidden
      data-slot="status-badge-marker"
      className={cn('size-1.5 shrink-0 rounded-full bg-current', toneText[tone])}
    />
  );
}

export { StatusBadge, statusBadgeVariants };
export type { StatusBadgeAppearance, StatusBadgeProps, StatusBadgeSize };
