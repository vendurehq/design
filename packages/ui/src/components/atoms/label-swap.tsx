"use client"

import * as React from "react"

import { useActiveLabelSize } from "../../hooks/use-active-label-size.ts"
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
  /**
   * The swap may shrink below the active label's width, and the label then
   * ends in an ellipsis. The swap still eases to the label's full width; its
   * container (a flex row with `min-w-0`) decides how much of it shows.
   */
  truncate?: boolean
  /**
   * Changes when the active label's text changes at the same index, such as
   * a placeholder that becomes the first loaded option. The swap then
   * measures again: a cut label's box does not grow by itself.
   */
  activeKey?: string
}

/** The label a swap shows, and whether it arrived without the swap. */
type Shown = { active: number; label: React.ReactNode; still: boolean }

/**
 * The next `Shown` when `active` or its label changes, or `undefined` when
 * nothing changed. A move to another index whose label has the same words
 * (text or a number) is still: the words do not change, so nothing moves.
 * A new text at the same index rewrites in place, as before.
 */
function nextShown(shown: Shown, active: number, label: React.ReactNode): Shown | undefined {
  if (shown.active === active && shown.label === label) return undefined
  const sameWords =
    (typeof label === "string" || typeof label === "number") && shown.label === label
  return { active, label, still: shown.active !== active && sameWords }
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
 * When `active` moves to a label with the same words as the one shown, the
 * labels change places without a transition, so nothing moves.
 */
function LabelSwap({
  labels,
  active,
  timing,
  labelClassName,
  truncate = false,
  activeKey,
  className,
  style,
  ...props
}: LabelSwapProps) {
  const { refs, width, height } = useActiveLabelSize(active, { natural: truncate, key: activeKey })
  // Kept across renders, so a move between labels with the same words is
  // known in the render that makes it.
  const [shown, setShown] = React.useState<Shown>({ active, label: labels[active], still: false })
  const next = nextShown(shown, active, labels[active])
  if (next) setShown(next)
  const still = (next ?? shown).still ? { transition: "none" } : undefined
  // While the width eases, a growing label is clipped, as without
  // `truncate`; the ellipsis shows only at rest, so it does not flash.
  const [resizing, setResizing] = React.useState(false)
  const onResize = (running: boolean) => (event: React.TransitionEvent<HTMLSpanElement>) => {
    if (event.target === event.currentTarget && event.propertyName === "width") setResizing(running)
  }
  const resizeHandlers = truncate
    ? {
        onTransitionRun: onResize(true),
        onTransitionEnd: onResize(false),
        onTransitionCancel: onResize(false),
      }
    : undefined
  return (
    <span
      data-resizing={resizing ? "" : undefined}
      {...resizeHandlers}
      className={cn(
        "grid grid-cols-[100%] justify-items-center motion-safe:transition-[width,height] motion-safe:duration-(--label-swap-resize) motion-safe:ease-drawer",
        TIMINGS[timing],
        truncate && "min-w-0 shrink",
        className
      )}
      style={width === undefined ? { ...style, ...still } : { ...style, ...still, width, height }}
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
          style={still}
          aria-hidden={index === active ? undefined : true}
          className={cn(
            "col-start-1 row-start-1 [transition:opacity_var(--label-swap-fade)_var(--ease-soft),translate_var(--label-swap-move)_var(--ease-out),filter_var(--label-swap-fade)_var(--ease-soft)] data-[swap=after]:opacity-0 data-[swap=before]:opacity-0 motion-safe:data-[swap=after]:translate-y-(--label-swap-shift) motion-safe:data-[swap=before]:-translate-y-(--label-swap-shift) motion-safe:data-[swap=after]:blur-[2px] motion-safe:data-[swap=before]:blur-[2px]",
            truncate && "max-w-full truncate in-data-resizing:text-clip",
            labelClassName
          )}
        >
          {label}
        </span>
      ))}
    </span>
  )
}

export { LabelSwap, nextShown }
export type { LabelSwapProps }
