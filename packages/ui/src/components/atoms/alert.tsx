import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@vendure-io/ui/lib/utils"

// Alert is an inline-size container so AlertAction can move under the text when
// the alert is narrow. A container cannot size to its content: an Alert inside a
// flex row needs a width (it is w-full by default), not w-fit.
// The grid has no column gap: the icon carries its own margin, so the empty
// action column of a narrow alert takes no space.
const alertVariants = cva(
  "@container/alert grid grid-cols-[minmax(0,1fr)] gap-y-0.5 rounded-lg border px-4 py-3 text-left text-sm has-[>svg]:grid-cols-[auto_minmax(0,1fr)] has-[>[data-slot=alert-action]]:grid-cols-[minmax(0,1fr)_auto] has-[>svg]:has-[>[data-slot=alert-action]]:grid-cols-[auto_minmax(0,1fr)_auto] *:[svg]:row-span-2 *:[svg]:me-2.5 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4 w-full relative group/alert",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "text-destructive-subtle-foreground bg-card *:data-[slot=alert-description]:text-destructive-subtle-foreground *:[svg]:text-current",
        warning:
          "text-warning-subtle-foreground bg-card *:data-[slot=alert-description]:text-warning-subtle-foreground *:[svg]:text-current",
        info:
          "text-info-subtle-foreground bg-card *:data-[slot=alert-description]:text-info-subtle-foreground *:[svg]:text-current",
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
        "[&_a]:hover:text-foreground col-start-1 font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3",
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
        "text-muted-foreground [&_a]:hover:text-foreground col-start-1 text-sm text-balance wrap-anywhere group-has-[>svg]/alert:col-start-2 md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
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
