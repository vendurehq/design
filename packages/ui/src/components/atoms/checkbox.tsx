"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn } from "@vendure-io/ui/lib/utils"
import {
  useFieldControlProps,
  useFieldLabelCheckedClass,
} from "@vendure-io/ui/components/atoms/field"

// Checking animates; unchecking plays back quicker.
// - The fill is the root's ::before, over the border. It closes in from the
//   corners and edges to the middle: an even-odd clip-path is the box with a
//   round hole, and the hole shrinks from just around the box (nothing shows)
//   to a point in the middle (all of it shows). The corners fill first.
//   Checking takes `moderate` on `ease-out`; unchecking opens the hole again
//   in `fast`.
// - The fill reveals the mark: the mark is always drawn, in the fill's
//   foreground, and its indicator takes the same clip with the same timing.
//   So the mark shows only where the fill already is, and the hole hides it
//   while it is open, on any background.
// - The check and the indeterminate line are two paths; only the one for the
//   current state shows. Checking or going indeterminate swaps them at once
//   (the hole hides the swap, or the fill is already whole). Unchecking keeps
//   the mark until the hole has opened, then swaps.
// - A press shrinks the box to 95% (`fast`, `ease-press`).
// Checking ends after `moderate` (150ms), unchecking after `fast` (100ms).
// Only transitions, no keyframes, so a fast toggle or a range selection
// reverses from wherever it is. Reduced motion keeps fades only: the fill and
// the mark are whole and fade in and out together. The root also transitions
// opacity, so a caller that fades the box in (the DataTable's hidden
// checkboxes) needs no transition of its own, which would replace this list.
// The DataTable delays the root, the ::before and the indicator for its
// select-all ripple.
const rootTransition =
  "[transition:border-color_var(--transition-duration-fast)_var(--ease-soft),box-shadow_var(--transition-duration-fast)_var(--ease-soft),opacity_var(--transition-duration-moderate)_var(--ease-default),scale_var(--transition-duration-fast)_var(--ease-press)] data-checked:[transition:border-color_var(--transition-duration-normal)_var(--ease-out),box-shadow_var(--transition-duration-fast)_var(--ease-soft),opacity_var(--transition-duration-moderate)_var(--ease-default),scale_var(--transition-duration-fast)_var(--ease-press)] data-indeterminate:[transition:border-color_var(--transition-duration-normal)_var(--ease-out),box-shadow_var(--transition-duration-fast)_var(--ease-soft),opacity_var(--transition-duration-moderate)_var(--ease-default),scale_var(--transition-duration-fast)_var(--ease-press)] not-data-disabled:active:scale-95 motion-reduce:active:scale-100"

// `--checkbox-hole` is how far open the hole is: 1 leaves no fill, 0 a full
// box. The root sets it and builds `--checkbox-clip` from it once; the fill
// and the mark's indicator both clip to that, each over the box plus its 1px
// border, and each transitions its own clip-path. The hole is a circle around
// the middle. At 1 its radius is half the box's diagonal plus 1px, so the
// corners are empty too; on the box's own edge, the clip's anti-aliasing left
// a hairline of fill at rest. The circle is a `shape()` with two half-circle
// arcs; their 1px radius is too small for the chord, so the browser scales it
// up to half the chord, a true circle at any size. A browser without `shape()`
// keeps a square hole that closes in from the edges over the same time.
const hole =
  "[--checkbox-hole:1] data-checked:[--checkbox-hole:0] data-indeterminate:[--checkbox-hole:0] motion-reduce:[--checkbox-hole:0] [--checkbox-clip:polygon(evenodd,-1px_-1px,calc(100%_+_1px)_-1px,calc(100%_+_1px)_calc(100%_+_1px),-1px_calc(100%_+_1px),-1px_-1px,calc(50%_-_var(--checkbox-hole)*(50%_+_1px))_calc(50%_-_var(--checkbox-hole)*(50%_+_1px)),calc(50%_+_var(--checkbox-hole)*(50%_+_1px))_calc(50%_-_var(--checkbox-hole)*(50%_+_1px)),calc(50%_+_var(--checkbox-hole)*(50%_+_1px))_calc(50%_+_var(--checkbox-hole)*(50%_+_1px)),calc(50%_-_var(--checkbox-hole)*(50%_+_1px))_calc(50%_+_var(--checkbox-hole)*(50%_+_1px)),calc(50%_-_var(--checkbox-hole)*(50%_+_1px))_calc(50%_-_var(--checkbox-hole)*(50%_+_1px)))] supports-[clip-path:shape(from_0_0,line_to_1px_1px)]:[--checkbox-clip:shape(evenodd_from_-1px_-1px,line_to_calc(100%_+_1px)_-1px,line_to_calc(100%_+_1px)_calc(100%_+_1px),line_to_-1px_calc(100%_+_1px),close,move_to_calc(50%_-_var(--checkbox-hole)*(70.711%_+_1px))_50%,arc_to_calc(50%_+_var(--checkbox-hole)*(70.711%_+_1px))_50%_of_1px_cw,arc_to_calc(50%_-_var(--checkbox-hole)*(70.711%_+_1px))_50%_of_1px_cw,close)]"

