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
// - The mark is drawn, not swapped: a path with pathLength 1 whose dash offset
//   runs from 1 to 0 at a constant speed (`moderate`, linear), a
//   `check-mark-delay` after the fill starts. The check starts on its short
//   stroke, near the edge the fill reaches first. Unchecking undraws it in
//   `fast`. The check and the indeterminate line are two paths, so checked to
//   indeterminate undraws one while the other draws, with no blank frame.
// - A press shrinks the box to 95% (`fast`, `ease-press`).
// Checking ends after about 165ms, unchecking after 100ms. Only transitions,
// no keyframes, so a fast toggle or a range selection reverses from wherever
// it is. Reduced motion keeps fades only: the fill is whole and the mark is
// drawn, and both fade in and out. The root also transitions opacity, so a
// caller that fades the box in (the DataTable's hidden checkboxes) needs no
// transition of its own, which would replace this list. The DataTable delays
// the root, the ::before and the paths for its select-all ripple.
const rootTransition =
  "[transition:border-color_var(--transition-duration-fast)_var(--ease-soft),box-shadow_var(--transition-duration-fast)_var(--ease-soft),opacity_var(--transition-duration-moderate)_var(--ease-default),scale_var(--transition-duration-fast)_var(--ease-press)] data-checked:[transition:border-color_var(--transition-duration-normal)_var(--ease-out),box-shadow_var(--transition-duration-fast)_var(--ease-soft),opacity_var(--transition-duration-moderate)_var(--ease-default),scale_var(--transition-duration-fast)_var(--ease-press)] data-indeterminate:[transition:border-color_var(--transition-duration-normal)_var(--ease-out),box-shadow_var(--transition-duration-fast)_var(--ease-soft),opacity_var(--transition-duration-moderate)_var(--ease-default),scale_var(--transition-duration-fast)_var(--ease-press)] not-data-disabled:active:scale-95 motion-reduce:active:scale-100"

// `--checkbox-hole` is how far open the hole in the fill is: 1 leaves no fill,
// 0 a full box. The hole is a circle around the middle. At 1 its radius is
// half the box's diagonal plus 1px, so the corners are empty too; on the box's
// own edge, the clip's anti-aliasing left a hairline of fill at rest. The
// circle is a `shape()` with two half-circle arcs; their 1px radius is too
// small for the chord, so the browser scales it up to half the chord, a true
// circle at any size. A browser without `shape()` keeps a square hole that
// closes in from the edges over the same time.
const fill =
  "before:absolute before:-inset-px before:rounded-[inherit] before:bg-primary before:[--checkbox-hole:1] before:[clip-path:polygon(evenodd,-1px_-1px,calc(100%_+_1px)_-1px,calc(100%_+_1px)_calc(100%_+_1px),-1px_calc(100%_+_1px),-1px_-1px,calc(50%_-_var(--checkbox-hole)*(50%_+_1px))_calc(50%_-_var(--checkbox-hole)*(50%_+_1px)),calc(50%_+_var(--checkbox-hole)*(50%_+_1px))_calc(50%_-_var(--checkbox-hole)*(50%_+_1px)),calc(50%_+_var(--checkbox-hole)*(50%_+_1px))_calc(50%_+_var(--checkbox-hole)*(50%_+_1px)),calc(50%_-_var(--checkbox-hole)*(50%_+_1px))_calc(50%_+_var(--checkbox-hole)*(50%_+_1px)),calc(50%_-_var(--checkbox-hole)*(50%_+_1px))_calc(50%_-_var(--checkbox-hole)*(50%_+_1px)))] supports-[clip-path:shape(from_0_0,line_to_1px_1px)]:before:[clip-path:shape(evenodd_from_-1px_-1px,line_to_calc(100%_+_1px)_-1px,line_to_calc(100%_+_1px)_calc(100%_+_1px),line_to_-1px_calc(100%_+_1px),close,move_to_calc(50%_-_var(--checkbox-hole)*(70.711%_+_1px))_50%,arc_to_calc(50%_+_var(--checkbox-hole)*(70.711%_+_1px))_50%_of_1px_cw,arc_to_calc(50%_-_var(--checkbox-hole)*(70.711%_+_1px))_50%_of_1px_cw,close)] before:[transition:clip-path_var(--transition-duration-fast)_var(--ease-soft)] data-checked:before:[--checkbox-hole:0] data-checked:before:[transition:clip-path_var(--transition-duration-moderate)_var(--ease-out)] data-indeterminate:before:[--checkbox-hole:0] data-indeterminate:before:[transition:clip-path_var(--transition-duration-moderate)_var(--ease-out)] motion-reduce:before:[--checkbox-hole:0] motion-reduce:before:opacity-0 motion-reduce:data-checked:before:opacity-100 motion-reduce:data-indeterminate:before:opacity-100 motion-reduce:before:[transition:opacity_var(--transition-duration-fast)_var(--ease-soft)] motion-reduce:data-checked:before:[transition:opacity_var(--transition-duration-normal)_var(--ease-soft)] motion-reduce:data-indeterminate:before:[transition:opacity_var(--transition-duration-normal)_var(--ease-soft)]"

