"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn } from "@vendure-io/ui/lib/utils"
import { useFieldControlProps } from "@vendure-io/ui/components/atoms/field"

// Checking animates; unchecking plays back quicker. The timings follow the
// HeroUI Checkbox.
// - The fill is the root's ::before. It covers the border and grows from 70%
//   (`fast`, `ease-out`) while it fades in (`normal`). It never starts from 0:
//   nothing appears from nothing. Unchecking shrinks and fades it in `fast`.
// - The mark is drawn, not swapped: a path with pathLength 1 whose dash offset
//   runs from 1 to 0 at a constant speed (`moderate`, linear), a
//   `check-mark-delay` after the fill starts. The check starts on its short
//   stroke. Unchecking undraws it back to its start in `fast`.
// - A press shrinks the box to 95% (`fast`, `ease-press`).
// Only transitions, no keyframes, so a fast toggle or a range selection
// reverses from wherever it is. Reduced motion keeps fades only: the fill
// stays full size and the mark is whole, fading in and out. The root also
// transitions opacity, so a caller that fades the box in (the DataTable's
// hidden checkboxes) needs no transition of its own, which would replace
// this list.
const rootTransition =
  "[transition:border-color_var(--transition-duration-fast)_var(--ease-soft),box-shadow_var(--transition-duration-fast)_var(--ease-soft),opacity_var(--transition-duration-moderate)_var(--ease-default),scale_var(--transition-duration-fast)_var(--ease-press)] data-checked:[transition:border-color_var(--transition-duration-normal)_var(--ease-out),box-shadow_var(--transition-duration-fast)_var(--ease-soft),opacity_var(--transition-duration-moderate)_var(--ease-default),scale_var(--transition-duration-fast)_var(--ease-press)] data-indeterminate:[transition:border-color_var(--transition-duration-normal)_var(--ease-out),box-shadow_var(--transition-duration-fast)_var(--ease-soft),opacity_var(--transition-duration-moderate)_var(--ease-default),scale_var(--transition-duration-fast)_var(--ease-press)] not-data-disabled:active:scale-95 motion-reduce:active:scale-100"

const fill =
  "before:absolute before:-inset-px before:rounded-[inherit] before:bg-primary before:opacity-0 before:scale-70 before:[transition:opacity_var(--transition-duration-fast)_var(--ease-soft),scale_var(--transition-duration-fast)_var(--ease-soft)] data-checked:before:opacity-100 data-checked:before:scale-100 data-checked:before:[transition:opacity_var(--transition-duration-normal)_var(--ease-soft),scale_var(--transition-duration-fast)_var(--ease-out)] data-indeterminate:before:opacity-100 data-indeterminate:before:scale-100 data-indeterminate:before:[transition:opacity_var(--transition-duration-normal)_var(--ease-soft),scale_var(--transition-duration-fast)_var(--ease-out)] motion-reduce:before:scale-100"

const mark =
  "[stroke-dasharray:1] [stroke-dashoffset:1] [transition:stroke-dashoffset_var(--transition-duration-fast)_var(--ease-soft)] group-data-checked/checkbox:[stroke-dashoffset:0] group-data-checked/checkbox:[transition:stroke-dashoffset_var(--transition-duration-moderate)_linear_var(--transition-duration-check-mark-delay)] group-data-indeterminate/checkbox:[stroke-dashoffset:0] group-data-indeterminate/checkbox:[transition:stroke-dashoffset_var(--transition-duration-moderate)_linear_var(--transition-duration-check-mark-delay)] motion-reduce:[stroke-dashoffset:0] motion-reduce:opacity-0 motion-reduce:group-data-checked/checkbox:opacity-100 motion-reduce:group-data-indeterminate/checkbox:opacity-100 motion-reduce:[transition:opacity_var(--transition-duration-fast)_var(--ease-soft)] motion-reduce:group-data-checked/checkbox:[transition:opacity_var(--transition-duration-normal)_var(--ease-soft)] motion-reduce:group-data-indeterminate/checkbox:[transition:opacity_var(--transition-duration-normal)_var(--ease-soft)]"

function Checkbox({ className, indeterminate, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "group/checkbox border-control-border dark:bg-input/30 data-checked:text-primary-foreground data-checked:border-primary data-indeterminate:text-primary-foreground data-indeterminate:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:focus-visible:outline-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3",
        rootTransition,
        fill,
        className
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
          <path
            d={indeterminate ? "M5 12h14" : "M4 12l5 5L20 6"}
            pathLength={1}
            className={mark}
          />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
