"use client"

import * as React from "react"

import { useActiveLabelSize } from "@vendure-io/ui/hooks/use-active-label-size"
import { cn } from "@vendure-io/ui/lib/utils"

/**
 * How far a label slides and how long each part takes. `button`: 4px, the
 * label fades in `moderate` and slides and resizes in `normal`. `tooltip`:
 * 6px, on the tooltip label durations (fade 180ms, slide 260ms, resize
 * 320ms).
 */
const TIMINGS = {
  button:
    "[--label-swap-shift:calc(var(--spacing)*1)] [--label-swap-fade:var(--transition-duration-moderate)] [--label-swap-move:var(--transition-duration-normal)] [--label-swap-resize:var(--transition-duration-normal)]",
  tooltip:
    "[--label-swap-shift:calc(var(--spacing)*1.5)] [--label-swap-fade:var(--transition-duration-tooltip-label-fade)] [--label-swap-move:var(--transition-duration-tooltip-label-move)] [--label-swap-resize:var(--transition-duration-tooltip-resize)]",
} as const

type LabelSwapProps = Omit<React.ComponentProps<"span">, "children"> & {
  labels: readonly React.ReactNode[]
  active: number
  timing: keyof typeof TIMINGS
  /** Classes for each label, after the shared ones. */
  labelClassName?: string
}

/**
 * Internal: the one label swap behind `ButtonLabelSwap` and
 * `TooltipLabelSwap`. Not exported from the package.
 *
 * The labels share one grid cell and `active` picks the one that shows; the
 * others are hidden from the accessible name. A label before it leaves
 * upward, a label after it waits below, both faded out with a 2px blur, and
 * the swap eases to the active label's width and height on the drawer curve.
 * The size follows the label while it is active (see `useActiveLabelSize`).
 * With reduced motion the labels only crossfade, and the size changes at once.
 */
function LabelSwap({
  labels,
  active,
  timing,
  labelClassName,
  className,
  style,
  ...props
}: LabelSwapProps) {
  const { refs, width, height } = useActiveLabelSize(active)
  return (
    <span
      className={cn(
        "grid grid-cols-[100%] justify-items-center motion-safe:transition-[width,height] motion-safe:duration-(--label-swap-resize) motion-safe:ease-drawer",
        TIMINGS[timing],
        className
      )}
      style={width === undefined ? style : { ...style, width, height }}
      {...props}
    >
      {labels.map((label, index) => (
        <span
          // The labels are positions in a fixed list, so the index is their identity.
          key={index}
          ref={(element) => {
            refs.current[index] = element
          }}
          data-swap={index === active ? "in" : index < active ? "before" : "after"}
          aria-hidden={index === active ? undefined : true}
          className={cn(
            "col-start-1 row-start-1 [transition:opacity_var(--label-swap-fade)_var(--ease-soft),translate_var(--label-swap-move)_var(--ease-out),filter_var(--label-swap-fade)_var(--ease-soft)] data-[swap=after]:opacity-0 data-[swap=before]:opacity-0 motion-safe:data-[swap=after]:translate-y-(--label-swap-shift) motion-safe:data-[swap=before]:-translate-y-(--label-swap-shift) motion-safe:data-[swap=after]:blur-[2px] motion-safe:data-[swap=before]:blur-[2px]",
            labelClassName
          )}
        >
          {label}
        </span>
      ))}
    </span>
  )
}

export { LabelSwap }
export type { LabelSwapProps }
