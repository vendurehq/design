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
  "hover:text-foreground aria-pressed:bg-accent aria-pressed:text-foreground aria-pressed:hover:bg-accent data-pressed:bg-accent data-pressed:text-foreground data-pressed:hover:bg-accent focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:focus-visible:outline-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive gap-1 rounded-md text-sm font-medium transition-[color,box-shadow] [&_svg:not([class*='size-'])]:size-4 group/toggle hover:bg-muted inline-flex items-center justify-center whitespace-nowrap outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: [outlineEdge, "hover:bg-muted border bg-transparent"],
      },
      size: {
        default: "h-9 min-w-9 px-2",
        sm: "h-8 min-w-8 px-1.5",
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
