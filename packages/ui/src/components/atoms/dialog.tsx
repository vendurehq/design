"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import type { Tone } from "@vendure-io/ui/lib/state-dictionary"
import { cn } from "@vendure-io/ui/lib/utils"
import { Button } from "@vendure-io/ui/components/atoms/button"
import { XIcon } from "lucide-react"
import { usePopupDir } from "../../lib/popup-direction.ts"
import { usePinnedHeight } from "../../hooks/use-pinned-height.ts"
import { triggerSlot } from "../../lib/trigger-slot.ts"

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger {...triggerSlot("dialog-trigger", props.render)} {...props} />
}

function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

function DialogOverlay({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-scrim transition-opacity duration-dialog-scrim ease-soft data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-dialog-exit supports-backdrop-filter:backdrop-blur-[2px]",
        className
      )}
      {...props}
    />
  )
}

// Tells DialogHeader to host the close button, so the ✕ stays pinned with the
// header while the body scrolls.
const DialogCloseButtonContext = React.createContext(false)

function DialogCloseButton({ className }: { className?: string }) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      // top-4 centres the 28px button on the title's first line.
      render={
        <Button
          variant="ghost"
          className={cn("absolute top-4 end-3.5", className)}
          size="icon-sm"
        />
      }
    >
      <XIcon
      />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = false,
  overlayClassName,
  ...props
}: DialogPrimitive.Popup.Props & {
  /**
   * Shows a ✕ in the top-right corner. Off by default: the footer's Cancel,
   * Escape and a click on the backdrop close the dialog. Turn it on for a
   * dialog with no Cancel button.
   */
  showCloseButton?: boolean
  /** Classes for the backdrop behind the dialog, e.g. `bg-scrim-subtle`. */
  overlayClassName?: string
}) {
  const dir = usePopupDir()
  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      {/* Enters from 4px below at 96%: opacity 200ms, scale and translate 240ms on the strong ease-out. Leaves to 98% (opacity 120ms on `ease`, scale 140ms on the strong ease-out). The scrim fades in 180ms and out in 140ms. Reduced motion keeps the fades. */}
      {/* At most the viewport height less 1rem on each side. A taller dialog scrolls inside; DialogHeader and DialogFooter stick to its top and bottom edges. */}
      {/* The padding is `--dialog-padding` (20px), and the pinned header and footer reach over it. Change the variable, not `p-*`. */}
      {/* The scroll padding is the pinned header's and footer's measured heights plus 4px for a focus ring: a focused field scrolls clear of both. */}
      <DialogPrimitive.Popup
        dir={dir}
        data-slot="dialog-content"
        className={cn(
          "group/dialog-content bg-overlay shadow-overlay fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto overscroll-contain rounded-2xl [--dialog-padding:--spacing(5)] p-(--dialog-padding) [scroll-padding-block:calc(var(--pinned-header-height,0px)+--spacing(1))_calc(var(--pinned-footer-height,0px)+--spacing(1))] text-sm transition-[opacity,scale,translate] duration-[var(--transition-duration-normal),var(--transition-duration-dialog-enter),var(--transition-duration-dialog-enter)] ease-out data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-[var(--transition-duration-quick),var(--transition-duration-dialog-exit),var(--transition-duration-dialog-exit)] data-ending-style:ease-[var(--ease-soft),var(--ease-out),var(--ease-out)] motion-safe:data-starting-style:scale-96 motion-safe:data-starting-style:translate-y-[calc(-50%+4px)] motion-safe:data-ending-style:scale-98 outline-none sm:max-w-110",
          className
        )}
        {...props}
      >
        <DialogCloseButtonContext.Provider value={showCloseButton}>
          {children}
        </DialogCloseButtonContext.Provider>
        {/* A dialog without a DialogHeader keeps the ✕ here, in the corner. */}
        {showCloseButton && (
          <DialogCloseButton className="group-has-data-[slot=dialog-header]/dialog-content:hidden" />
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

// The header and the footer reach over the dialog's padding (`--dialog-padding`)
// and 16px of the 20px gap beside them, with the dialog's surface behind, so a
// scrolled body passes under them and stays clear of their text. The 4px left
// of the gap keeps a field's focus ring visible. The margins cancel the
// paddings: a short dialog keeps its layout. The sticky offsets are negative
// because a sticky box sticks inside the scroll container's padding. Each
// measures its height for the content's scroll padding (usePinnedHeight).
const pinned = "sticky z-10 -mx-(--dialog-padding) bg-overlay px-(--dialog-padding)"

function DialogHeader({ className, children, ref, ...props }: React.ComponentProps<"div">) {
  const showCloseButton = React.useContext(DialogCloseButtonContext)
  const pinnedRef = usePinnedHeight("--pinned-header-height", "dialog-content", ref)
  return (
    <div
      ref={pinnedRef}
      data-slot="dialog-header"
      className={cn(
        pinned,
        "-top-(--dialog-padding) -mt-(--dialog-padding) -mb-4 flex flex-col gap-2.5 pt-(--dialog-padding) pb-4",
        // The text stops before the close button, so a long title wraps instead of running under it.
        showCloseButton && "pe-14",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && <DialogCloseButton />}
    </div>
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ref,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  const pinnedRef = usePinnedHeight("--pinned-footer-height", "dialog-content", ref)
  return (
    <div
      ref={pinnedRef}
      data-slot="dialog-footer"
      className={cn(
        pinned,
        "-bottom-(--dialog-padding) -mt-4 -mb-(--dialog-padding) flex flex-col-reverse gap-2 pt-4 pb-(--dialog-padding) sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close render={<Button variant="outline" />}>
          Close
        </DialogPrimitive.Close>
      )}
    </div>
  )
}

// The colour of the title icon per tone. Neutral is the foreground at 60%;
// info is the brand mark, as on the toast.
const titleIconTone: Record<Tone, string> = {
  neutral: "text-foreground/60",
  progress: "text-foreground/60",
  info: "text-brand-indicator",
  success: "text-success-text",
  warning: "text-warning-text",
  critical: "text-destructive-text",
}

function DialogTitle({
  className,
  icon,
  tone = "neutral",
  children,
  ...props
}: DialogPrimitive.Title.Props & {
  /** An 18px icon before the title, e.g. `<RocketIcon />`. */
  icon?: React.ReactNode
  /** The colour of `icon`. Neutral by default; use a tone for a state. */
  tone?: Tone
}) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn(
        "text-style-dialog-title",
        icon != null && "flex items-center gap-2.5",
        className
      )}
      {...props}
    >
      {icon != null && (
        <span
          data-slot="dialog-title-icon"
          aria-hidden="true"
          className={cn(
            "flex shrink-0 [&_svg:not([class*='size-'])]:size-4.5 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
            titleIconTone[tone]
          )}
        >
          {icon}
        </span>
      )}
      {children}
    </DialogPrimitive.Title>
  )
}

function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn(
        "text-foreground-secondary *:[a]:hover:text-foreground text-sm *:[a]:underline *:[a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}
