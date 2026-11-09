"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@vendure-io/ui/lib/utils"
import { fieldSurface } from "@vendure-io/ui/lib/field-surface"
import { useFieldControlProps } from "@vendure-io/ui/components/atoms/field"

// The v3 look: a 34px field on the `muted` tint with a 1px inset hairline in
// `border` (a real border only in forced-colors mode). Focus draws the ring
// 2px inside the field, over the hairline, so a field in a dialog or a dense
// form never touches its neighbours.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        fieldSurface,
        "file:text-foreground placeholder:text-faint-foreground h-8.5 w-full min-w-0 px-2.5 py-1 text-base file:inline-flex file:h-6.5 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...useFieldControlProps(props)}
    />
  )
}

export { Input }
