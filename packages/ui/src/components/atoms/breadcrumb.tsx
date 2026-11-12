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
}

/**
 * The check of the current row draws in: a path with pathLength 1 and a dash
 * of 1, its offset easing from 1 to 0. The row that loses the check fades it
 * out in `quick`, and its dash resets only after that, while hidden. A
 * transition runs only on a change, so the menu opens with the check in place.
 * With reduced motion the check only fades.
 */
const drawCheck =
  "size-3.5 shrink-0 stroke-[1.75] opacity-0 [transition:opacity_var(--transition-duration-quick)_var(--ease-soft)] group-data-checked/breadcrumb-menu-item:opacity-90 group-data-checked/breadcrumb-menu-item:[transition-duration:var(--transition-duration-fast)] motion-reduce:group-data-checked/breadcrumb-menu-item:[transition-duration:var(--transition-duration-normal)]"
const drawCheckPath =
  "[stroke-dasharray:1_2] [stroke-dashoffset:1] [transition:stroke-dashoffset_0s_linear_var(--transition-duration-quick)] group-data-checked/breadcrumb-menu-item:[stroke-dashoffset:0] group-data-checked/breadcrumb-menu-item:[transition:stroke-dashoffset_var(--transition-duration-normal)_var(--ease-out)] motion-reduce:transition-none motion-reduce:group-data-checked/breadcrumb-menu-item:transition-none"

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
                data-slot="breadcrumb-menu-item"
                className="group/breadcrumb-menu-item focus:bg-muted focus:text-foreground relative flex min-h-8.5 cursor-default items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-foreground-secondary outline-hidden select-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-checked:text-foreground data-checked:font-semibold data-disabled:pointer-events-none data-disabled:opacity-50"
              >
                {option.leading}
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {option.detail != null && (
                  <span className="text-muted-foreground text-xs font-medium">
                    {option.detail}
                  </span>
                )}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                  className={drawCheck}
                >
                  <path d="M20 6 9 17l-5-5" pathLength={1} className={drawCheckPath} />
                </svg>
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
