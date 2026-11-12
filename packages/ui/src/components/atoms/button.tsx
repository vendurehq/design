"use client"

import type * as React from "react"
import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

// Relative: `label-swap` is closed in the package exports.
import { LabelSwap } from "./label-swap.tsx"
import { contentInsetPull } from "@vendure-io/ui/lib/content-inset"
import { cn } from "@vendure-io/ui/lib/utils"
import { outlineEdge, outlineEdgeHover } from "@vendure-io/ui/lib/outline-edge"

// The v3 look: 34px default and 28px sm, the xl radius, 13px medium text.
// Every size keeps its side padding with or without a `data-icon` icon;
// default and sm have a 7px gap. Press feedback is a 0.97 scale on :active,
// on ease-press in 150ms. Base UI's Button never emits data-pressed, so the
// old data-pressed brightness rule never fired. Fill, border, text colour,
// opacity (disabled) and the box shadow (aria-invalid ring, shadow-control)
// ease in 120ms. The focus outline and a width change are instant.
// Hovers on opaque fills mix in another slot instead of lowering the alpha,
// so a hovered segment still reads on a filled ButtonGroup. The mixes read
// the slot variables (--primary, not --color-primary): the --color-* aliases
// resolve on :root and would ignore a nested .dark scope.
// A decorative icon next to the label is quieter than the label: 55% at rest,
// 85% on hover or while its menu is open. Icon-only sizes keep the icon at
// full strength, and a Spinner (role="status") is never dimmed.
// A ChevronDown that opens a menu turns 180° while the menu is open, in
// 220ms on the strong ease-out; with reduced motion it turns at once.
// Primary, outline and destructive sit on shadow-control, a 1px lift off the
// surface; a disabled button drops it. Inside a ButtonGroup the group carries
// the shadow and the edge, so an outline child keeps its border off on hover.
// A disabled button that keeps its tab stop and tooltip carries
// aria-disabled="true", set by Base UI for `disabled focusableWhenDisabled`
// or by hand. It looks like a native disabled button: half opacity, no
// shadow, no press scale, and every hover rule is undone while it is
// aria-disabled (`aria-disabled:hover:` restates the rest fill, text and icon
// strength), so a consumer's own `hover:` class keeps working on an enabled
// button. It keeps its pointer events, so its tooltip opens, and shows a
// not-allowed cursor. Only Base UI's prop also ignores the click.
// Reduced motion turns the press off with `scale: none`, not `1`: any other
// value makes the button the containing block of its ::after, so a stretched
// ::after shrinks to the button mid-press and the click misses. A button that
// stretches its ::after also takes `active:scale-none` at full motion.
// Each text size sets `--content-inset`, the distance from the box to the
// first letter: the padding and the 1px border, plus a leading
// `data-icon="inline-start"` icon and the gap. A DataTable cell and the sort
// header pull the button back by it, so the label lines up with the column.
// Icon-only sizes have no text and set none.
//
// The small icon sizes (icon-xs 24px, icon-sm 28px) take a 40 × 40px click
// area: an invisible ::before, centred on the button. The button stays
// static: `position` would make it the containing block of a stretched
// ::after (a chip's copy button, a row link). So the ::before has no insets
// and sits at its static position, which the button's own centring puts in
// the middle of the button; its size is in px, not %, for the same reason.
// The text sizes stay out: their area would have to follow the label width,
// which needs a percentage, and so a positioned button.
// Neighbours never share a point. Next to a control (a toolbar, a
// ButtonGroup, a field and its clear button) the area keeps the button's
// own width (`--button-box`) and only grows up and down; in a vertical
// ButtonGroup it keeps the height too. In an InputGroup and in the copy
// chips it is off: the field and the chip are the click target there.
const smallIconClickArea = [
  "before:absolute before:size-10",
  "[:is(a,button,input,select,textarea,[role=button])+&]:before:w-(--button-box) [&:has(+:is(a,button,input,select,textarea,[role=button]))]:before:w-(--button-box)",
  "[[data-slot=button-group][data-orientation=vertical]>&]:before:h-(--button-box)",
  "[:is([data-slot=input-group],[data-slot=chip],[data-slot=id-chip],[data-slot=anonymized-token],[data-slot=secret-value],[data-slot=copyable-text])_&]:before:hidden",
]

