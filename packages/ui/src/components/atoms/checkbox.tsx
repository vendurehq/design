"use client"

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn } from "@vendure-io/ui/lib/utils"
import { CheckIcon } from "lucide-react"

function Checkbox({
  className,
  checked,
  ...props
}: Omit<CheckboxPrimitive.Root.Props, "checked"> & {
  checked?: CheckboxPrimitive.Root.Props["checked"] | null
}) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      // Coerce a null value (e.g. a react-hook-form field that starts null) to
      // false so the checkbox stays controlled; undefined is left untouched to
      // preserve uncontrolled / defaultChecked usage.
      checked={checked === null ? false : checked}
      className={cn(
        "border-input dark:bg-input/30 data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary data-checked:border-primary aria-invalid:aria-checked:border-primary aria-invalid:border-destructive dark:aria-invalid:border-destructive/50 focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border transition-shadow outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
