"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"

import { cn } from "@vendure-io/ui/lib/utils"
import { Button } from "@vendure-io/ui/components/atoms/button"
import { XIcon } from "lucide-react"
import { usePopupDir } from "../../lib/popup-direction.ts"

function Sheet({ ...props }: SheetPrimitive.Root.Props) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({ ...props }: SheetPrimitive.Trigger.Props) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />
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
// header while the body scrolls.
const SheetCloseButtonContext = React.createContext(false)

function SheetCloseButton({ className }: { className?: string }) {
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
      <span className="sr-only">Close</span>
    </SheetPrimitive.Close>
  )
}

function SheetContent({
  className,
  children,
  side = "right",
  showCloseButton = true,
  ...props
}: SheetPrimitive.Popup.Props & {
  side?: "top" | "right" | "bottom" | "left"
  showCloseButton?: boolean
}) {
  const dir = usePopupDir()
  return (
    <SheetPortal>
      <SheetOverlay />
      {/* A sheet taller than the viewport scrolls inside; SheetHeader and SheetFooter stick to its edges. */}
      <SheetPrimitive.Popup
        dir={dir}
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "group/sheet-content bg-overlay fixed z-50 flex flex-col gap-4 overflow-y-auto overscroll-contain bg-clip-padding text-sm shadow-lg transition-[opacity,translate] duration-normal ease-drawer data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-fast motion-safe:data-[side=right]:data-starting-style:translate-x-10 motion-safe:data-[side=right]:data-ending-style:translate-x-10 motion-safe:data-[side=left]:data-starting-style:-translate-x-10 motion-safe:data-[side=left]:data-ending-style:-translate-x-10 motion-safe:data-[side=top]:data-starting-style:-translate-y-10 motion-safe:data-[side=top]:data-ending-style:-translate-y-10 motion-safe:data-[side=bottom]:data-starting-style:translate-y-10 motion-safe:data-[side=bottom]:data-ending-style:translate-y-10 data-[side=bottom]:inset-x-0 data-[side=bottom]:bottom-0 data-[side=bottom]:h-auto data-[side=bottom]:max-h-dvh data-[side=bottom]:border-t data-[side=left]:inset-y-0 data-[side=left]:left-0 data-[side=left]:h-full data-[side=left]:w-3/4 data-[side=left]:border-r data-[side=right]:inset-y-0 data-[side=right]:right-0 data-[side=right]:h-full data-[side=right]:w-3/4 data-[side=right]:border-l data-[side=top]:inset-x-0 data-[side=top]:top-0 data-[side=top]:h-auto data-[side=top]:max-h-dvh data-[side=top]:border-b data-[side=left]:sm:max-w-lg data-[side=right]:sm:max-w-lg",
          className
        )}
        {...props}
      >
        <SheetCloseButtonContext.Provider value={showCloseButton}>
          {children}
        </SheetCloseButtonContext.Provider>
        {/* A sheet without a SheetHeader keeps the ✕ here, in the corner. */}
        {showCloseButton && (
          <SheetCloseButton className="group-has-data-[slot=sheet-header]/sheet-content:hidden" />
        )}
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

// The header and the footer stick to the sheet's edges with its surface behind,
// so a scrolled body passes under them. Their own 16px padding keeps the body
// clear of their text.
function SheetHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  const showCloseButton = React.useContext(SheetCloseButtonContext)
  return (
    <div
      data-slot="sheet-header"
      className={cn(
        "bg-overlay sticky top-0 z-10 flex shrink-0 flex-col gap-1.5 p-4",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && <SheetCloseButton />}
    </div>
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
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
