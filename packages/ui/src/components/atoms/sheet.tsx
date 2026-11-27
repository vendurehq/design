"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

import { cn } from "@vendure-io/ui/lib/utils"
import { useMessages } from "../../lib/format-messages.ts"
import { Button } from "@vendure-io/ui/components/atoms/button"
import { XIcon } from "lucide-react"
import { usePopupDir } from "../../lib/popup-direction.ts"
import { usePinnedHeight } from "../../hooks/use-pinned-height.ts"
import { triggerSlot } from "../../lib/trigger-slot.ts"
import { logicalSide, type PhysicalSide } from "../../lib/deprecated.ts"

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger {...triggerSlot("sheet-trigger", props.render)} {...props} />
}

function SheetClose({ ...props }: SheetPrimitive.Close.Props) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: SheetPrimitive.Portal.Props) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-scrim transition-opacity duration-normal ease-drawer data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-fast supports-backdrop-filter:backdrop-blur-xs",
        className
      )}
      {...props}
    />
  )
}

// Tells SheetHeader to host the close button, so the ✕ stays pinned with the
// header while the body scrolls. The value is the button's accessible name, or
// null when the sheet shows no ✕.
const SheetCloseButtonContext = React.createContext<string | null>(null)

function SheetCloseButton({ className, label }: { className?: string; label: string }) {
  return (
    <SheetPrimitive.Close
      data-slot="sheet-close"
      render={
        <Button
          variant="ghost"
          className={cn("absolute top-4 end-4", className)}
          size="icon-sm"
        />
      }
    >
      <XIcon
      />
      <span className="sr-only">{label}</span>
    </SheetPrimitive.Close>
  )
}

// The width of a start or end sheet per size, as whole class strings so
// Tailwind finds them in this source. A top or bottom sheet spans the viewport
// and ignores the size. Below `sm` every side sheet is 3/4 of the viewport.
const sheetSizes = {
  default: "data-[side=start]:sm:max-w-lg data-[side=end]:sm:max-w-lg",
  xl: "data-[side=start]:sm:max-w-200 data-[side=end]:sm:max-w-200",
} as const

function SheetContent({
  className,
  children,
  side: sideProp = "end",
  size = "default",
  showCloseButton = true,
  closeLabel,
  ...props
}: SheetPrimitive.Popup.Props & {
  /**
   * The edge the sheet slides in from. `start` and `end` follow the reading
   * direction: in right-to-left, `start` is the right edge. Defaults to `end`.
   * `left` and `right` are deprecated: use `start` or `end`. They are removed
   * in 4.0.
   */
  side?: "top" | "bottom" | "start" | "end" | PhysicalSide
  /**
   * The width of a start or end sheet. `default` (512px): a short form or a
   * settings list. `xl` (800px): a table or a wide form. Both stay at 3/4 of
   * the viewport below 640px. Top and bottom sheets ignore it.
   */
  size?: keyof typeof sheetSizes
  showCloseButton?: boolean
  /**
   * The ✕'s accessible name. Defaults to `messages.sheet.close` from
   * `FormatProvider`, then "Close".
   */
  closeLabel?: string
}) {
  const dir = usePopupDir()
  const side = logicalSide("SheetContent", sideProp, dir)
  const t = useMessages("sheet", { close: closeLabel })
  return (
    <SheetPortal>
      <SheetOverlay />
      {/* A sheet taller than the viewport scrolls inside; SheetHeader and SheetFooter stick to its edges, and the scroll padding keeps a focused field clear of both. */}
      <SheetPrimitive.Popup
        dir={dir}
        data-slot="sheet-content"
        data-side={side}
        data-size={size}
        className={cn(
          "group/sheet-content bg-overlay fixed z-50 flex flex-col gap-4 overflow-y-auto overscroll-contain [scroll-padding-block:calc(var(--pinned-header-height,0px)+--spacing(1))_calc(var(--pinned-footer-height,0px)+--spacing(1))] bg-clip-padding text-sm shadow-overlay transition-[opacity,translate] duration-normal ease-drawer data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-fast motion-safe:data-[side=end]:data-starting-style:translate-x-10 motion-safe:data-[side=end]:data-ending-style:translate-x-10 motion-safe:rtl:data-[side=end]:data-starting-style:-translate-x-10 motion-safe:rtl:data-[side=end]:data-ending-style:-translate-x-10 motion-safe:data-[side=start]:data-starting-style:-translate-x-10 motion-safe:data-[side=start]:data-ending-style:-translate-x-10 motion-safe:rtl:data-[side=start]:data-starting-style:translate-x-10 motion-safe:rtl:data-[side=start]:data-ending-style:translate-x-10 motion-safe:data-[side=top]:data-starting-style:-translate-y-10 motion-safe:data-[side=top]:data-ending-style:-translate-y-10 motion-safe:data-[side=bottom]:data-starting-style:translate-y-10 motion-safe:data-[side=bottom]:data-ending-style:translate-y-10 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:max-h-dvh data-[side=start]:inset-y-0 data-[side=start]:start-0 data-[side=start]:h-full data-[side=start]:w-3/4 data-[side=end]:inset-y-0 data-[side=end]:end-0 data-[side=end]:h-full data-[side=end]:w-3/4 data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:max-h-dvh",
          sheetSizes[size],
          className
        )}
        {...props}
      >
        <SheetCloseButtonContext.Provider value={showCloseButton ? t.close : null}>
          {children}
        </SheetCloseButtonContext.Provider>
        {/* A sheet without a SheetHeader keeps the ✕ here, in the corner. */}
        {showCloseButton && (
          <SheetCloseButton
            label={t.close}
            className="group-has-data-[slot=sheet-header]/sheet-content:hidden"
          />
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

// The header and the footer stick to the sheet's edges with its surface behind,
// so a scrolled body passes under them. Their own 16px padding keeps the body
// clear of their text. Each measures its height for the sheet's scroll padding.
function SheetHeader({ className, children, ref, ...props }: React.ComponentProps<"div">) {
  const closeLabel = React.useContext(SheetCloseButtonContext)
  const pinnedRef = usePinnedHeight("--pinned-header-height", "sheet-content", ref)
  return (
    <div
      ref={pinnedRef}
      data-slot="sheet-header"
      className={cn(
        "bg-overlay sticky top-0 z-10 flex shrink-0 flex-col gap-1.5 p-4",
        className
      )}
      {...props}
    >
      {children}
      {closeLabel !== null && <SheetCloseButton label={closeLabel} />}
    </div>
  )
}

function SheetFooter({ className, ref, ...props }: React.ComponentProps<"div">) {
  const pinnedRef = usePinnedHeight("--pinned-footer-height", "sheet-content", ref)
  return (
    <div
      ref={pinnedRef}
      data-slot="sheet-footer"
      className={cn(
        "bg-overlay sticky bottom-0 z-10 mt-auto flex shrink-0 flex-col gap-2 p-4",
        className
      )}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: SheetPrimitive.Title.Props) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground text-style-section-title", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: SheetPrimitive.Description.Props) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
