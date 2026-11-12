import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@vendure-io/ui/lib/utils"
import { alertTint, alertToneVars } from "@vendure-io/ui/lib/tint-recipes"

// Alert is an inline-size container so AlertAction can move under the text when
// the alert is narrow. A container cannot size to its content: an Alert inside a
// flex row needs a width (it is w-full by default), not w-fit.
// The grid has no column gap: the icon carries its own margin, so the empty
// action column of a narrow alert takes no space.
// The v3 banner: a toned alert is a faint tint of its tone. In light mode the
// fill is 7% tone in the card and the border 14% tone in the border colour; in
// dark mode the tone sits over transparent (10% fill, 30% border), because
// mixed into the cool surface it reads grey. The modes switch the
// --alert-fill and --alert-border properties, not the utilities, so a
// consumer's bg-* or border-* class wins in both modes. The icon takes the
// tone's text slot. Warning tints with the brighter warning-indicator, as an
// amber text colour mixes to brown. The title stays foreground and the
// description foreground-secondary in every variant, because a muted grey on
// a tinted fill falls below text contrast.
// The recipe lives in lib/tint-recipes.ts, which the contrast test in
// @vendure-io/design-tokens reads.
const tonedAlert = alertTint

// An alert enters once when it mounts: it fades in and moves 4px down into
// place, 240ms ease-out (@starting-style: nothing runs after it). Reduced motion
// keeps the fade. Content padding is 12px inline, 10px block.
const alertVariants = cva(
  "@container/alert grid grid-cols-[minmax(0,1fr)] gap-y-0.5 rounded-xl border px-3 py-2.5 text-left text-sm has-[>svg]:grid-cols-[auto_minmax(0,1fr)] has-[>[data-slot=alert-action]]:grid-cols-[minmax(0,1fr)_auto] has-[>svg]:has-[>[data-slot=alert-action]]:grid-cols-[auto_minmax(0,1fr)_auto] *:[svg]:row-span-2 *:[svg]:me-3 *:[svg]:translate-y-0.5 *:[svg:not([class*='size-'])]:size-4 *:[svg:not([class*='stroke-'])]:stroke-[1.75] w-full relative group/alert transition-[opacity,translate] duration-alert-enter ease-out starting:opacity-0 motion-safe:starting:-translate-y-1",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground *:[svg]:text-current",
        destructive: [
          tonedAlert,
          alertToneVars.destructive,
        ],
        warning: [
          tonedAlert,
          alertToneVars.warning,
        ],
        info: [tonedAlert, alertToneVars.info],
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "[&_a]:hover:text-foreground col-start-1 font-semibold group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-foreground-secondary [&_a]:hover:text-foreground col-start-1 text-sm text-balance wrap-anywhere group-has-[>svg]/alert:col-start-2 md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

// From a 28rem-wide alert up, the action takes the last grid column on the first
// row, so the text wraps before it. The action box is one text line high and
// centres its content, so a button lines up with the first line of the text and
// overflows into the alert padding instead of making the alert taller. In a
// narrower alert the action moves to its own row under the text.
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn(
        "col-end-[-1] flex flex-wrap content-center items-center gap-2 @max-md/alert:col-start-1 @max-md/alert:mt-2 @max-md/alert:group-has-[>svg]/alert:col-start-2 @md/alert:row-start-1 @md/alert:ms-3 @md/alert:h-lh @md/alert:self-start",
        className
      )}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
