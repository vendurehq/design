"use client"

import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@vendure-io/ui/lib/utils"

// The v3 look: 34px default and 28px sm, the xl radius, 13px medium text.
// Press feedback is a 0.97 scale on :active. Base UI's Button never emits
// data-pressed, so the old data-pressed brightness rule never fired.
// Hovers on opaque fills mix in another slot instead of lowering the alpha,
// so a hovered segment still reads on a filled ButtonGroup. The mixes read
// the slot variables (--primary, not --color-primary): the --color-* aliases
// resolve on :root and would ignore a nested .dark scope.
const buttonVariants = cva(
  "focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive rounded-xl border border-transparent bg-clip-padding text-sm font-medium focus-visible:ring-3 aria-invalid:ring-3 [&_svg:not([class*='size-'])]:size-4 inline-flex items-center justify-center whitespace-nowrap transition-all duration-(--transition-duration-moderate) ease-(--ease-out) active:scale-[0.97] motion-reduce:active:scale-100 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none shrink-0 [&_svg]:shrink-0 outline-none group/button select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-[color-mix(in_oklab,var(--primary),var(--background)_14%)] aria-expanded:bg-[color-mix(in_oklab,var(--primary),var(--background)_14%)]",
        // Identity/marketing CTA only ("Start free trial", "Upgrade to Cloud"):
        // a deliberate brand moment, not a louder `default` primary. Brand is a
        // signature, not a wallpaper; see Button guidance before reaching for it.
        brand: "bg-brand text-brand-foreground hover:bg-brand/80",
        outline:
          "border-input bg-card text-foreground hover:bg-[color-mix(in_oklab,var(--card),var(--foreground)_4%)] aria-expanded:bg-[color-mix(in_oklab,var(--card),var(--foreground)_4%)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "text-foreground-secondary hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground",
        // Solid: destructive-foreground on destructive holds 4.5:1 in both
        // modes (checked in @vendure-io/design-tokens). Hover mixes toward
        // destructive-900, a shade darker in both modes.
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-[color-mix(in_oklab,var(--destructive),var(--destructive-900)_15%)] aria-expanded:bg-[color-mix(in_oklab,var(--destructive),var(--destructive-900)_15%)] focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 focus-visible:border-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8.5 gap-1.5 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 rounded-lg px-2 text-xs has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 px-2.5 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        lg: "h-10 gap-2 px-4 has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5",
        icon: "size-8.5",
        "icon-xs":
          "size-6 rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7",
        "icon-lg": "size-10",
      },
    },
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

export { Button, buttonVariants }
