"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@vendure-io/ui/lib/utils"
import { outlineEdge, outlineEdgeHover } from "@vendure-io/ui/lib/outline-edge"

const toggleVariants = cva(
  // Pressed is the accent tint with foreground text, as in the v3 look. Hover
  // is the muted fill, so a hovered item never reads as pressed; a pressed item
  // keeps its tint on hover. The outline border keeps its colour when pressed,
  // so a pressed item stays part of its group.
  // Base UI sets both aria-pressed and data-pressed; both are styled.
  // A disabled toggle that keeps its tab stop and tooltip carries
  // aria-disabled="true" (Base UI's Toggle has no focusableWhenDisabled). It
  // looks like a disabled toggle: half opacity and a not-allowed cursor. Its
  // hover is undone by `aria-disabled:hover:` resets to the rest look, pressed
  // or not, so a consumer's own `hover:` class keeps working on an enabled
  // toggle. Ignoring the press is the consumer's job: cancel it in
  // `onPressedChange`.
  // Sizes and corners match Button, so a toggle sits level with the buttons,
  // ButtonGroup and fields next to it: 34px default and 28px sm (12px text),
  // the xl radius.
  // The icon follows Button's icon recipe, as in the v3 look: quieter than
  // the text at 55%, 85% under the pointer, a 1.75 stroke; 14px in the small
  // size. Pressed keeps 55%, as the v3 look's pressed toggle does: the accent
  // tint marks the press. An icon with its own opacity class keeps it.
  "[&_svg:not([class*='stroke-'])]:stroke-[1.75] [&>svg:not([role=status]):not([class*='opacity-'])]:opacity-55 hover:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-85 aria-disabled:hover:[&>svg:not([role=status]):not([class*='opacity-'])]:opacity-55 [&>svg]:[transition:opacity_var(--transition-duration-moderate)_var(--ease-default)] hover:text-foreground aria-pressed:bg-accent aria-pressed:text-foreground aria-pressed:hover:bg-accent data-pressed:bg-accent data-pressed:text-foreground data-pressed:hover:bg-accent focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:focus-visible:outline-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive gap-1 rounded-xl text-sm font-medium transition-[background-color,border-color,color,box-shadow] duration-quick ease-default [&_svg:not([class*='size-'])]:size-4 group/toggle hover:bg-muted inline-flex items-center justify-center whitespace-nowrap outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:hover:bg-transparent aria-disabled:hover:text-current aria-disabled:aria-pressed:hover:bg-accent aria-disabled:aria-pressed:hover:text-foreground aria-disabled:data-pressed:hover:bg-accent aria-disabled:data-pressed:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        // The outline toggle takes the outline Button's surface: the card fill
        // and shadow-control, as the v3 look draws a pressed toggle beside
        // buttons. Its hover is the outline Button's too: 4% foreground mixed
        // into the card, and the edge steps up to `input`. Pressed is still
        // the accent tint on top, under the pointer as well.
        outline: [outlineEdge, outlineEdgeHover, "hover:bg-[color-mix(in_oklab,var(--card),var(--foreground)_4%)] aria-disabled:hover:bg-card border bg-card shadow-control"],
      },
      size: {
        default: "h-8.5 min-w-8.5 px-2",
        sm: "h-7 min-w-7 px-1.5 text-xs [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 min-w-10 px-2.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
