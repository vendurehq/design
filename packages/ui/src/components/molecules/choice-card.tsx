'use client';

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
import { CheckboxGroup as CheckboxGroupPrimitive } from '@base-ui/react/checkbox-group';
import { Radio as RadioPrimitive } from '@base-ui/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
import { Badge } from '@vendure-io/ui/components/atoms/badge';
import { useFieldControlProps } from '@vendure-io/ui/components/atoms/field';
import { cn } from '@vendure-io/ui/lib/utils';
import { cva } from 'class-variance-authority';
import { CheckIcon } from 'lucide-react';
import * as React from 'react';

import { interactiveCardVariants } from './interactive-card.tsx';

// A card the user picks from a set: a plan, a shipping method, an address, an
// asset. The card itself is the control. In a single-choice group it is a Base
// UI Radio (arrow keys move the choice, role="radio"); in a multiple-choice
// group a Base UI Checkbox (Space toggles, role="checkbox"). Base UI sets the
// role, aria-checked, the disabled state and the hidden form input.
//
// The look is the shared interactive card (interactive-card.tsx). Selected
// adds a primary border and a 1px inset primary line on ::after, so the edge
// reads 2px without a layout shift and stays over a media image; the focus
// ring is an outline outside it, so both show together. The indicator (a radio
// dot or a check box) shows the state in shape too, not only in colour.
//
// The card's accessible name is its title, and its description is the
// description plus the meta. Slots hold text and images only: a card is one
// control, so a link or button inside it is not reachable as its own control.

type ChoiceCardMode = 'single' | 'multiple';

const ChoiceCardGroupContext = React.createContext<ChoiceCardMode>('single');

type ChoiceCardGroupProps =
  | ({ multiple?: false } & RadioGroupPrimitive.Props)
  | ({ multiple: true } & CheckboxGroupPrimitive.Props);

const groupClassName = 'grid w-full gap-3';

/**
 * A set of ChoiceCards. Single choice by default (a radio group); `multiple`
 * makes it a checkbox group, with `value` as an array. Give it an
 * `aria-label` or `aria-labelledby`.
 */
function ChoiceCardGroup(props: ChoiceCardGroupProps) {
  const fieldProps = useFieldControlProps(props);
  if (fieldProps.multiple) {
    const { multiple: _, className, ...rest } = fieldProps;
    return (
      <ChoiceCardGroupContext.Provider value="multiple">
        <CheckboxGroupPrimitive
          data-slot="choice-card-group"
          data-mode="multiple"
          className={(state) =>
            cn(groupClassName, typeof className === 'function' ? className(state) : className)
          }
          {...rest}
        />
      </ChoiceCardGroupContext.Provider>
    );
  }
  const { multiple: _, className, ...rest } = fieldProps;
  return (
    <ChoiceCardGroupContext.Provider value="single">
      <RadioGroupPrimitive
        data-slot="choice-card-group"
        data-mode="single"
        className={(state) =>
          cn(groupClassName, typeof className === 'function' ? className(state) : className)
        }
        {...rest}
      />
    </ChoiceCardGroupContext.Provider>
  );
}

// The ids the card points its aria-labelledby and aria-describedby at. A part
// registers its id once it mounts; until then (and on the server) the card is
// named from its content, which also holds the title.
interface ChoiceCardParts {
  titleId: string;
  descriptionId: string;
  metaId: string;
  register: (part: 'title' | 'description' | 'meta') => () => void;
}

const ChoiceCardPartsContext = React.createContext<ChoiceCardParts | null>(null);

function useChoiceCardPart(part: 'title' | 'description' | 'meta') {
  const parts = React.useContext(ChoiceCardPartsContext);
  const register = parts?.register;
  React.useEffect(() => register?.(part), [register, part]);
  if (!parts) return undefined;
  return part === 'title'
    ? parts.titleId
    : part === 'description'
      ? parts.descriptionId
      : parts.metaId;
}

