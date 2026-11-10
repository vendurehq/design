"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { buttonVariants } from "@vendure-io/ui/components/atoms/button"
import { toneIcons } from "@vendure-io/ui/lib/tone-icons"
import { cn } from "@vendure-io/ui/lib/utils"

// A toast shows the same icon as a StatusBadge of its tone: error is
// `critical`, loading is `progress`.
const SuccessIcon = toneIcons.success
const InfoIcon = toneIcons.info
const WarningIcon = toneIcons.warning
const ErrorIcon = toneIcons.critical
const LoadingIcon = toneIcons.progress

// What an extra-small Button sets that Sonner's own button rule overrides.
const toastButton = cn(
  "h-6! rounded-lg! px-2! text-xs! font-medium!",
  "focus-visible:outline-solid! focus-visible:outline-2! focus-visible:outline-ring! focus-visible:shadow-none!",
  "[transition:background-color_var(--transition-duration-quick)_var(--ease-default),color_var(--transition-duration-quick)_var(--ease-default),scale_var(--transition-duration-moderate)_var(--ease-press)]!",
)

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system", forcedTheme } = useTheme()

  return (
    // Sonner declares its own --success-text, --warning-text and --info-text
    // on the toaster, and they shadow the tokens of the same name. This
    // wrapper reads the tokens outside the toaster; the toaster's style
    // points Sonner's names back at them.
    <div
      className="contents"
      style={
        {
          "--toaster-success-text": "var(--success-text)",
          "--toaster-warning-text": "var(--warning-text)",
          "--toaster-info-text": "var(--info-text)",
        } as React.CSSProperties
      }
    >
      <Sonner
        theme={(forcedTheme ?? theme) as ToasterProps["theme"]}
        position="bottom-right"
        className="toaster group"
        // The v3 look keeps the stack open: the newest toast at the bottom and
        // each older one 52px higher (a 44px toast and an 8px gap), 3% smaller
        // and 20% fainter. Pass expand={false} for Sonner's collapsed stack.
        expand
        gap={8}
        // 20px from the corner of the viewport.
        offset={20}
        // Each icon carries its tone: the toast surface stays neutral. Info
        // draws the info icon in the brand colour, not the info tone colour.
        icons={{
          success: (
            <SuccessIcon className="text-success-text size-4 stroke-2" />
          ),
          info: (
            <InfoIcon className="text-brand-indicator size-4 stroke-2" />
          ),
          warning: (
            <WarningIcon className="text-warning-text size-4 stroke-2" />
          ),
          error: (
            <ErrorIcon className="text-destructive-text size-4 stroke-2" />
          ),
          loading: (
            <LoadingIcon className="text-muted-foreground size-4 animate-spin stroke-2 motion-reduce:animate-none" />
          ),
        }}
        style={
          {
            // A toast sits on the raised surface, not the overlay tier.
            "--normal-bg": "var(--card)",
            "--normal-text": "var(--card-foreground)",
            "--success-text": "var(--toaster-success-text)",
            "--warning-text": "var(--toaster-warning-text)",
            "--info-text": "var(--toaster-info-text)",
            "--border-radius": "var(--radius-2xl)",
            "--width": "320px",
            // Sonner pulls the icon 3px out and adds 4px after it. The toast's
            // own 10px gap is the only space between the icon and the text.
            "--toast-icon-margin-start": "0px",
            "--toast-icon-margin-end": "0px",
            "--toast-svg-margin-start": "0px",
            "--toast-svg-margin-end": "0px",
          } as React.CSSProperties
        }
        toastOptions={{
          classNames: {
            // Sonner's own stylesheet is unlayered, so the overlay shadow and
            // the type need ! to win over it.
            // 44px high, 10px 14px padding, 13px medium text, a 10px gap. The
            // overlay shadow plus a hairline. The toast has no border: Sonner's
            // 1px border sits between the shadow's outer ring and the inset
            // hairline, and its gap made the edge read as two lines. A new toast fades in from 12px
            // below; a leaving one drops 6px at 0.97. The entry has no scale:
            // Sonner measures the toast's height on mount, and a scaled toast
            // would shorten every step of the stack. Positions move in toast-move (320ms)
            // on ease-drawer and heights on ease-height, opacity in toast-fade
            // (220ms) on ease-soft. Reduced
            // motion keeps the fades only.
            toast: cn(
              "cn-toast font-sans! min-h-11! gap-2.5! px-3.5! py-2.5! text-sm! font-medium!",
              "border-0! shadow-[var(--shadow-overlay),inset_0_0_0_1px_var(--border)]!",
              "[transition:transform_var(--transition-duration-toast-move)_var(--ease-drawer),opacity_var(--transition-duration-toast-fade)_var(--ease-soft),height_var(--transition-duration-toast-move)_var(--ease-height)]!",
              "data-[mounted=false]:[--y:translateY(calc(var(--lift)*-12px))]!",
              "data-[mounted=true]:data-[expanded=true]:[--y:translateY(calc(var(--lift)*var(--offset)))_scale(calc(1-var(--index)*0.03))]!",
              "data-[mounted=true]:data-[visible=true]:data-[removed=false]:opacity-[calc(1-var(--index)*0.2)]!",
              "data-[removed=true]:data-[swipe-out=false]:[--y:translateY(calc(var(--lift)*var(--offset)-var(--lift)*6px))_scale(0.97)]!",
              "data-[removed=true]:[transition:transform_var(--transition-duration-toast-exit-move)_var(--ease-soft),opacity_var(--transition-duration-toast-exit-fade)_var(--ease-soft)]!",
              "motion-reduce:[transition:opacity_var(--transition-duration-toast-fade)_var(--ease-soft)]!",
            ),
            // Override Sonner's hardcoded #3f3f3f description colour
            // with our semantic muted-foreground token for consistent contrast.
            // See: https://github.com/vendurehq/design/issues/5
            description: "!text-muted-foreground",
            // An icon passed to a plain toast is the foreground at 60%. The
            // tone icons above set their own colour.
            icon: "text-foreground/60",
            // The action and cancel buttons are extra-small Buttons: the
            // action the default variant, the cancel ghost. Sonner styles its
            // buttons unlayered (radius, size, colours, outline, transition),
            // so each of those properties needs ! to win.
            actionButton: cn(
              buttonVariants({ size: "xs" }),
              toastButton,
              "bg-primary! text-primary-foreground! hover:bg-[color-mix(in_oklab,var(--primary),var(--background)_14%)]!",
            ),
            cancelButton: cn(
              buttonVariants({ variant: "ghost", size: "xs" }),
              toastButton,
              "bg-transparent! text-foreground-secondary! hover:bg-muted! hover:text-foreground!",
            ),
          },
        }}
        {...props}
      />
    </div>
  )
}

export { Toaster }
