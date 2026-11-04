"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@vendure-io/ui/lib/utils"

// Tone names follow the state dictionary; `critical` renders with the
// `destructive` slots. A toned bar sits on the tone's subtle track. The solid
// tone slots are too close to the neutral track in luminance (down to 1.1:1),
// so the fill uses a fixed ramp step in light mode (600: at least 3.97:1 on the
// track and 4.35:1 on the page) and the subtle foreground in dark mode (at
// least 8.58:1 on the track), meeting 3:1 non-text contrast in both.
// Each tone sets the fill as --progress-fill, so the solid bar and the
// indeterminate sweep share one colour.
const progressTrackVariants = cva(
  "relative flex h-1.5 w-full items-center overflow-x-hidden rounded-full",
  {
    variants: {
      tone: {
        default: "bg-control-border",
        success: "bg-success-subtle",
        warning: "bg-warning-subtle",
        critical: "bg-destructive-subtle",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  }
)

// With `value={null}` the bar is indeterminate: a soft band of the fill
// sweeps across the track. Under reduced motion it stays a static partial bar.
// A known value animates its width with the drawer easing.
const progressIndicatorVariants = cva(
  "h-full bg-(color:--progress-fill) transition-[width] duration-moderate ease-drawer motion-reduce:transition-none data-indeterminate:w-2/5 motion-safe:data-indeterminate:w-full motion-safe:data-indeterminate:animate-shimmer motion-safe:data-indeterminate:bg-transparent motion-safe:data-indeterminate:bg-linear-to-r motion-safe:data-indeterminate:from-transparent motion-safe:data-indeterminate:from-30% motion-safe:data-indeterminate:via-(color:--progress-fill) motion-safe:data-indeterminate:via-50% motion-safe:data-indeterminate:to-transparent motion-safe:data-indeterminate:to-70% motion-safe:data-indeterminate:bg-size-[200%_100%]",
  {
  variants: {
    tone: {
      default: "[--progress-fill:var(--color-primary)]",
      success:
        "[--progress-fill:var(--color-success-600)] dark:[--progress-fill:var(--color-success-subtle-foreground)]",
      warning:
        "[--progress-fill:var(--color-warning-600)] dark:[--progress-fill:var(--color-warning-subtle-foreground)]",
      critical:
        "[--progress-fill:var(--color-destructive-600)] dark:[--progress-fill:var(--color-destructive-subtle-foreground)]",
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
  tone = "default",
  ...props
}: ProgressPrimitive.Root.Props & {
  /** Indicator tone. Follows consequence: see the Progress guidance. */
  tone?: ProgressTone
}) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      data-tone={tone}
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
      <ProgressTrack tone={tone}>
        <ProgressIndicator tone={tone} />
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
      className={cn(progressTrackVariants({ tone }), className)}
      data-slot="progress-track"
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
        "text-muted-foreground ml-auto text-sm tabular-nums",
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
