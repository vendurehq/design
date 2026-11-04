"use client"

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@vendure-io/ui/lib/utils"

function TooltipProvider({
  delay = 0,
  ...props
}: TooltipPrimitive.Provider.Props) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delay}
      {...props}
    />
  )
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
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
        {/* No arrow: the popup scales in from the trigger side (--transform-origin). data-instant marks a tooltip that opens while another one is showing, so it skips the transition. */}
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(
            "bg-foreground text-background z-50 w-fit max-w-xs origin-(--transform-origin) rounded-lg px-2.5 py-1.5 text-xs font-medium transition-[opacity,scale] duration-(--transition-duration-moderate) ease-(--ease-out) data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-(--transition-duration-fast) motion-safe:data-starting-style:scale-97 motion-safe:data-ending-style:scale-97 data-instant:transition-none",
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

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
