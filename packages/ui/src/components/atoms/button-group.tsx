import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@vendure-io/ui/lib/utils"
import { outlineEdgeRing } from "@vendure-io/ui/lib/outline-edge"
import { Separator } from "@vendure-io/ui/components/atoms/separator"

// The v3 look: the group draws one outer edge and its children draw none.
// Children keep a transparent 1px border, so a child's padding-clipped fill
// never covers the group's inset ring, and a later child's leading border is
// the 1px divider (a ButtonGroupSeparator replaces it). Only the outer ends
// are rounded. A group that holds other groups is a layout row only: no edge,
// no fill, and its child groups keep their own radius. The group sits on
// shadow-control; its children drop their own.
const buttonGroupVariants = cva(
  "has-[>[data-slot=button-group]]:gap-2 has-[>[data-slot=button-group]]:bg-transparent has-[>[data-slot=button-group]]:inset-ring-0 has-[>[data-slot=button-group]]:shadow-none has-[select[aria-hidden=true]:last-child]:[&>[data-slot=select-trigger]:last-of-type]:rounded-r-xl flex w-fit items-stretch rounded-xl *:data-slot:border-transparent [&>[data-slot]:not([data-slot=button-group])]:shadow-none *:focus-visible:z-10 *:focus-visible:relative [&>[data-slot=select-trigger]:not([class*='w-'])]:w-fit [&>input]:flex-1 [&>[data-slot=button-group-separator]+[data-slot]]:border-l-transparent! [&>[data-slot=button-group-separator]+[data-slot]]:border-t-transparent!",
  {
    variants: {
      orientation: {
        horizontal:
          "[&>[data-slot]:not([data-slot=button-group])]:rounded-none [&>[data-slot]:not([data-slot]~*)]:rounded-l-xl! [&>[data-slot]:not(:has(~[data-slot]))]:rounded-r-xl!",
        vertical:
          "[&>[data-slot]:not([data-slot=button-group])]:rounded-none [&>[data-slot]:not([data-slot]~*)]:rounded-t-xl! [&>[data-slot]:not(:has(~[data-slot]))]:rounded-b-xl! flex-col",
      },
      variant: {
        default: ["bg-card inset-ring shadow-control", outlineEdgeRing],
        // A primary split button: a main action and a menu trigger on one
        // primary fill. Use default Buttons inside. Children clip their fill
        // to the border box so a hovered segment fills edge to edge.
        primary: "bg-primary shadow-control *:data-slot:bg-clip-border",
      },
    },
    compoundVariants: [
      { orientation: "horizontal", variant: "default", className: "[&>[data-slot]~[data-slot]]:border-l-border" },
      { orientation: "vertical", variant: "default", className: "[&>[data-slot]~[data-slot]]:border-t-border" },
      { orientation: "horizontal", variant: "primary", className: "[&>[data-slot]~[data-slot]]:border-l-primary-foreground/20" },
      { orientation: "vertical", variant: "primary", className: "[&>[data-slot]~[data-slot]]:border-t-primary-foreground/20" },
    ],
    defaultVariants: {
      orientation: "horizontal",
      variant: "default",
    },
  }
)

function ButtonGroup({
  className,
  orientation,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof buttonGroupVariants>) {
  return (
    <div
      role="group"
      data-slot="button-group"
      data-orientation={orientation}
      data-variant={variant}
      className={cn(buttonGroupVariants({ orientation, variant }), className)}
      {...props}
    />
  )
}

function ButtonGroupText({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(
      {
        className: cn(
          "bg-muted gap-2 rounded-xl border px-2.5 text-sm font-medium [&_svg:not([class*='size-'])]:size-4 flex items-center [&_svg]:pointer-events-none",
          className
        ),
      },
      props
    ),
    render,
    state: {
      slot: "button-group-text",
    },
  })
}

function ButtonGroupSeparator({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="button-group-separator"
      orientation={orientation}
      className={cn(
        "bg-border relative self-stretch data-horizontal:mx-px data-horizontal:w-auto data-vertical:my-px data-vertical:h-auto",
        className
      )}
      {...props}
    />
  )
}

export {
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  buttonGroupVariants,
}