const markBase =
  "[stroke-dasharray:1] [stroke-dashoffset:1] [transition:stroke-dashoffset_var(--transition-duration-fast)_var(--ease-soft)] motion-reduce:[stroke-dashoffset:0] motion-reduce:opacity-0 motion-reduce:[transition:opacity_var(--transition-duration-fast)_var(--ease-soft)]"

// The check draws while checked and not indeterminate, the line while indeterminate.
const checkMark =
  "group-data-[checked]/checkbox:group-not-data-indeterminate/checkbox:[stroke-dashoffset:0] group-data-[checked]/checkbox:group-not-data-indeterminate/checkbox:[transition:stroke-dashoffset_var(--transition-duration-moderate)_linear_var(--transition-duration-check-mark-delay)] motion-reduce:group-data-[checked]/checkbox:group-not-data-indeterminate/checkbox:opacity-100 motion-reduce:group-data-[checked]/checkbox:group-not-data-indeterminate/checkbox:[transition:opacity_var(--transition-duration-normal)_var(--ease-soft)]"

const lineMark =
  "group-data-indeterminate/checkbox:[stroke-dashoffset:0] group-data-indeterminate/checkbox:[transition:stroke-dashoffset_var(--transition-duration-moderate)_linear_var(--transition-duration-check-mark-delay)] motion-reduce:group-data-indeterminate/checkbox:opacity-100 motion-reduce:group-data-indeterminate/checkbox:[transition:opacity_var(--transition-duration-normal)_var(--ease-soft)]"

function Checkbox({ className, indeterminate, ...props }: CheckboxPrimitive.Root.Props) {
  const fieldLabelChecked = useFieldLabelCheckedClass()
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={(state) => cn(
        "group/checkbox border-control-border dark:bg-input/30 data-checked:text-primary-foreground data-checked:border-primary data-indeterminate:text-primary-foreground data-indeterminate:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:focus-visible:outline-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 data-disabled:cursor-not-allowed data-disabled:opacity-50 aria-invalid:ring-3",
        rootTransition,
        fill,
        fieldLabelChecked(state.checked && !state.indeterminate),
        typeof className === "function" ? className(state) : className
      )}
      indeterminate={indeterminate}
      {...useFieldControlProps(props)}
    >
      {/* Kept mounted, so the mark can undraw after an uncheck. The mark sits
          on the fill only, so it keeps the fill's foreground while it leaves. */}
      <CheckboxPrimitive.Indicator
        keepMounted
        data-slot="checkbox-indicator"
        className="relative grid place-content-center text-primary-foreground"
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
          <path d="M4 12l5 5L20 6" pathLength={1} className={`${markBase} ${checkMark}`} />
          <path d="M5 12h14" pathLength={1} className={`${markBase} ${lineMark}`} />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
