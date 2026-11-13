"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@vendure-io/ui/lib/utils"
import { ChevronsUpDownIcon, MoreHorizontalIcon } from "lucide-react"

import { Button } from "./button.tsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./dropdown-menu.tsx"
// Relative: `label-swap` is closed in the package exports.
import { LabelSwap } from "./label-swap.tsx"
import { menuItem, menuRadioItem, MenuCheck } from "../../lib/menu-item.tsx"

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="breadcrumb"
      data-slot="breadcrumb"
      className={cn(className)}
      {...props}
    />
  )
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm wrap-break-word sm:gap-2.5",
        className
      )}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

function BreadcrumbLink({
  className,
  render,
  ...props
}: useRender.ComponentProps<"a">) {
  return useRender({
    defaultTagName: "a",
    props: mergeProps<"a">(
      {
        className: cn("hover:text-foreground transition-colors", className),
      },
      props
    ),
    render,
    state: {
      slot: "breadcrumb-link",
    },
  })
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-page"
      role="link"
      aria-disabled="true"
      aria-current="page"
      className={cn("text-foreground-secondary font-medium", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("mx-0.5 [&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? (
        // A thin slanted slash, quieter than the crumbs on both sides.
        <span className="inline-block -skew-x-12 text-base leading-none font-light text-muted-foreground/40 select-none">
          /
        </span>
      )}
    </li>
  )
}

function BreadcrumbEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "flex size-5 items-center justify-center [&>svg]:size-4",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon
      />
      <span className="sr-only">More</span>
    </span>
  )
}

/** One item a `BreadcrumbMenu` can switch to. */
type BreadcrumbMenuOption = {
  value: string
  label: string
  /** Before the label, in the crumb and in the menu: a status dot. */
  leading?: React.ReactNode
  /** Muted text after the label in the menu only, such as a type. */
  detail?: React.ReactNode
  /** The row shows but cannot be picked. The arrow keys still stop on it. */
  disabled?: boolean
}

/**
 * A crumb that opens a menu to switch the current item, such as the
 * environment at the start of a breadcrumb. It shows the current option's
 * `leading` slot (a status dot) and label, and an up-down chevron. The menu
 * lists the options with a check on the current one and opens toward the
 * centre of the screen. Picking an option calls `onValueChange` and keeps the
 * menu open, so the check is seen moving; the crumb's label crossfades to the
 * new one and its width follows. `children` go after the options, such as a
 * separator and an "Add environment" item. The options and the switch stay
 * with the consumer.
 *
 * `label` names the list: it heads the menu and prefixes the crumb's
 * accessible name ("Environment: Production").
 */
function BreadcrumbMenu({
  options,
  value,
  onValueChange,
  label,
  children,
  className,
  contentClassName,
}: {
  options: readonly BreadcrumbMenuOption[]
  value: string
  onValueChange?: (value: string) => void
  label: string
  children?: React.ReactNode
  className?: string
  contentClassName?: string
}) {
  const active = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  )
  const current = options[active]
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="breadcrumb-menu"
        render={
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "text-foreground hover:text-foreground aria-expanded:text-foreground h-7.5 gap-2.25 rounded-lg ps-2.25 pe-1.75 text-sm font-semibold",
              className
            )}
          />
        }
      >
        {current?.leading}
        <span className="sr-only">{label}: </span>
        <LabelSwap
          timing="button"
          labels={options.map((option) => option.label)}
          active={active}
          className="justify-items-start overflow-x-clip whitespace-nowrap"
        />
        <ChevronsUpDownIcon
          aria-hidden
          className="size-3.5 opacity-40 group-hover/button:opacity-80 group-aria-expanded/button:opacity-80"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn("w-max max-w-90", contentClassName)}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <MenuPrimitive.RadioGroup
            value={value}
            onValueChange={(next: string) => onValueChange?.(next)}
          >
            {options.map((option) => (
              <MenuPrimitive.RadioItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                closeOnClick={false}
                data-slot="breadcrumb-menu-item"
                className={cn(menuItem, menuRadioItem)}
              >
                {option.leading}
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {option.detail != null && (
                  <span className="text-muted-foreground text-xs font-medium">
                    {option.detail}
                  </span>
                )}
                <MenuCheck />
              </MenuPrimitive.RadioItem>
            ))}
          </MenuPrimitive.RadioGroup>
        </DropdownMenuGroup>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export {
  Breadcrumb,
  BreadcrumbMenu,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
export type { BreadcrumbMenuOption }
