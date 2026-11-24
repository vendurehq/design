"use client"

import { Switch as SwitchPrimitive } from "@base-ui/react/switch"

import { cn } from "@vendure-io/ui/lib/utils"
import {
  useFieldControlProps,
  useFieldLabelCheckedClass,
} from "@vendure-io/ui/components/atoms/field"

// The thumb slides with `translate` and widens a little while pressed, both
// with the Checkbox's tokens. Only `translate`, `scale` and colours move, so
// nothing changes layout.
// - Checking: the track fills in `normal` on `ease-out` and the thumb slides
//   in `normal` on `ease-out`. Unchecking is quicker: `fast` on `ease-soft`
//   for the track, `moderate` on `ease-out` for the thumb.
// - A press stretches the thumb to 115% of its width (`fast`, `ease-press`)
//   toward the middle of the track: it grows from the side it rests on. The
//   scale is its own property, so it adds to the slide instead of replacing
//   it. A disabled switch does not respond.
// - Transitions only, no keyframes: a fast double toggle reverses from where
//   the thumb is, and nothing plays on first render, where there is no
//   previous value to move from.
// - Reduced motion: no slide and no stretch. The thumb is at its place at
//   once; only the colours fade.
const trackTransition =
  "[transition:background-color_var(--transition-duration-fast)_var(--ease-soft),border-color_var(--transition-duration-fast)_var(--ease-soft),box-shadow_var(--transition-duration-fast)_var(--ease-soft),opacity_var(--transition-duration-moderate)_var(--ease-default)] data-checked:[transition:background-color_var(--transition-duration-normal)_var(--ease-out),border-color_var(--transition-duration-normal)_var(--ease-out),box-shadow_var(--transition-duration-fast)_var(--ease-soft),opacity_var(--transition-duration-moderate)_var(--ease-default)]"

const thumbTransition =
  "[transition:translate_var(--transition-duration-moderate)_var(--ease-out),scale_var(--transition-duration-fast)_var(--ease-press),background-color_var(--transition-duration-fast)_var(--ease-soft)] data-checked:[transition:translate_var(--transition-duration-normal)_var(--ease-out),scale_var(--transition-duration-fast)_var(--ease-press),background-color_var(--transition-duration-normal)_var(--ease-out)] motion-reduce:[transition:background-color_var(--transition-duration-fast)_var(--ease-soft)] motion-reduce:data-checked:[transition:background-color_var(--transition-duration-normal)_var(--ease-soft)]"

const thumbPress =
  "origin-left data-checked:origin-right motion-safe:group-[:active:not([data-disabled])]/switch:scale-x-[1.15]"

function Switch({
  className,
  size = "default",
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default"
}) {
  const fieldLabelChecked = useFieldLabelCheckedClass()
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={(state) => cn(
        "data-checked:bg-primary data-unchecked:bg-control-border focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-invalid:focus-visible:outline-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent outline-none after:absolute after:-inset-x-3 after:-inset-y-2 aria-invalid:ring-3 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px]",
        trackTransition,
        fieldLabelChecked(state.checked),
        typeof className === "function" ? className(state) : className
      )}
      {...useFieldControlProps(props)}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          thumbTransition,
          thumbPress,
          "bg-background dark:data-unchecked:bg-foreground dark:data-checked:bg-primary-foreground pointer-events-none block rounded-full ring-0 group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
