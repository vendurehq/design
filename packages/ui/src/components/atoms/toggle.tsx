"use client"

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@vendure-io/ui/lib/utils"
import { outlineEdge } from "@vendure-io/ui/lib/outline-edge"

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
  "hover:text-foreground aria-pressed:bg-accent aria-pressed:text-foreground aria-pressed:hover:bg-accent data-pressed:bg-accent data-pressed:text-foreground data-pressed:hover:bg-accent focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:focus-visible:outline-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive gap-1 rounded-xl text-sm font-medium transition-[color,box-shadow] [&_svg:not([class*='size-'])]:size-4 group/toggle hover:bg-muted inline-flex items-center justify-center whitespace-nowrap outline-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:hover:bg-transparent aria-disabled:hover:text-current aria-disabled:aria-pressed:hover:bg-accent aria-disabled:aria-pressed:hover:text-foreground aria-disabled:data-pressed:hover:bg-accent aria-disabled:data-pressed:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: [outlineEdge, "hover:bg-muted border bg-transparent"],
      },
      size: {
        default: "h-8.5 min-w-8.5 px-2",
        sm: "h-7 min-w-7 px-1.5 text-xs",
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