const choiceCardVariants = cva(
  [
    'group/choice-card flex text-start',
    // Selected: the primary border plus a 1px inset line drawn over the
    // content (a media image too), so the edge reads 2px with no shift.
    'after:pointer-events-none after:absolute after:inset-0 after:z-10 after:rounded-[inherit] after:[transition:box-shadow_var(--transition-duration-fast)_var(--ease-soft)] data-checked:border-primary data-checked:hover:border-primary data-checked:after:shadow-[inset_0_0_0_1px_var(--primary)]',
  ],
  {
    variants: {
      variant: {
        default: 'items-start gap-3',
        // An image tile: the image fills the card, the indicator sits in the
        // start corner over it.
        media:
          'aspect-square overflow-hidden p-0 [&_img]:size-full [&_img]:object-cover [&_video]:size-full [&_video]:object-cover',
      },
      size: {
        default: '',
        sm: '',
      },
    },
    compoundVariants: [
      { variant: 'default', size: 'default', className: 'p-4' },
      { variant: 'default', size: 'sm', className: 'gap-2.5 p-3' },
    ],
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

// The indicator box: a radio circle or a check box, 16px like the form
// controls. Unchecked it is the control outline; checked it fills primary. In
// the media variant it sits in the corner on a background disc so it reads on
// any image, and while unchecked it shows only on hover or keyboard focus
// (always on a touch screen, where there is no hover).
// Motion: colours and the corner reveal fade in `fast`. The radio dot grows
// from half size on the strong ease-out (never from 0) while it fades in;
// reduced motion keeps the fade and drops the growth.
const indicatorClassName = [
  'relative z-20 flex size-4 shrink-0 items-center justify-center border border-control-border bg-background text-primary-foreground [transition:background-color_var(--transition-duration-fast)_var(--ease-soft),border-color_var(--transition-duration-fast)_var(--ease-soft),opacity_var(--transition-duration-fast)_var(--ease-soft)] group-data-checked/choice-card:border-primary group-data-checked/choice-card:bg-primary',
  // Lines the box up with the first line of the title.
  'group-data-[variant=default]/choice-card:mt-0.5',
  'group-data-[variant=media]/choice-card:absolute group-data-[variant=media]/choice-card:top-2 group-data-[variant=media]/choice-card:start-2 group-data-[variant=media]/choice-card:shadow-control group-data-[variant=media]/choice-card:group-data-unchecked/choice-card:opacity-0 group-hover/choice-card:opacity-100! group-focus-visible/choice-card:opacity-100! pointer-coarse:opacity-100!',
].join(' ');

function ChoiceCardIndicator({ mode }: { mode: ChoiceCardMode }) {
  if (mode === 'single') {
    return (
      <span
        data-slot="choice-card-indicator"
        aria-hidden="true"
        className={cn(indicatorClassName, 'rounded-full')}
      >
        <span className="size-1.5 scale-50 rounded-full bg-primary-foreground opacity-0 [transition:scale_var(--transition-duration-moderate)_var(--ease-out),opacity_var(--transition-duration-fast)_var(--ease-soft)] group-data-checked/choice-card:scale-100 group-data-checked/choice-card:opacity-100 motion-reduce:scale-100" />
      </span>
    );
  }
  return (
    <span
      data-slot="choice-card-indicator"
      aria-hidden="true"
      className={cn(indicatorClassName, 'rounded-md')}
    >
      <CheckIcon
        aria-hidden="true"
        strokeWidth={2.5}
        className="size-3.5 opacity-0 [transition:opacity_var(--transition-duration-fast)_var(--ease-soft)] group-data-checked/choice-card:opacity-100"
      />
    </span>
  );
}

// The props both Base UI roots share. State-function forms of className and
// style are left out: the card renders either root.
type ChoiceCardProps = Omit<
  RadioPrimitive.Root.Props<string>,
  'value' | 'render' | 'className' | 'style' | 'nativeButton' | 'inputRef'
> & {
  className?: string;
  style?: React.CSSProperties;
  /** Identifies the card in its group. */
  value: string;
  disabled?: boolean;
  /** `media`: an image tile that the image fills. Give it an `aria-label`. */
  variant?: 'default' | 'media';
  size?: 'default' | 'sm';
};

/**
 * One choice in a ChoiceCardGroup: a radio card in a single-choice group, a
 * checkbox card in a multiple-choice group.
 */
function ChoiceCard({
  className,
  variant = 'default',
  size = 'default',
  value,
  disabled,
  children,
  ...props
}: ChoiceCardProps) {
  const mode = React.useContext(ChoiceCardGroupContext);
  const id = React.useId();
  const [mounted, setMounted] = React.useState<ReadonlySet<string>>(new Set());
  const register = React.useCallback((part: string) => {
    setMounted((current) => new Set(current).add(part));
    return () =>
      setMounted((current) => {
        const next = new Set(current);
        next.delete(part);
        return next;
      });
  }, []);
  const parts = React.useMemo(
    () => ({
      titleId: `${id}-title`,
      descriptionId: `${id}-description`,
      metaId: `${id}-meta`,
      register,
    }),
    [id, register],
  );

  const describedBy = [
    props['aria-describedby'],
    mounted.has('description') ? parts.descriptionId : undefined,
    mounted.has('meta') ? parts.metaId : undefined,
  ]
    .filter(Boolean)
    .join(' ');
  const ariaProps = {
    'aria-labelledby':
      props['aria-labelledby'] ??
      (props['aria-label'] || !mounted.has('title') ? undefined : parts.titleId),
    'aria-describedby': describedBy || undefined,
  };

  const rootProps = {
    ...props,
    ...ariaProps,
    'data-slot': 'choice-card',
    'data-variant': variant,
    'data-size': size,
    className: cn(interactiveCardVariants(), choiceCardVariants({ variant, size }), className),
    render: <div />,
    value,
    disabled,
  };

  const content = (
    <ChoiceCardPartsContext.Provider value={parts}>
      <ChoiceCardIndicator mode={mode} />
      {children}
    </ChoiceCardPartsContext.Provider>
  );

  return mode === 'multiple' ? (
    <CheckboxPrimitive.Root {...rootProps}>{content}</CheckboxPrimitive.Root>
  ) : (
    <RadioPrimitive.Root {...rootProps}>{content}</RadioPrimitive.Root>
  );
}

const choiceCardMediaVariants = cva('flex shrink-0 items-center justify-center', {
  variants: {
    variant: {
      // A product image or logo beside the text.
      image: 'size-10 overflow-hidden rounded-lg [&_img]:size-full [&_img]:object-cover',
      // An icon, quieter than the title.
      icon: 'mt-px [&_svg]:pointer-events-none [&_svg:not([class*=size-])]:size-4 [&_svg:not([class*=stroke-])]:stroke-[1.75] text-muted-foreground',
    },
  },
  defaultVariants: { variant: 'icon' },
});

/** Leading media of a default card: an icon, or an image or logo. */
function ChoiceCardMedia({
  className,
  variant = 'icon',
  ...props
}: React.ComponentProps<'div'> & { variant?: 'icon' | 'image' }) {
  return (
    <div
      data-slot="choice-card-media"
      data-variant={variant}
      className={cn(choiceCardMediaVariants({ variant }), className)}
      {...props}
    />
  );
}

/** Holds the title and the description. Takes the free width. */
function ChoiceCardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="choice-card-content"
      className={cn('flex min-w-0 flex-1 flex-col gap-0.5', className)}
      {...props}
    />
  );
}

