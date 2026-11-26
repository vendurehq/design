"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@vendure-io/ui/lib/utils"
import { fieldSurface } from "@vendure-io/ui/lib/field-surface"
import { useFieldControlProps } from "@vendure-io/ui/components/atoms/field"

type InputProps = Omit<React.ComponentProps<"input">, "size"> & {
  /**
   * The field height: `default` is 34px, `sm` is 28px, the height of a small
   * Button, for a dense toolbar or a search field next to small buttons. The
   * native numeric `size` attribute is not supported; set a width instead.
   */
  size?: "sm" | "default"
}

// The v3 look: a 34px field on the `muted` tint with a 1px inset hairline in
// `border` (a real border only in forced-colors mode). Focus draws the ring
// 2px inside the field, over the hairline, so a field in a dialog or a dense
// form never touches its neighbours.
function Input({ className, type, size = "default", ...props }: InputProps) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      data-size={size}
      className={cn(
        fieldSurface,
        "file:text-foreground placeholder:text-faint-foreground h-8.5 data-[size=sm]:h-7 w-full min-w-0 px-2.5 py-1 text-base file:inline-flex file:h-6.5 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...useFieldControlProps(props)}
    />
  )
}

export { Input }
