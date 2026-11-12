"use client"

import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@vendure-io/ui/lib/utils"
import { popupMotion } from "../../lib/popup-motion.ts"
import { usePopupDir } from "../../lib/popup-direction.ts"
import { usePopupAlign } from "../../lib/popup-align.ts"
import { triggerSlot } from "../../lib/trigger-slot.ts"

function Popover({ ...props }: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverPortal({ ...props }: PopoverPrimitive.Portal.Props) {
  return <PopoverPrimitive.Portal data-slot="popover-portal" {...props} />
}

function PopoverTrigger({ ...props }: PopoverPrimitive.Trigger.Props) {
  return <PopoverPrimitive.Trigger {...triggerSlot("popover-trigger", props.render)} {...props} />
}

/**
 * Without an `align`, the popover opens toward the centre of the screen: a
 * trigger in the right half lines the popover up with its right edge, so it
 * grows to the left and stays on screen, and a trigger in the left half lines
 * it up with its left edge. The side is picked each time it opens. A popover
 * that opens to the left or right of its trigger keeps "start". An explicit
 * `align` always wins. Do not set `align` unless there is a reason.
 */
function PopoverContent({
  className,
  align,
  ref,
  alignOffset = 0,
  side = "bottom",
  sideOffset = 6,
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  const dir = usePopupDir()
  const { popupRef, align: positionAlign } = usePopupAlign(align, side, ref)
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        dir={dir}
        align={positionAlign}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          ref={popupRef}
          data-slot="popover-content"
          className={cn(
            "bg-popover text-popover-foreground shadow-overlay z-50 flex w-72 flex-col gap-4 rounded-xl p-4 text-sm outline-hidden",
            popupMotion,
            className
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="popover-header"
      className={cn("flex flex-col gap-1 text-sm", className)}
      {...props}
    />
  )
}

function PopoverTitle({ className, ...props }: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn("text-style-card-title", className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn("text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Popover,
  PopoverPortal,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