/** The card's name. A ChoiceCardBadge inside it sits on the title line. */
function ChoiceCardTitle({ className, id, ...props }: React.ComponentProps<'div'>) {
  const partId = useChoiceCardPart('title');
  return (
    <div
      id={id ?? partId}
      data-slot="choice-card-title"
      className={cn(
        'flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium text-foreground',
        className,
      )}
      {...props}
    />
  );
}

function ChoiceCardDescription({ className, id, ...props }: React.ComponentProps<'p'>) {
  const partId = useChoiceCardPart('description');
  return (
    <p
      id={id ?? partId}
      data-slot="choice-card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

/** Trailing detail, such as a price or a delivery time. */
function ChoiceCardMeta({ className, id, ...props }: React.ComponentProps<'div'>) {
  const partId = useChoiceCardPart('meta');
  return (
    <div
      id={id ?? partId}
      data-slot="choice-card-meta"
      className={cn(
        'ms-auto shrink-0 text-end text-sm text-foreground-secondary tabular-nums',
        className,
      )}
      {...props}
    />
  );
}

/**
 * A marker on the title line, such as "Current" on the plan the customer is
 * on. It says nothing about selection: the current plan can be unselected
 * while the user picks another one.
 */
function ChoiceCardBadge({ className, ...props }: React.ComponentProps<typeof Badge>) {
  return (
    <Badge data-slot="choice-card-badge" className={cn('font-medium', className)} {...props} />
  );
}

export {
  ChoiceCard,
  ChoiceCardBadge,
  ChoiceCardContent,
  ChoiceCardDescription,
  ChoiceCardGroup,
  ChoiceCardMedia,
  ChoiceCardMeta,
  ChoiceCardTitle,
  type ChoiceCardGroupProps,
  type ChoiceCardProps,
};
