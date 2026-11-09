"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import type { Tone } from "@vendure-io/ui/lib/state-dictionary"
import { cn } from "@vendure-io/ui/lib/utils"
import { Button } from "@vendure-io/ui/components/atoms/button"
import { XIcon } from "lucide-react"

function Dialog({ ...props }: DialogPrimitive.Root.Props) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
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
        "fixed inset-0 isolate z-50 bg-scrim transition-opacity duration-180 ease-[ease] data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-140 supports-backdrop-filter:backdrop-blur-[2px]",
        className
      )}
      {...props}
    />
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
  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      {/* Enters from 4px below at 96%: opacity 200ms, scale and translate 240ms on the strong ease-out. Leaves to 98% on `ease` (opacity 120ms, scale 140ms). The scrim fades in 180ms and out in 140ms. Reduced motion keeps the fades. */}
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        className={cn(
          "bg-overlay shadow-overlay fixed top-1/2 left-1/2 z-50 grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 rounded-2xl p-5 text-sm transition-[opacity,scale,translate] duration-[200ms,240ms,240ms] ease-(--ease-out) data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-[120ms,140ms,140ms] data-ending-style:ease-[ease] motion-safe:data-starting-style:scale-96 motion-safe:data-starting-style:translate-y-[calc(-50%+4px)] motion-safe:data-ending-style:scale-98 outline-none sm:max-w-110",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            render={
              <Button
                variant="ghost"
                className="absolute top-3.5 right-3.5"
                size="icon-sm"
              />
            }
          >
            <XIcon
            />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2.5", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
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
        "text-style-section-title",
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
