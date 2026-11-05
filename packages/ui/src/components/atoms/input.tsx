"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@vendure-io/ui/lib/utils"
import { useFieldControlProps } from "@vendure-io/ui/components/atoms/field"

// The v3 look: a 34px field on the `muted` tint with a 1px inset hairline in
// `border`. Focus draws the ring inside the field (2px inset), so a field in a
// dialog or a dense form never touches its neighbours.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "bg-muted shadow-[inset_0_0_0_1px_var(--border)] focus-visible:shadow-[inset_0_0_0_2px_var(--ring)] aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)] aria-invalid:focus-visible:shadow-[inset_0_0_0_2px_var(--destructive)] file:text-foreground placeholder:text-muted-foreground h-8.5 w-full min-w-0 rounded-lg px-2.5 py-1 text-base transition-shadow duration-120 ease-[ease] outline-none file:inline-flex file:h-6.5 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...useFieldControlProps(props)}
    />
  )
}

export { Input }
