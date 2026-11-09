"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { useActiveLabelWidth } from "@vendure-io/ui/hooks/use-active-label-width"
import { cn } from "@vendure-io/ui/lib/utils"

/** True inside a TooltipProvider, whose delay then applies to each trigger. */
const InTooltipProvider = React.createContext(false)

function TooltipProvider({
  delay = 0,
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
 * Opens at once, as inside a TooltipProvider. Without a provider, Base UI
 * would wait 600ms, so the trigger sets `delay` to 0 itself. Inside a
 * provider it leaves `delay` unset, so the provider's delay applies.
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
        {/* No arrow: the popup scales in from the trigger side (--transform-origin) in 125ms (tooltip-enter) and leaves in 100ms (fast), both on ease-soft (the CSS `ease`). Every open and close transitions, also one that Base UI marks data-instant: a tooltip that opens while another is showing (delay) or on keyboard focus (focus) fades and scales in like any other, as in the v3 look. Only a dismissed tooltip (Escape, an outside press) leaves at once: the user asked it to go.  A TooltipLabelSwap inside clips to the bubble, so a wider label that leaves never shows past its edge. */}
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "bg-foreground text-background z-50 w-fit max-w-xs origin-(--transform-origin) rounded-lg px-2.5 py-[7px] text-xs leading-[17px] font-medium transition-[opacity,scale] duration-tooltip-enter ease-soft data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-(--transition-duration-fast) motion-safe:data-starting-style:scale-97 motion-safe:data-ending-style:scale-97 data-[instant=dismiss]:transition-none has-data-[slot=tooltip-label-swap]:overflow-hidden",
            className
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
 * the bubble never snaps. With reduced motion the labels only crossfade; the
 * width still eases, so the wider label never crowds the bubble edge.
 */
function TooltipLabelSwap({
  labels,
  active,
  className,
  style,
  ...props
}: Omit<React.ComponentProps<"span">, "children"> & {
  labels: readonly React.ReactNode[]
  active: number
}) {
  const { refs, width } = useActiveLabelWidth(active, labels)
  return (
    <span
      data-slot="tooltip-label-swap"
      className={cn(
        "grid grid-cols-[100%] justify-items-center whitespace-nowrap transition-[width] duration-tooltip-resize ease-drawer",
        className
      )}
      style={width === undefined ? style : { ...style, width }}
      {...props}
    >
      {labels.map((label, index) => (
        <span
          // The labels are positions in a fixed list, so the index is their identity.
          key={index}
          ref={(element) => {
            refs.current[index] = element
          }}
          data-swap={index === active ? "in" : index < active ? "before" : "after"}
          aria-hidden={index === active ? undefined : true}
          className="col-start-1 row-start-1 [transition:opacity_var(--transition-duration-tooltip-label-fade)_var(--ease-soft),translate_var(--transition-duration-tooltip-label-move)_var(--ease-out),filter_var(--transition-duration-tooltip-label-fade)_var(--ease-soft)] data-[swap=after]:opacity-0 data-[swap=before]:opacity-0 motion-safe:data-[swap=after]:translate-y-1.5 motion-safe:data-[swap=before]:-translate-y-1.5 motion-safe:data-[swap=after]:blur-[2px] motion-safe:data-[swap=before]:blur-[2px]"
        >
          {label}
        </span>
      ))}
    </span>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipLabelSwap, TooltipProvider }
