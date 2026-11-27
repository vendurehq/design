"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@vendure-io/ui/lib/utils"
import { fieldSurface } from "../../lib/field-surface.ts"
import { Button } from "@vendure-io/ui/components/atoms/button"
import { Input } from "@vendure-io/ui/components/atoms/input"
import { Textarea } from "@vendure-io/ui/components/atoms/textarea"

function InputGroup({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & {
  /**
   * The field height: `default` is 34px, `sm` is 28px, the height of a small
   * Button. The input and the buttons inside follow it.
   */
  size?: "sm" | "default"
}) {
  return (
    <div
      data-slot="input-group"
      data-size={size}
      role="group"
      className={cn(
        fieldSurface,
        "has-[[data-slot=input-group-control]:focus-visible]:outline-solid has-[[data-slot=input-group-control]:focus-visible]:outline-2 has-[[data-slot=input-group-control]:focus-visible]:-outline-offset-2 has-[[data-slot=input-group-control]:focus-visible]:outline-ring has-[[data-slot][aria-invalid=true]]:outline-destructive has-[[data-slot][aria-invalid=true]]:inset-ring-destructive group/input-group relative flex h-8.5 data-[size=sm]:h-7 data-[size=sm]:has-[>textarea]:h-auto data-[size=sm]:has-[>[data-align=block-end]]:h-auto data-[size=sm]:has-[>[data-align=block-start]]:h-auto w-full min-w-0 items-center in-data-[slot=combobox-content]:focus-within:border-inherit in-data-[slot=combobox-content]:focus-within:ring-0 in-data-[slot=combobox-content]:outline-none! has-[>[data-align=block-end]]:h-auto has-[>[data-align=block-end]]:flex-col has-[>[data-align=block-start]]:h-auto has-[>[data-align=block-start]]:flex-col has-[>textarea]:h-auto has-[>[data-align=block-end]]:[&>input]:pt-3 has-[>[data-align=block-start]]:[&>input]:pb-3 has-[>[data-align=inline-end]]:[&>input]:pe-1.5 has-[>[data-align=inline-start]]:[&>input]:ps-1.5",
        className
      )}
      {...props}
    />
  )
}

// An inline addon starts 10px in, like the text of an Input. A button or kbd
// in it keeps to its old spot nearer the edge: its own padding puts its
// content about 10px in. Logical sides, so right-to-left mirrors it.
// A kbd in an addon drops its own fill and uses the secondary text colour
// and the input hairline, as the v3 look's search field does: its muted text
// on its fill on the field fill fails the axe contrast check.
const inputGroupAddonVariants = cva(
  // A CopyButton (24px) nests its corner like an xs InputGroupButton: the
  // field's 8px minus the gap, 5px in a 34px group and 2px in a 28px one.
  "[&>[data-slot=copy-button]]:rounded-[calc(var(--radius-xl)-5px)] group-data-[size=sm]/input-group:[&>[data-slot=copy-button]]:rounded-[calc(var(--radius-xl)-2px)] text-muted-foreground **:data-[slot=kbd]:bg-transparent **:data-[slot=kbd]:text-foreground-secondary **:data-[slot=kbd]:inset-ring-input h-auto gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>svg:not([class*='size-'])]:size-4 [&>svg:not([class*='stroke-'])]:stroke-[1.75] flex cursor-text items-center justify-center select-none",
  {
    variants: {
      align: {
        "inline-start":
          "ps-2.5 has-[>button]:-ms-1.5 has-[>kbd]:ms-[-0.275rem] order-first",
        "inline-end":
          "pe-2.5 has-[>button]:-me-1.5 has-[>kbd]:me-[-0.275rem] order-last",
        "block-start":
          "px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2 order-first w-full justify-start",
        "block-end":
          "px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2 order-last w-full justify-start",
      },
    },
    defaultVariants: {
      align: "inline-start",
    },
  }
)

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof inputGroupAddonVariants>) {
  return (
    <div
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest("button")) {
          return
        }
        e.currentTarget.parentElement?.querySelector("input")?.focus()
      }}
      {...props}
    />
  )
}

// The text sizes use 12px text, like a Button of the same size. The corner
// is the field's 8px minus the gap between the button and the field edge, so
// the two corners run parallel: a 24px button sits 5px inside a 34px field
// and 2px inside a 28px one, a 28px button 3px inside a 34px field and flush
// in a 28px one.
const inputGroupButtonVariants = cva(
  "gap-2 text-sm shadow-none flex items-center",
  {
    variants: {
      size: {
        xs: "h-6 gap-1 rounded-[calc(var(--radius-xl)-5px)] group-data-[size=sm]/input-group:rounded-[calc(var(--radius-xl)-2px)] px-1.5 text-xs [&>svg:not([class*='size-'])]:size-3.5",
        sm: "h-7 gap-1.5 rounded-[calc(var(--radius-xl)-3px)] group-data-[size=sm]/input-group:rounded-xl px-2.5 text-xs",
        "icon-xs":
          "size-6 rounded-[calc(var(--radius-xl)-5px)] group-data-[size=sm]/input-group:rounded-[calc(var(--radius-xl)-2px)] p-0 has-[>svg]:p-0",
        "icon-sm": "size-7 rounded-[calc(var(--radius-xl)-3px)] group-data-[size=sm]/input-group:rounded-xl p-0 has-[>svg]:p-0",
      },
    },
    defaultVariants: {
      size: "xs",
    },
  }
)

function InputGroupButton({
  className,
  type = "button",
  variant = "ghost",
  size = "xs",
  ...props
}: Omit<React.ComponentProps<typeof Button>, "size" | "type"> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: "button" | "submit" | "reset"
  }) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-muted-foreground flex items-center gap-2 text-sm [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75]",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({
  className,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "size">) {
  return (
    <Input
      data-slot="input-group-control"
      className={cn(
        "flex-1 rounded-none border-0 bg-transparent shadow-none inset-ring-0 aria-invalid:inset-ring-0 group-data-[size=sm]/input-group:h-7 ring-0 focus-visible:shadow-none focus-visible:ring-0 focus-visible:outline-none aria-invalid:shadow-none aria-invalid:focus-visible:shadow-none aria-invalid:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

function InputGroupTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      data-slot="input-group-control"
      className={cn(
        "flex-1 resize-none rounded-none border-0 bg-transparent py-2 shadow-none inset-ring-0 aria-invalid:inset-ring-0 ring-0 focus-visible:shadow-none focus-visible:ring-0 focus-visible:outline-none aria-invalid:shadow-none aria-invalid:focus-visible:shadow-none aria-invalid:ring-0 dark:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
}
