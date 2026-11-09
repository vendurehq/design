"use client"

import * as React from "react"

import { cn } from "@vendure-io/ui/lib/utils"
import { fieldSurface } from "@vendure-io/ui/lib/field-surface"
import { useFieldControlProps } from "@vendure-io/ui/components/atoms/field"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        fieldSurface,
        "placeholder:text-faint-foreground flex field-sizing-content min-h-16 w-full px-2.5 py-2 text-base disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...useFieldControlProps(props)}
    />
  )
}

export { Textarea }
