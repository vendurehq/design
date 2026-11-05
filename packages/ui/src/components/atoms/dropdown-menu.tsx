"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@vendure-io/ui/lib/utils"
import { ChevronRightIcon, CheckIcon } from "lucide-react"

function DropdownMenu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuPortal({ ...props }: MenuPrimitive.Portal.Props) {
  return <MenuPrimitive.Portal data-slot="dropdown-menu-portal" {...props} />
}

function DropdownMenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="dropdown-menu-trigger" {...props} />
}

function DropdownMenuContent({
  align = "start",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 6,
  className,
  ...props
}: MenuPrimitive.Popup.Props &
  Pick<
    MenuPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        className="isolate z-50 outline-none"
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        {/* Opens with a 2px drop away from the trigger: opacity 160ms, scale and translate 200ms on the strong ease-out; closes in 120ms. Reduced motion keeps the fade. */}
        {/* No w-(--anchor-width) here: pinning the popup to the trigger width makes wide items wrap — the popup sizes to its content, min-w-32 keeps the floor */}
        <MenuPrimitive.Popup
          data-slot="dropdown-menu-content"
          className={cn("bg-popover text-popover-foreground shadow-overlay rounded-xl p-1.25 z-50 max-h-(--available-height) min-w-32 overflow-x-hidden overflow-y-auto outline-none data-closed:overflow-hidden origin-(--transform-origin) transition-[opacity,scale,translate] [transition-duration:160ms,200ms,200ms] ease-(--ease-out) data-starting-style:opacity-0 data-ending-style:opacity-0 data-ending-style:duration-120 data-ending-style:ease-[ease] motion-safe:data-starting-style:scale-96 motion-safe:data-ending-style:scale-96 motion-safe:data-starting-style:-translate-y-0.5 motion-safe:data-ending-style:-translate-y-0.5 motion-safe:data-[side=top]:data-starting-style:translate-y-0.5 motion-safe:data-[side=top]:data-ending-style:translate-y-0.5", className )}
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
        "text-muted-foreground px-2 py-1.5 text-xs font-medium data-inset:pl-8",
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
        "focus:bg-accent focus:text-accent-foreground data-[variant=destructive]:text-destructive-text data-[variant=destructive]:focus:bg-destructive/10 dark:data-[variant=destructive]:focus:bg-destructive/20 data-[variant=destructive]:focus:text-destructive-text data-[variant=destructive]:*:[svg]:text-destructive-text data-[variant=destructive]:[&>svg:not([class*='opacity-'])]:opacity-100 not-data-[variant=destructive]:focus:**:text-accent-foreground group/dropdown-menu-item relative flex min-h-8.5 cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground-secondary outline-hidden select-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75] [&>svg:not([class*='opacity-'])]:opacity-55 [&>svg:not([class*='opacity-'])]:transition-opacity [&>svg:not([class*='opacity-'])]:duration-(--transition-duration-moderate) focus:[&>svg:not([class*='opacity-'])]:opacity-85",
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
        "focus:bg-accent focus:text-accent-foreground data-open:bg-accent data-open:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-popup-open:bg-accent data-popup-open:text-accent-foreground relative flex min-h-8.5 cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground-secondary outline-hidden select-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75] [&>svg:not([class*='opacity-'])]:opacity-55 [&>svg:not([class*='opacity-'])]:transition-opacity [&>svg:not([class*='opacity-'])]:duration-(--transition-duration-moderate) focus:[&>svg:not([class*='opacity-'])]:opacity-85",
        className
      )}
      {...props}
    >
      {children}
      <ChevronRightIcon className="ml-auto" />
    </MenuPrimitive.SubmenuTrigger>
  )
}

function DropdownMenuSubContent({
  align = "start",
  alignOffset = -5,
  side = "right",
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
        "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground relative flex min-h-8.5 cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground-secondary outline-hidden select-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75] [&>svg:not([class*='opacity-'])]:opacity-55 [&>svg:not([class*='opacity-'])]:transition-opacity [&>svg:not([class*='opacity-'])]:duration-(--transition-duration-moderate) focus:[&>svg:not([class*='opacity-'])]:opacity-85 pr-8",
        className
      )}
      checked={checked}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-checkbox-item-indicator"
      >
        <MenuPrimitive.CheckboxItemIndicator className="flex [clip-path:inset(0)] transition-[clip-path] duration-(--transition-duration-moderate) ease-(--ease-out) motion-safe:data-starting-style:[clip-path:inset(0_100%_0_0)]">
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
        "focus:bg-accent focus:text-accent-foreground focus:**:text-accent-foreground relative flex min-h-8.5 cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground-secondary outline-hidden select-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-disabled:pointer-events-none data-disabled:opacity-50 data-inset:pl-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75] [&>svg:not([class*='opacity-'])]:opacity-55 [&>svg:not([class*='opacity-'])]:transition-opacity [&>svg:not([class*='opacity-'])]:duration-(--transition-duration-moderate) focus:[&>svg:not([class*='opacity-'])]:opacity-85 pr-8",
        className
      )}
      {...props}
    >
      <span
        className="pointer-events-none absolute right-2 flex items-center justify-center"
        data-slot="dropdown-menu-radio-item-indicator"
      >
        <MenuPrimitive.RadioItemIndicator className="flex [clip-path:inset(0)] transition-[clip-path] duration-(--transition-duration-moderate) ease-(--ease-out) motion-safe:data-starting-style:[clip-path:inset(0_100%_0_0)]">
          <CheckIcon
          />
        </MenuPrimitive.RadioItemIndicator>
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
        "text-muted-foreground group-focus/dropdown-menu-item:text-accent-foreground ml-auto text-xs tracking-widest",
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
