"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { duration } from "@vendure-io/design-tokens"

// Relative: `label-swap` is closed in the package exports.
import { LabelSwap } from "./label-swap.tsx"
import { cn } from "@vendure-io/ui/lib/utils"

/** True inside a TooltipProvider, whose delay then applies to each trigger. */
const InTooltipProvider = React.createContext(false)

/** The `tooltip-delay` token, in ms. */
const TOOLTIP_DELAY = Number.parseFloat(duration.tooltipDelay)

/**
 * Wrap the app in one TooltipProvider. The first tooltip then waits
 * `tooltip-delay` (400ms), so a pointer that only passes over a trigger opens
 * nothing. Once a tooltip is open, the next one opens at once and does not
 * animate, until no tooltip has been open for the provider's `timeout`.
 */
function TooltipProvider({
  delay = TOOLTIP_DELAY,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <InTooltipProvider.Provider value={true}>
      <TooltipPrimitive.Provider
        data-slot="tooltip-provider"
        delay={delay}
        {...props}
      />
    </InTooltipProvider.Provider>
  )
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

/**
 * Inside a TooltipProvider it leaves `delay` unset, so the provider's delay
 * applies. Without a provider, Base UI would wait 600ms, so the trigger sets
 * `delay` to 0 itself and the tooltip opens at once.
 */
function TooltipTrigger({ delay, ...props }: TooltipPrimitive.Trigger.Props) {
  const inProvider = React.useContext(InTooltipProvider)
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      delay={delay ?? (inProvider ? undefined : 0)}
      {...props}
    />
  )
}

function TooltipContent({
  className,
  side = "top",
  sideOffset = 8,
  align = "center",
  alignOffset = 0,
  children,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        {/* No arrow: the popup scales in from the trigger side (--transform-origin) in 125ms (tooltip-enter) and leaves in 100ms (fast), both on ease-soft (the CSS `ease`). A tooltip that Base UI marks data-instant does not animate: one that opens while another is showing or just closed (delay), one opened by keyboard focus (focus), and one dismissed with Escape or an outside press (dismiss). Moving along a row of triggers then shows each tooltip in full at once. This rule wins over the v3 look, which animates every tooltip.  A TooltipLabelSwap inside clips to the bubble, so a wider label that leaves never shows past its edge. The bubble is at most 320px wide and nothing widens it: a tooltip is a short hint, and longer content belongs on the page or in a Popover. Its max-w comes after `className`, so a consumer's max-w-* is dropped. */}
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "bg-foreground text-background z-50 w-fit origin-(--transform-origin) rounded-lg px-2.5 py-[7px] text-xs leading-[17px] font-medium text-pretty transition-[opacity,scale] duration-tooltip-enter ease-soft data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-fast motion-safe:data-starting-style:scale-97 motion-safe:data-ending-style:scale-97 data-instant:duration-instant has-data-[slot=tooltip-label-swap]:overflow-hidden",
            className,
            "max-w-80"
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

/**
 * A tooltip label that changes in place, such as "Copy" → "Copied". The
 * labels share one grid cell and `active` picks the one that shows. A label
 * before it leaves 6px upward, a label after it waits 6px below, both faded
 * out with a 2px blur. The part eases to the width of the active label, so
 * the bubble never snaps. A label wider than the bubble wraps inside it, and
 * the part eases to the active label's height too. With reduced motion the
 * labels only crossfade and the size changes at once.
 */
function TooltipLabelSwap(
  props: Omit<React.ComponentProps<"span">, "children"> & {
    labels: readonly React.ReactNode[]
    active: number
  }
) {
  return (
    <LabelSwap
      data-slot="tooltip-label-swap"
      timing="tooltip"
      {...props}
      className={cn("items-start", props.className)}
      // Each label is as wide as its text, up to the bubble's content box
      // (320px less px-2.5 on each side), where it wraps. So its size does
      // not depend on the size of the label that showed before.
      labelClassName="w-max max-w-[calc(--spacing(80)-1.25rem)]"
    />
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipLabelSwap, TooltipProvider }
