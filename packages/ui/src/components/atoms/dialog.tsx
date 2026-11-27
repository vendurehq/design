"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import type { Tone } from "@vendure-io/ui/lib/state-dictionary"
import { cn } from "@vendure-io/ui/lib/utils"
import { useMessages } from "../../lib/format-messages.ts"
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

// DialogClose and DialogFooter tell the content they are there, so a dialog
// without either shows the ✕ (DialogContent `showCloseButton`).
const DialogCloseControlContext = React.createContext<(() => () => void) | null>(null)

function useRegisterCloseControl() {
  const register = React.useContext(DialogCloseControlContext)
  React.useLayoutEffect(() => register?.(), [register])
}

function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
  useRegisterCloseControl()
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
// header while the body scrolls. The value is the button's accessible name, or
// null when the dialog shows no ✕.
const DialogCloseButtonContext = React.createContext<string | null>(null)

function DialogCloseButton({ className, label }: { className?: string; label: string }) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      // top-4.5 centres the 28px button on the 24px first line of the title.
      render={
        <Button
          variant="ghost"
          className={cn("absolute top-4.5 end-3.5", className)}
          size="icon-sm"
        />
      }
    >
      <XIcon
      />
      <span className="sr-only">{label}</span>
    </DialogPrimitive.Close>
  )
}

// The width per size, as whole class strings so Tailwind finds them in this
// source. They sit before `className` in `cn`, so a consumer's `sm:max-w-*`
// still replaces them. Below the breakpoint a dialog is the viewport less 1rem
// on each side: `xl` waits for `lg`, where 800px fits with that margin.
const dialogSizes = {
  default: "sm:max-w-110",
  lg: "sm:max-w-140",
  xl: "lg:max-w-200",
  full: "",
} as const

function DialogContent({
  className,
  children,
  size = "default",
  showCloseButton,
  closeLabel,
  overlayClassName,
  ...props
}: DialogPrimitive.Popup.Props & {
  /**
   * The width, by the dialog's job. `default` (440px): a confirmation or a
   * form of a few fields. `lg` (560px): a form with longer fields or a short
   * list. `xl` (800px): a wide form, a table or a tree. `full`: the viewport
   * less 1rem on each side, for a picker or a preview. Every size shrinks to
   * the viewport less that margin on a small screen.
   */
  size?: keyof typeof dialogSizes
  /**
   * Shows a ✕ in the top-right corner. Left out, the dialog shows it only
   * when it holds no `DialogFooter` and no `DialogClose`: a dialog with a
   * footer closes with its Cancel, Escape or a click on the backdrop, and a
   * dialog without one still has a visible way to close. `true` or `false`
   * wins over that.
   */
  showCloseButton?: boolean
  /**
   * The ✕'s accessible name. Defaults to `messages.dialog.close` from
   * `FormatProvider`, then "Close".
   */
  closeLabel?: string
  /** Classes for the backdrop behind the dialog, e.g. `bg-scrim-subtle`. */
  overlayClassName?: string
}) {
  const dir = usePopupDir()
  const [closeControls, setCloseControls] = React.useState(0)
  const registerCloseControl = React.useCallback(() => {
    setCloseControls((count) => count + 1)
    return () => setCloseControls((count) => count - 1)
  }, [])
  const showClose = showCloseButton ?? closeControls === 0
  const t = useMessages("dialog", { close: closeLabel })
  return (
    <DialogPortal>
      <DialogOverlay className={overlayClassName} />
      {/* Enters from 4px below at 96%: opacity 200ms, scale and translate 240ms on the strong ease-out. Leaves to 98% (opacity 120ms on `ease`, scale 140ms on the strong ease-out). The scrim fades in 180ms and out in 140ms. Reduced motion keeps the fades. */}
      {/* At most the viewport height less 1rem on each side. A taller dialog scrolls inside; DialogHeader and DialogFooter stick to its top and bottom edges. */}
      {/* The padding is `--dialog-padding` (20px), and the pinned header and footer reach over it. Change the variable, not the padding: a `p-*` class leaves the header and the footer at 20px. */}
      {/* One column as wide as the space inside the padding: content wider than that shrinks or wraps inside it instead of widening the dialog past its padding. */}
      {/* The scroll padding is the pinned header's and footer's measured heights plus 4px for a focus ring: a focused field scrolls clear of both. */}
      <DialogPrimitive.Popup
        dir={dir}
        data-slot="dialog-content"
        data-size={size}
        className={cn(
          "group/dialog-content bg-overlay shadow-overlay fixed top-1/2 left-1/2 z-50 grid grid-cols-[minmax(0,1fr)] max-h-[calc(100dvh-2rem)] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-5 overflow-y-auto overscroll-contain rounded-2xl [--dialog-padding:--spacing(5)] p-(--dialog-padding) [scroll-padding-block:calc(var(--pinned-header-height,0px)+--spacing(1))_calc(var(--pinned-footer-height,0px)+--spacing(1))] text-sm transition-[opacity,scale,translate] duration-[var(--transition-duration-normal),var(--transition-duration-dialog-enter),var(--transition-duration-dialog-enter)] ease-out data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-[var(--transition-duration-quick),var(--transition-duration-dialog-exit),var(--transition-duration-dialog-exit)] data-ending-style:ease-[var(--ease-soft),var(--ease-out),var(--ease-out)] motion-safe:data-starting-style:scale-96 motion-safe:data-starting-style:translate-y-[calc(-50%+4px)] motion-safe:data-ending-style:scale-98 outline-none",
          dialogSizes[size],
          className
        )}
        {...props}
      >
        <DialogCloseControlContext.Provider value={registerCloseControl}>
          <DialogCloseButtonContext.Provider value={showClose ? t.close : null}>
            {children}
          </DialogCloseButtonContext.Provider>
        </DialogCloseControlContext.Provider>
        {/* A dialog without a DialogHeader keeps the ✕ here, in the corner. */}
        {showClose && (
          <DialogCloseButton
            label={t.close}
            className="group-has-data-[slot=dialog-header]/dialog-content:hidden"
          />
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
  const closeLabel = React.useContext(DialogCloseButtonContext)
  const pinnedRef = usePinnedHeight("--pinned-header-height", "dialog-content", ref)
  return (
    <div
      ref={pinnedRef}
      data-slot="dialog-header"
      className={cn(
        pinned,
        "-top-(--dialog-padding) -mt-(--dialog-padding) -mb-4 flex flex-col gap-2.5 pt-(--dialog-padding) pb-4",
        // The text stops before the close button, so a long title wraps instead of running under it.
        closeLabel !== null && "pe-14",
        className
      )}
      {...props}
    >
      {children}
      {closeLabel !== null && <DialogCloseButton label={closeLabel} />}
    </div>
  )
}

function DialogFooter({
  className,
  showCloseButton = false,
  closeLabel,
  children,
  ref,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
  /**
   * The text of the Close button that `showCloseButton` adds. Defaults to
   * `messages.dialog.close` from `FormatProvider`, then "Close".
   */
  closeLabel?: string
}) {
  useRegisterCloseControl()
  const t = useMessages("dialog", { close: closeLabel })
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
          {t.close}
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