const buttonVariants = cva(
  [contentInsetPull, "focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:focus-visible:outline-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive rounded-xl border border-transparent bg-clip-padding text-sm font-medium aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75] inline-flex items-center justify-center whitespace-nowrap [transition:background-color_var(--transition-duration-quick)_var(--ease-default),border-color_var(--transition-duration-quick)_var(--ease-default),color_var(--transition-duration-quick)_var(--ease-default),opacity_var(--transition-duration-quick)_var(--ease-default),box-shadow_var(--transition-duration-quick)_var(--ease-default),scale_var(--transition-duration-moderate)_var(--ease-press)] active:scale-[0.97] motion-reduce:active:scale-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none aria-disabled:opacity-50 aria-disabled:shadow-none aria-disabled:cursor-not-allowed aria-disabled:active:scale-none [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none cursor-pointer [&>svg]:[transition:opacity_var(--transition-duration-moderate)_var(--ease-default),rotate_var(--transition-duration-button-icon-turn)_var(--ease-out)] motion-reduce:[&>svg]:[transition:opacity_var(--transition-duration-moderate)_var(--ease-default)] aria-expanded:[&>svg.lucide-chevron-down]:rotate-180"],
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-control [--primary-hover:color-mix(in_oklab,var(--primary),var(--background)_14%)] hover:bg-(--primary-hover) aria-expanded:bg-(--primary-hover) aria-disabled:hover:bg-primary",
        // Identity/marketing CTA only ("Start free trial", "Upgrade to Cloud"):
        // a deliberate brand moment, not a louder `default` primary. Brand is a
        // signature, not a wallpaper; see Button guidance before reaching for it.
        brand: "bg-brand text-brand-foreground shadow-control hover:bg-brand/80 aria-disabled:hover:bg-brand",
        outline:
          [outlineEdge, outlineEdgeHover, "bg-card not-dark:[&:not([data-slot=button-group]>*)]:bg-clip-border text-foreground shadow-control hover:bg-[color-mix(in_oklab,var(--card),var(--foreground)_4%)] aria-expanded:bg-[color-mix(in_oklab,var(--card),var(--foreground)_4%)] aria-disabled:hover:bg-card"],
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground aria-disabled:hover:bg-secondary",
        ghost:
          "text-foreground-secondary hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground aria-disabled:hover:bg-transparent aria-disabled:hover:text-foreground-secondary",
        // Solid: destructive-foreground on destructive holds 4.5:1 in both
        // modes (checked in @vendure-io/design-tokens). Hover mixes toward
        // destructive-900, a shade darker in both modes.
        destructive:
          "bg-destructive text-destructive-foreground shadow-control hover:bg-[color-mix(in_oklab,var(--destructive),var(--destructive-900)_15%)] aria-expanded:bg-[color-mix(in_oklab,var(--destructive),var(--destructive-900)_15%)] aria-disabled:hover:bg-destructive",
        link: "text-primary underline-offset-4 hover:underline aria-disabled:hover:no-underline",
      },
      size: {
        default:
          "h-8.5 gap-1.75 px-3.25 [--content-inset:calc(var(--spacing)*3.25+1px)] has-data-[icon=inline-start]:[--content-inset:calc(var(--spacing)*9+1px)] [&>svg:not([role=status]):not([class*='opacity-'])]:opacity-55 hover:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-85 aria-disabled:hover:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-55 aria-expanded:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-85",
        xs: "h-6 gap-1 rounded-lg px-2 text-xs [--content-inset:calc(var(--spacing)*2+1px)] has-data-[icon=inline-start]:[--content-inset:calc(var(--spacing)*6+1px)] [&_svg:not([class*='size-'])]:size-3 [&>svg:not([role=status]):not([class*='opacity-'])]:opacity-55 hover:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-85 aria-disabled:hover:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-55 aria-expanded:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-85",
        sm: "h-7 gap-1.75 px-2.5 text-xs [--content-inset:calc(var(--spacing)*2.5+1px)] has-data-[icon=inline-start]:[--content-inset:calc(var(--spacing)*8.25+1px)] [&>svg:not([role=status]):not([class*='opacity-'])]:opacity-55 hover:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-85 aria-disabled:hover:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-55 aria-expanded:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-85",
        lg: "h-10 gap-2 px-4 [--content-inset:calc(var(--spacing)*4+1px)] has-data-[icon=inline-start]:[--content-inset:calc(var(--spacing)*10+1px)] [&>svg:not([role=status]):not([class*='opacity-'])]:opacity-55 hover:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-85 aria-disabled:hover:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-55 aria-expanded:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-85",
        icon: "size-8.5",
        "icon-xs": [
          "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3 [--button-box:--spacing(6)]",
          smallIconClickArea,
        ],
        "icon-sm": ["size-7 [--button-box:--spacing(7)]", smallIconClickArea],
        "icon-lg": "size-10",
      },
    },
    // The primary fill keeps its icon a little stronger at rest.
    compoundVariants: [
      {
        variant: "default",
        size: ["default", "xs", "sm", "lg"],
        className: "[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-75 hover:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-75 aria-disabled:hover:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-75 aria-expanded:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-75",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  render,
  nativeButton,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      // Base UI warns when `render` swaps in a non-native element unless
      // nativeButton is false. Default it off when rendering as something else
      // (e.g. an anchor) so consumers don't have to pass it every time.
      render={render}
      nativeButton={render ? (nativeButton ?? false) : nativeButton}
      {...props}
    />
  )
}

/**
 * A button label that changes in place, such as "Select" → "Selected". The
 * labels share one grid cell and `active` picks the one that shows; the others
 * are hidden from the accessible name. A label before it leaves 4px upward, a
 * label after it waits 4px below, both faded out with a 2px blur, and the
 * button eases to the width of the active label, clipping the wider one as it
 * goes. The width follows the label, also when a web font loads late. With
 * reduced motion the labels only crossfade and the width changes at once. A
 * label may hold an icon; it keeps full strength (only a direct svg child of
 * the button is dimmed).
 */
function ButtonLabelSwap(
  props: Omit<React.ComponentProps<"span">, "children"> & {
    labels: readonly React.ReactNode[]
    active: number
  }
) {
  return (
    <LabelSwap
      data-slot="button-label-swap"
      timing="button"
      {...props}
      className={cn("gap-[inherit] overflow-x-clip whitespace-nowrap", props.className)}
      labelClassName="inline-flex items-center gap-[inherit]"
    />
  )
}

export { Button, ButtonLabelSwap, buttonVariants }
