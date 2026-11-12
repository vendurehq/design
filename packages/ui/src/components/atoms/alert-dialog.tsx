"use client"

import * as React from "react"
import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog"

import { cn } from "@vendure-io/ui/lib/utils"
import { Button } from "@vendure-io/ui/components/atoms/button"
import { usePopupDir } from "../../lib/popup-direction.ts"

function AlertDialog({ ...props }: AlertDialogPrimitive.Root.Props) {
  return <AlertDialogPrimitive.Root data-slot="alert-dialog" {...props} />
}

function AlertDialogTrigger({ ...props }: AlertDialogPrimitive.Trigger.Props) {
  return (
    <AlertDialogPrimitive.Trigger data-slot="alert-dialog-trigger" {...props} />
  )
}

function AlertDialogPortal({ ...props }: AlertDialogPrimitive.Portal.Props) {
  return (
    <AlertDialogPrimitive.Portal data-slot="alert-dialog-portal" {...props} />
  )
}

function AlertDialogOverlay({
  className,
  ...props
}: AlertDialogPrimitive.Backdrop.Props) {
  return (
    <AlertDialogPrimitive.Backdrop
      data-slot="alert-dialog-overlay"
      className={cn(
        "fixed inset-0 isolate z-50 bg-scrim transition-opacity duration-dialog-scrim ease-soft data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-dialog-exit supports-backdrop-filter:backdrop-blur-[2px]",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogContent({
  className,
  size = "default",
  ...props
}: AlertDialogPrimitive.Popup.Props & {
  size?: "default" | "sm"
}) {
  const dir = usePopupDir()
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      {/* At most the viewport height less 1rem on each side. A taller dialog scrolls inside; the header and the footer stick to its edges, as in DialogContent. */}
      <AlertDialogPrimitive.Popup
        dir={dir}
        data-slot="alert-dialog-content"
        data-size={size}
        className={cn(
          "bg-overlay shadow-overlay group/alert-dialog-content fixed top-1/2 left-1/2 z-50 grid max-h-[calc(100dvh-2rem)] w-full -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto overscroll-contain rounded-2xl p-5 transition-[opacity,scale,translate] duration-[var(--transition-duration-normal),var(--transition-duration-dialog-enter),var(--transition-duration-dialog-enter)] ease-out data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-[var(--transition-duration-quick),var(--transition-duration-dialog-exit),var(--transition-duration-dialog-exit)] data-ending-style:ease-[var(--ease-soft),var(--ease-out),var(--ease-out)] motion-safe:data-starting-style:scale-96 motion-safe:data-starting-style:translate-y-[calc(-50%+4px)] motion-safe:data-ending-style:scale-98 outline-none data-[size=default]:max-w-xs data-[size=sm]:max-w-xs data-[size=default]:sm:max-w-110",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  )
}

// The header and the footer reach over the 20px padding and 16px of the 20px
// gap, with the surface behind, so a scrolled body passes under them. The
// margins cancel the paddings, and the -20px offsets account for a sticky box
// sticking inside the padding. See DialogHeader.
const pinned = "sticky z-10 -mx-5 bg-overlay px-5"

function AlertDialogHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-header"
      className={cn(
        pinned,
        "-top-5 -mt-5 -mb-4 pt-5 pb-4",
        "grid grid-rows-[auto_1fr] place-items-center gap-2 text-center has-data-[slot=alert-dialog-media]:grid-rows-[auto_auto_1fr] has-data-[slot=alert-dialog-media]:gap-x-6 sm:group-data-[size=default]/alert-dialog-content:place-items-start sm:group-data-[size=default]/alert-dialog-content:text-left sm:group-data-[size=default]/alert-dialog-content:has-data-[slot=alert-dialog-media]:grid-rows-[auto_1fr]",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-footer"
      className={cn(
        pinned,
        "-bottom-5 -mt-4 -mb-5 pt-4 pb-5",
        "flex flex-col-reverse gap-2 group-data-[size=sm]/alert-dialog-content:grid group-data-[size=sm]/alert-dialog-content:grid-cols-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogMedia({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-dialog-media"
      className={cn(
        "bg-muted mb-2 inline-flex size-16 items-center justify-center rounded-md sm:group-data-[size=default]/alert-dialog-content:row-span-2 *:[svg:not([class*='size-'])]:size-8",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Title>) {
  return (
    <AlertDialogPrimitive.Title
      data-slot="alert-dialog-title"
      className={cn(
        "text-style-section-title sm:group-data-[size=default]/alert-dialog-content:group-has-data-[slot=alert-dialog-media]/alert-dialog-content:col-start-2",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof AlertDialogPrimitive.Description>) {
  return (
    <AlertDialogPrimitive.Description
      data-slot="alert-dialog-description"
      className={cn(
        "text-foreground-secondary *:[a]:hover:text-foreground text-sm text-balance md:text-pretty *:[a]:underline *:[a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

function AlertDialogAction({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      data-slot="alert-dialog-action"
      className={cn(className)}
      {...props}
    />
  )
}

function AlertDialogCancel({
  className,
  variant = "outline",
  size = "default",
  ...props
}: AlertDialogPrimitive.Close.Props &
  Pick<React.ComponentProps<typeof Button>, "variant" | "size">) {
  return (
    <AlertDialogPrimitive.Close
      data-slot="alert-dialog-cancel"
      className={cn(className)}
      render={<Button variant={variant} size={size} />}
      {...props}
    />
  )
}

export {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTitle,
  AlertDialogTrigger,
}
