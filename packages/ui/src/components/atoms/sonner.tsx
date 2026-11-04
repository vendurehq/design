"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="bottom-right"
      className="toaster group"
      // Each icon carries its tone: the toast surface stays neutral.
      icons={{
        success: (
          <CircleCheckIcon className="text-success-text size-4 stroke-[1.75]" />
        ),
        info: (
          <InfoIcon className="text-info-text size-4 stroke-[1.75]" />
        ),
        warning: (
          <TriangleAlertIcon className="text-warning-text size-4 stroke-[1.75]" />
        ),
        error: (
          <OctagonXIcon className="text-destructive-text size-4 stroke-[1.75]" />
        ),
        loading: (
          <Loader2Icon className="text-muted-foreground size-4 animate-spin stroke-[1.75] motion-reduce:animate-none" />
        ),
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          // shadow-overlay draws the 1px contact edge, so the border stays invisible.
          "--normal-border": "transparent",
          "--border-radius": "var(--radius-2xl)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          // Sonner's own stylesheet is unlayered, so the overlay shadow and
          // the type need ! to win over it.
          toast: "cn-toast shadow-overlay! font-sans!",
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
