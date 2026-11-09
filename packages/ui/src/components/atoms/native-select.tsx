"use client"

import * as React from "react"

import { cn } from "@vendure-io/ui/lib/utils"
import { fieldSurface } from "@vendure-io/ui/lib/field-surface"
import { useFieldControlProps } from "@vendure-io/ui/components/atoms/field"
import { ChevronDownIcon } from "lucide-react"

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default"
}

function NativeSelect({
  className,
  size = "default",
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        className
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        className={cn(fieldSurface, "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground h-8.5 w-full min-w-0 appearance-none py-1 pr-8 pl-2.5 text-sm select-none disabled:pointer-events-none disabled:cursor-not-allowed data-[size=sm]:h-8")}
        {...useFieldControlProps(props)}
      />
      <ChevronDownIcon className="text-muted-foreground pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 select-none" aria-hidden="true" data-slot="native-select-icon" />
    </div>
  )
}

function NativeSelectOption({ ...props }: React.ComponentProps<"option">) {
  return <option data-slot="native-select-option" {...props} />
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn(className)}
      {...props}
    />
  )
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
