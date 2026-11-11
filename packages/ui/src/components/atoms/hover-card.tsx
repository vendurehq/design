"use client"

import * as React from "react"
import { PreviewCard as PreviewCardPrimitive } from "@base-ui/react/preview-card"

import { cn } from "@vendure-io/ui/lib/utils"
import { popupMotion } from "../../lib/popup-motion.ts"
import { usePopupDir } from "../../lib/popup-direction.ts"
import { usePopupAlign } from "../../lib/popup-align.ts"

// A hover card trigger sets no aria-controls, so the trigger hands its element
// to the card here. A trigger outside a HoverCard (a detached one) is not seen.
const HoverCardTriggerRef = React.createContext<React.RefObject<Element | null> | null>(null)

function HoverCard({ ...props }: PreviewCardPrimitive.Root.Props) {
  const triggerRef = React.useRef<Element | null>(null)
  return (
    <HoverCardTriggerRef value={triggerRef}>
      <PreviewCardPrimitive.Root data-slot="hover-card" {...props} />
    </HoverCardTriggerRef>
  )
}

function HoverCardTrigger({
  ref,
  ...props
}: PreviewCardPrimitive.Trigger.Props) {
  const triggerRef = React.useContext(HoverCardTriggerRef)
  const setRef = React.useCallback(
    (trigger: HTMLAnchorElement | null) => {
      if (triggerRef) triggerRef.current = trigger
      if (typeof ref === "function") ref(trigger)
      else if (ref) ref.current = trigger
    },
    [triggerRef, ref]
  )
  return (
    <PreviewCardPrimitive.Trigger
      ref={setRef}
      data-slot="hover-card-trigger"
      {...props}
    />
  )
}

/**
 * Without an `align`, the card opens toward the centre of the screen: a
 * trigger in the right half lines the card up with its right edge, so it grows
 * to the left and stays on screen, and a trigger in the left half lines it up
 * with its left edge. The side is picked each time it opens. A card that opens
 * to the left or right of its trigger keeps "start". An explicit `align`
 * always wins. Do not set `align` unless there is a reason.
 */
function HoverCardContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align,
  // The 4px nudge belongs to an explicit align. The centre-aware edge lines up
  // with the trigger's edge, as in the menu and the popover.
  alignOffset = align ? 4 : 0,
  ref,
  ...props
}: PreviewCardPrimitive.Popup.Props &
  Pick<
    PreviewCardPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  const dir = usePopupDir()
  const triggerRef = React.useContext(HoverCardTriggerRef)
  const getTrigger = React.useCallback(() => triggerRef?.current, [triggerRef])
  const { popupRef, align: positionAlign } = usePopupAlign(
    align,
    side,
    ref,
    getTrigger
  )
  return (
    <PreviewCardPrimitive.Portal data-slot="hover-card-portal">
      <PreviewCardPrimitive.Positioner
        dir={dir}
        align={positionAlign}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PreviewCardPrimitive.Popup
          ref={popupRef}
          data-slot="hover-card-content"
          className={cn(
            "bg-popover text-popover-foreground shadow-overlay z-50 w-64 rounded-xl p-4 text-sm outline-hidden",
            popupMotion,
            className
          )}
          {...props}
        />
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