const fill =
  "before:absolute before:-inset-px before:rounded-[inherit] before:bg-primary before:[clip-path:var(--checkbox-clip)] before:[transition:clip-path_var(--transition-duration-fast)_var(--ease-soft)] data-checked:before:[transition:clip-path_var(--transition-duration-moderate)_var(--ease-out)] data-indeterminate:before:[transition:clip-path_var(--transition-duration-moderate)_var(--ease-out)] motion-reduce:before:opacity-0 motion-reduce:data-checked:before:opacity-100 motion-reduce:data-indeterminate:before:opacity-100 motion-reduce:before:[transition:opacity_var(--transition-duration-fast)_var(--ease-soft)] motion-reduce:data-checked:before:[transition:opacity_var(--transition-duration-normal)_var(--ease-soft)] motion-reduce:data-indeterminate:before:[transition:opacity_var(--transition-duration-normal)_var(--ease-soft)]"

// The indicator keys on its own state attributes, which Base UI sets to match the root's.
const indicator =
  "absolute -inset-px grid place-content-center text-primary-foreground [clip-path:var(--checkbox-clip)] [transition:clip-path_var(--transition-duration-fast)_var(--ease-soft)] data-checked:[transition:clip-path_var(--transition-duration-moderate)_var(--ease-out)] data-indeterminate:[transition:clip-path_var(--transition-duration-moderate)_var(--ease-out)] motion-reduce:opacity-0 motion-reduce:data-checked:opacity-100 motion-reduce:data-indeterminate:opacity-100 motion-reduce:[transition:opacity_var(--transition-duration-fast)_var(--ease-soft)] motion-reduce:data-checked:[transition:opacity_var(--transition-duration-normal)_var(--ease-soft)] motion-reduce:data-indeterminate:[transition:opacity_var(--transition-duration-normal)_var(--ease-soft)]"

// The swap waits `fast` while unchecking, so the leaving mark stays until the
// hole has opened. A 0s transition with a delay is a step at the end.
const markSwap =
  "[stroke-dasharray:1] [transition:opacity_0s_linear_var(--transition-duration-fast)] group-data-[checked]/checkbox:[transition-delay:0s] group-data-indeterminate/checkbox:[transition-delay:0s]"

// The check shows unless indeterminate (unchecked, the hole hides it), the line only while indeterminate.
const checkMark = "group-data-indeterminate/checkbox:opacity-0"
const lineMark = "opacity-0 group-data-indeterminate/checkbox:opacity-100"

function Checkbox({ className, indeterminate, ...props }: CheckboxPrimitive.Root.Props) {
  const fieldLabelChecked = useFieldLabelCheckedClass()
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={(state) => cn(
        "group/checkbox border-control-border dark:bg-input/30 data-checked:text-primary-foreground data-checked:border-primary data-indeterminate:text-primary-foreground data-indeterminate:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:focus-visible:outline-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:ring-3",
        rootTransition,
        hole,
        fill,
        fieldLabelChecked(state.checked && !state.indeterminate),
        typeof className === "function" ? className(state) : className
      )}
      indeterminate={indeterminate}
      {...useFieldControlProps(props)}
    >
      {/* Kept mounted: the fill reveals the mark while checking and hides it
          again while unchecking. */}
      <CheckboxPrimitive.Indicator
        keepMounted
        data-slot="checkbox-indicator"
        className={indicator}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="size-3.5"
        >
          <path d="M4 12l5 5L20 6" pathLength={1} className={`${markSwap} ${checkMark}`} />
          <path d="M5 12h14" pathLength={1} className={`${markSwap} ${lineMark}`} />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
