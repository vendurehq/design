"use client"

import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@vendure-io/ui/lib/utils"

// Tone names follow the state dictionary; `critical` renders with the
// `destructive` slots. A toned bar pairs the tone's subtle track with its
// subtle foreground fill: the solid tone slots sit too close to the neutral
// track in luminance (down to 1.1:1), while subtle foreground on subtle is
// checked at 4.5:1 in both modes by @vendure-io/design-tokens.
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

const progressIndicatorVariants = cva("h-full transition-all", {
  variants: {
    tone: {
      default: "bg-primary",
      success: "bg-success-subtle-foreground",
      warning: "bg-warning-subtle-foreground",
      critical: "bg-destructive-subtle-foreground",
    },
  },
  defaultVariants: {
    tone: "default",
  },
})

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
