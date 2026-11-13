"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@vendure-io/ui/lib/utils"
import { popupMotion } from "../../lib/popup-motion.ts"
import { ChevronRightIcon, CheckIcon } from "lucide-react"
import { usePopupDir } from "../../lib/popup-direction.ts"
import { usePopupAlign } from "../../lib/popup-align.ts"
import { triggerSlot } from "../../lib/trigger-slot.ts"
import { menuItem, menuRadioItem, MenuCheck } from "../../lib/menu-item.tsx"

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger {...triggerSlot("dropdown-menu-trigger", props.render)} {...props} />
}

/**
 * Without an `align`, the menu opens toward the centre of the viewport: a
 * trigger in the right half lines the menu up with its right edge, so the menu
 * grows to the left and stays on screen, and a trigger in the left half lines
 * it up with its left edge. The side is picked each time the menu opens. A
 * menu that opens to the left or right of its trigger keeps "start". An
 * explicit `align` always wins.
 */
function DropdownMenuContent({
  align,
  alignOffset = 0,
  side = "bottom",
  sideOffset = 6,
  className,
  ref,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  // Without an align, the popup opens toward the centre of the screen.
  const { popupRef, align: positionAlign } = usePopupAlign(align, side, ref)
  const dir = usePopupDir()
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        dir={dir}
        className="isolate z-50 outline-none"
        align={positionAlign}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        {/* Opens with popupMotion, the motion every popup shares. */}
        {/* No w-(--anchor-width) here: pinning the popup to the trigger width makes wide items wrap — the popup sizes to its content, min-w-60 keeps the 240px floor of the v3 look */}
        <MenuPrimitive.Popup
          ref={popupRef}
          data-slot="dropdown-menu-content"
          className={cn("bg-popover text-popover-foreground shadow-overlay rounded-xl p-1.25 z-50 max-h-(--available-height) min-w-60 overflow-x-hidden overflow-y-auto outline-none data-closed:overflow-hidden", popupMotion, className )}
          {...props}
        />
      </MenuPrimitive.Positioner>
    </MenuPrimitive.Portal>
  )
}

function DropdownMenuGroup({ ...props }: MenuPrimitive.Group.Props) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

function DropdownMenuLabel({
  className,
  inset,
  ...props
}: MenuPrimitive.GroupLabel.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.GroupLabel
      data-slot="dropdown-menu-label"
      data-inset={inset}
      className={cn(
        "text-muted-foreground px-2 py-1.5 text-xs font-medium data-inset:ps-8",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  ...props
}: MenuPrimitive.Item.Props & {
  inset?: boolean
  variant?: "default" | "destructive"
}) {
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      data-inset={inset}
      data-variant={variant}
      className={cn(
        menuItem, "data-[variant=destructive]:text-destructive-text data-[variant=destructive]:not-data-disabled:focus:bg-destructive/10 data-[variant=destructive]:focus:text-destructive-text data-[variant=destructive]:*:[svg]:text-destructive-text data-[variant=destructive]:[&>svg:not([class*='opacity-'])]:opacity-100 not-data-[variant=destructive]:not-data-disabled:focus:**:not-data-[slot=dropdown-menu-shortcut]:text-accent-foreground group/dropdown-menu-item data-[variant=destructive]:data-disabled:text-destructive-text/50 data-[variant=destructive]:data-disabled:*:[svg]:text-destructive-text/50",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSub({ ...props }: MenuPrimitive.SubmenuRoot.Props) {
  return <MenuPrimitive.SubmenuRoot data-slot="dropdown-menu-sub" {...props} />
}

function DropdownMenuSubTrigger({
  className,
  inset,
  children,
  ...props
}: MenuPrimitive.SubmenuTrigger.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.SubmenuTrigger
      data-slot="dropdown-menu-sub-trigger"
      data-inset={inset}
      className={cn(
        menuItem, "not-data-[variant=destructive]:not-data-disabled:focus:**:not-data-[slot=dropdown-menu-shortcut]:text-accent-foreground data-popup-open:bg-muted data-popup-open:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ms-auto rtl:rotate-180" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -5,
  // Logical: the sub-menu opens to the left in a right-to-left layout.
  side = "inline-end",
  sideOffset = 0,
  className,
  ...props
}: React.ComponentProps<typeof DropdownMenuContent>) {
  return (
    <DropdownMenuContent
      data-slot="dropdown-menu-sub-content"
      className={cn(
        "w-auto min-w-[96px]",
        className
      )}
      align={align}
      alignOffset={alignOffset}
      side={side}
      sideOffset={sideOffset}
      {...props}
    />
  )
}

function DropdownMenuCheckboxItem({
  className,
  children,
  checked,
  inset,
  ...props
}: MenuPrimitive.CheckboxItem.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.CheckboxItem
      data-slot="dropdown-menu-checkbox-item"
      data-inset={inset}
      className={cn(
        menuItem, "not-data-disabled:focus:**:text-accent-foreground pe-8",
        className
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute end-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator className="flex [clip-path:inset(0)] transition-[clip-path] duration-moderate ease-out motion-safe:data-starting-style:[clip-path:inset(0_100%_0_0)]">
          <CheckIcon
          />
        </MenuPrimitive.CheckboxItemIndicator>
      </span>
      {children}
    </MenuPrimitive.CheckboxItem>
  )
}

function DropdownMenuRadioGroup({ ...props }: MenuPrimitive.RadioGroup.Props) {
  return (
    <MenuPrimitive.RadioGroup
      data-slot="dropdown-menu-radio-group"
      {...props}
    />
  )
}

function DropdownMenuRadioItem({
  className,
  children,
  inset,
  ...props
}: MenuPrimitive.RadioItem.Props & {
  inset?: boolean
}) {
  return (
    <MenuPrimitive.RadioItem
      data-slot="dropdown-menu-radio-item"
      data-inset={inset}
      className={cn(
        menuItem, menuRadioItem, "not-data-disabled:focus:**:text-accent-foreground pe-8",
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute end-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuCheck />
      </span>
      {children}
    </MenuPrimitive.RadioItem>
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: MenuPrimitive.Separator.Props) {
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn("bg-border -mx-1.25 my-1.25 h-px", className)}
      {...props}
    />
  )
}

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "text-muted-foreground ms-auto ps-4 text-xs",
        className
      )}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
}
