"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { cn } from "@vendure-io/ui/lib/utils"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      className="toaster group"
      // The v3 look keeps the stack open: the newest toast at the bottom and
      // each older one 52px higher (a 44px toast and an 8px gap), 3% smaller
      // and 20% fainter. Pass expand={false} for Sonner's collapsed stack.
      expand
      gap={8}
      // Each icon carries its tone: the toast surface stays neutral. Info is
      // the brand mark, not the info tone.
      icons={{
        success: (
          <CircleCheckIcon className="text-success-text size-4 stroke-2" />
        ),
        info: (
          <InfoIcon className="text-brand-indicator size-4 stroke-2" />
        ),
        warning: (
          <TriangleAlertIcon className="text-warning-text size-4 stroke-2" />
        ),
        error: (
          <OctagonXIcon className="text-destructive-text size-4 stroke-2" />
        ),
        loading: (
          <Loader2Icon className="text-muted-foreground size-4 animate-spin stroke-2 motion-reduce:animate-none" />
        ),
      }}
      style={
        {
          // A toast sits on the raised surface, not the overlay tier.
          "--normal-bg": "var(--card)",
          "--normal-text": "var(--card-foreground)",
          // The shadow draws the edges, so the border stays invisible.
          "--normal-border": "transparent",
          "--border-radius": "var(--radius-2xl)",
          "--width": "320px",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // Sonner's own stylesheet is unlayered, so the overlay shadow and
          // the type need ! to win over it.
          // 44px high, 10px 14px padding, 13px medium text, a 10px gap. The
          // overlay shadow plus a hairline. A new toast fades in from 12px
          // below; a leaving one drops 6px at 0.97. The entry has no scale:
          // Sonner measures the toast's height on mount, and a scaled toast
          // would shorten every step of the stack. Positions move in 320ms on
          // ease-drawer, opacity in 220ms. Reduced motion keeps the fades only.
          toast: cn(
            "cn-toast font-sans! min-h-11! gap-2.5! px-3.5! py-2.5! text-sm! font-medium!",
            "shadow-[var(--shadow-overlay),inset_0_0_0_1px_var(--border)]!",
            "[transition:transform_320ms_var(--ease-drawer),opacity_220ms_ease,height_320ms_var(--ease-drawer)]!",
            "data-[mounted=false]:[--y:translateY(calc(var(--lift)*-12px))]!",
            "data-[mounted=true]:data-[expanded=true]:[--y:translateY(calc(var(--lift)*var(--offset)))_scale(calc(1-var(--index)*0.03))]!",
            "data-[mounted=true]:data-[visible=true]:data-[removed=false]:opacity-[calc(1-var(--index)*0.2)]!",
            "data-[removed=true]:data-[swipe-out=false]:[--y:translateY(calc(var(--lift)*var(--offset)-var(--lift)*6px))_scale(0.97)]!",
            "data-[removed=true]:[transition:transform_180ms_ease,opacity_160ms_ease]!",
            "motion-reduce:[transition:opacity_220ms_ease]!",
          ),
          // Override Sonner's hardcoded #3f3f3f description colour
          // with our semantic muted-foreground token for consistent contrast.
          // See: https://github.com/vendurehq/design/issues/5
          description: "!text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
