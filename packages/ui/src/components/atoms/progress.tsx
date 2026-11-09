"use client"

import type * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@vendure-io/ui/lib/utils"

// Tone names follow the state dictionary; `critical` renders with the
// `destructive` slots. Every tone sits on one 4px track in the `accent` tint
// and fills with the tone's text slot, so a done step reads green and a failed
// one red. `neutral` is a stopped step that needs nothing from the user: a
// muted fill at 55% opacity. Each tone sets the fill as --progress-fill, so the
// solid bar and the indeterminate band share one colour.
const progressTrackVariants = cva(
  "relative flex h-1 w-full items-center overflow-hidden rounded-full bg-accent"
)

// A known value is a full-width fill scaled to the value (--progress-scale,
// set by Progress), so the bar grows with a transform: from 0 when it first
// shows, and to each new value. With `value={null}` the bar is indeterminate:
// a 40% fill with a band that sweeps across at a constant speed. Both run from
// the start side: in a right-to-left layout the fill grows from the right and
// the band plays its sweep in reverse. The reverse class repeats the sweep's
// variants so it sorts after the `animation` shorthand that would reset it.
// Under reduced motion the fill shows at once and the band is gone.
const progressIndicatorVariants = cva(
  "relative h-full origin-left rtl:origin-right overflow-hidden bg-(--progress-fill) scale-x-(--progress-scale,1) motion-safe:transition-[scale] motion-safe:duration-(--transition-duration-progress-fill) motion-safe:ease-(--ease-out) motion-safe:not-data-indeterminate:starting:scale-x-0 data-indeterminate:w-full data-indeterminate:bg-(--progress-fill)/40 motion-safe:data-indeterminate:after:absolute motion-safe:data-indeterminate:after:inset-y-0 motion-safe:data-indeterminate:after:left-0 motion-safe:data-indeterminate:after:w-2/5 motion-safe:data-indeterminate:after:bg-linear-to-r motion-safe:data-indeterminate:after:from-transparent motion-safe:data-indeterminate:after:via-(--progress-fill) motion-safe:data-indeterminate:after:to-transparent motion-safe:data-indeterminate:after:animate-progress-sweep motion-safe:data-indeterminate:rtl:after:[animation-direction:reverse]",
  {
    variants: {
      tone: {
        default: "[--progress-fill:var(--primary)]",
        info: "[--progress-fill:var(--info-text)]",
        success: "[--progress-fill:var(--success-text)]",
        warning: "[--progress-fill:var(--warning-text)]",
        critical: "[--progress-fill:var(--destructive-text)]",
        neutral: "opacity-55 [--progress-fill:var(--muted-foreground)]",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
)

type ProgressTone = NonNullable<
  VariantProps<typeof progressIndicatorVariants>["tone"]
>

function Progress({
  className,
  children,
  value,
  min = 0,
  max = 100,
  tone = "default",
  ...props
}: ProgressPrimitive.Root.Props & {
  /** Indicator tone. Follows consequence: see the Progress guidance. */
  tone?: ProgressTone
}) {
  const scale =
    value == null ? 1 : Math.min(1, Math.max(0, (value - min) / (max - min || 1)))
  return (
    <ProgressPrimitive.Root
      value={value}
      min={min}
      max={max}
      data-slot="progress"
      data-tone={tone}
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
      <ProgressTrack
        tone={tone}
        style={{ "--progress-scale": scale } as React.CSSProperties}
      >
        <ProgressIndicator tone={tone} className="w-full!" />
      </ProgressTrack>
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack({
  className,
  tone,
  ...props
}: ProgressPrimitive.Track.Props & { tone?: ProgressTone }) {
  return (
    <ProgressPrimitive.Track
      className={cn(progressTrackVariants(), className)}
      data-slot="progress-track"
      data-tone={tone}
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  tone,
  ...props
}: ProgressPrimitive.Indicator.Props & { tone?: ProgressTone }) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(progressIndicatorVariants({ tone }), className)}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "text-muted-foreground ms-auto text-sm tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressLabel,
  ProgressValue,
  type ProgressTone,
}
