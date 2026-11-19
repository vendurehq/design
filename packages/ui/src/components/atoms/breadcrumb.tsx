"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"

import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@vendure-io/ui/lib/utils"
import { defaultFilter } from "cmdk"
import {
  ChevronsUpDownIcon,
  Loader2Icon,
  MoreHorizontalIcon,
  RefreshCwIcon,
} from "lucide-react"

import { Button } from "./button.tsx"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "./dropdown-menu.tsx"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command.tsx"
import { Popover, PopoverContent, PopoverTrigger } from "./popover.tsx"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip.tsx"
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

/** One item a `BreadcrumbMenu` or `BreadcrumbSearchMenu` can switch to. */
type BreadcrumbMenuOption = {
  value: string
  label: string
  /**
   * Before the label, in the crumb and in the menu: a status dot. Keep it
   * decorative (`aria-hidden`) and put its words in `status`.
   */
  leading?: React.ReactNode
  /**
   * The words for `leading`, such as "Healthy". A screen reader hears them
   * after the label: "Environment: Production, Healthy".
   */
  status?: string
  /** Muted text after the label in the menu only, such as a type. */
  detail?: React.ReactNode
  /** The row shows but cannot be picked. The arrow keys still stop on it. */
  disabled?: boolean
  /**
   * Renders the row as a link, so it can open in a new tab. It keeps the
   * `menuitemradio` role. An element such as a router `<Link>`; `href` is the
   * short form for a plain `<a>`. The link does the navigation: a plain
   * click follows it and still calls `onValueChange`, so do not navigate
   * there too. A click with a modifier key, or with the middle button, opens
   * the link elsewhere and does not call `onValueChange`. A disabled option
   * renders no link. `BreadcrumbMenu` only: a `BreadcrumbSearchMenu` row is
   * an option of a listbox, which cannot be a link.
   */
  render?: React.ReactElement
  href?: string
  /** More words the search of a `BreadcrumbSearchMenu` matches, such as a slug. */
  keywords?: readonly string[]
}

/** One item a `BreadcrumbSearchMenu` can switch to: no link rows. */
type BreadcrumbSearchMenuOption = Omit<BreadcrumbMenuOption, "render" | "href">

/** The props both crumb menus share. */
type BreadcrumbMenuBaseProps = {
  options: readonly BreadcrumbSearchMenuOption[]
  value: string
  onValueChange?: (value: string) => void
  /** Names the list: it heads the menu and starts the crumb's accessible name. */
  label: string
  /**
   * The crumb's label when no option has `value`, such as "All projects"
   * while none is open, or "Projects unavailable". It swaps like an option.
   */
  placeholder?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultOpen?: boolean
  className?: string
  contentClassName?: string
}

/** The open state, controlled or not, so the crumb knows it too. */
function useMenuOpen(
  open: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange: ((open: boolean) => void) | undefined
) {
  const [own, setOwn] = React.useState(defaultOpen)
  const current = open ?? own
  const set = React.useCallback(
    (next: boolean) => {
      setOwn(next)
      onOpenChange?.(next)
    },
    [onOpenChange]
  )
  return [current, set] as const
}

/**
 * The look of a crumb that opens a menu: a 28px ghost button (the `sm`
 * height, the same as `SidebarTrigger` beside it in a top bar) with the
 * current option's `leading` slot, its label and an up-down chevron. It may
 * shrink: the label then ends in an ellipsis and the crumb shows the full
 * label in a tooltip. Give its BreadcrumbItem `min-w-0`, and a `max-w-*` on
 * the crumb where it should stop growing. `--content-inset` is the real
 * start inset of its content (9px padding and the 1px border), so a row
 * under it can line up with the dot.
 */
const crumbTriggerClassName =
  "text-foreground hover:text-foreground aria-expanded:text-foreground min-w-0 shrink gap-2.25 rounded-lg ps-2.25 pe-1.75 text-sm font-semibold [--content-inset:calc(var(--spacing)*2.25+1px)]"

/**
 * The inside of the crumb, and its tooltip. The crumb's accessible name is
 * the list label, the option label and then the status, whatever shows
 * first: "Environment: Production, Healthy". With a `status` it is set as
 * `aria-label`, and words inside `leading` are not read. Without one it comes
 * from the content, `leading` first, as before.
 */
function useCrumbTrigger({
  options,
  value,
  label,
  placeholder,
  open,
}: Pick<BreadcrumbMenuBaseProps, "options" | "value" | "label" | "placeholder"> & {
  open: boolean
}) {
  const found = options.findIndex((option) => option.value === value)
  const fallback = placeholder !== undefined && found === -1
  // The placeholder has its own place before the options, so the options
  // arriving after a read swap the label, never rewrite it in place.
  const offset = placeholder === undefined ? 0 : 1
  const active = fallback ? 0 : Math.max(0, found) + offset
  const current = fallback ? undefined : options[active - offset]
  const labels = options.map((option) => option.label)
  if (placeholder !== undefined) labels.unshift(placeholder)
  const currentLabel = labels[active] ?? ""
  // With a status, the name is set so the status comes after the label.
  // Without one, the name comes from the content, as before.
  const name = current?.status ? `${label}: ${currentLabel}, ${current.status}` : undefined
  // Whether the label is cut now. Read when the pointer or the focus
  // arrives, so a resize or a new label is never stale.
  const [cut, setCut] = React.useState(false)
  const measure = (event: React.SyntheticEvent<HTMLElement>) => {
    const shown = event.currentTarget.querySelector<HTMLElement>(
      '[data-slot="breadcrumb-menu-label"] > [data-swap="in"]'
    )
    setCut(shown !== null && shown.scrollWidth > shown.clientWidth + 0.5)
  }
  const triggerProps = { "aria-label": name, onPointerEnter: measure, onFocus: measure }
  const content = (
    <>
      {current?.leading}
      <span className="sr-only">{label}: </span>
      <LabelSwap
        data-slot="breadcrumb-menu-label"
        timing="button"
        labels={labels}
        active={active}
        truncate
        activeKey={currentLabel}
        className="justify-items-start overflow-x-clip whitespace-nowrap"
      />
      <ChevronsUpDownIcon
        aria-hidden
        className="size-3.5 opacity-40 group-hover/button:opacity-80 group-aria-expanded/button:opacity-80"
      />
    </>
  )
  // The tooltip shows only for a cut label, and never over the open menu.
  const tooltip =
    cut && !open ? <TooltipContent side="bottom">{currentLabel}</TooltipContent> : null
  return { triggerProps, content, tooltip }
}

function stopPropagation(event: React.SyntheticEvent) {
  event.stopPropagation()
}

/**
 * Keeps focus and hover events in the open menu. React passes the events of
 * a portal up through its React parents, so a focus or a hover in the menu
 * would reach a tooltip, or any handler, that wraps the crumb, and open it
 * over the menu.
 */
const popupEventProps = {
  onFocus: stopPropagation,
  onBlur: stopPropagation,
  onPointerOver: stopPropagation,
  onPointerOut: stopPropagation,
  onPointerMove: stopPropagation,
  onMouseOver: stopPropagation,
  onMouseOut: stopPropagation,
  onMouseMove: stopPropagation,
}

/** The leading slot, the label, the status and the detail of a menu row. */
function OptionRow({ option }: { option: BreadcrumbSearchMenuOption }) {
  return (
    <>
      {option.leading}
      {option.status ? (
        // One text node for the name: a separate sr-only span after the
        // label would read "Production , Healthy".
        <>
          <span aria-hidden className="min-w-0 flex-1 truncate">
            {option.label}
          </span>
          <span className="sr-only">{`${option.label}, ${option.status}`}</span>
        </>
      ) : (
        <span className="min-w-0 flex-1 truncate">{option.label}</span>
      )}
      {option.detail != null && (
        // At the end of the row, before the check, in both menus.
        <span className="text-muted-foreground ms-auto shrink-0 ps-3 text-xs font-medium">
          {option.detail}
        </span>
      )}
    </>
  )
}

function isNewTabClick(event: Event | undefined) {
  if (!event || !("button" in event)) return false
  const pointer = event as MouseEvent
  return pointer.metaKey || pointer.ctrlKey || pointer.shiftKey || pointer.altKey || pointer.button === 1
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
 * `label` names the list: it heads the menu and starts the crumb's
 * accessible name ("Environment: Production, Healthy").
 *
 * A long label ends in an ellipsis when the crumb has no room, and a tooltip
 * shows it in full. An option with `href` or `render` is a link; the current
 * row stays a checked `menuitemradio`. `open` and `onOpenChange` control the
 * menu. For a long list with a search field, use `BreadcrumbSearchMenu`.
 */
function BreadcrumbMenu({
  options,
  value,
  onValueChange,
  label,
  placeholder,
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  children,
  className,
  contentClassName,
}: Omit<BreadcrumbMenuBaseProps, "options"> & {
  options: readonly BreadcrumbMenuOption[]
  children?: React.ReactNode
}) {
  const [open, setOpen] = useMenuOpen(openProp, defaultOpen, onOpenChange)
  const crumb = useCrumbTrigger({ options, value, label, placeholder, open })
  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <DropdownMenuTrigger
              data-slot="breadcrumb-menu"
              {...crumb.triggerProps}
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(crumbTriggerClassName, className)}
                />
              }
            />
          }
        >
          {crumb.content}
        </TooltipTrigger>
        {crumb.tooltip}
      </Tooltip>
      <DropdownMenuContent
        {...popupEventProps}
        className={cn("w-max min-w-72 max-w-90", contentClassName)}
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel>{label}</DropdownMenuLabel>
          <MenuPrimitive.RadioGroup
            value={value}
            onValueChange={(next: string, details) => {
              // A modifier or middle click opens a link row elsewhere: the
              // current item stays.
              if (isNewTabClick(details.event)) return
              onValueChange?.(next)
            }}
          >
            {options.map((option) => (
              <MenuPrimitive.RadioItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                closeOnClick={false}
                data-slot="breadcrumb-menu-item"
                render={option.disabled ? undefined : (option.render ?? (option.href !== undefined ? <a href={option.href} /> : undefined))}
                className={cn(menuItem, menuRadioItem)}
              >
                <OptionRow option={option} />
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

/**
 * The search of a `BreadcrumbSearchMenu`: the option's label and keywords,
 * never its value, which is often an id.
 */
function searchFilter(_value: string, search: string, keywords?: string[]) {
  return defaultFilter(keywords?.join(" ") ?? "", search)
}

/**
 * A `BreadcrumbMenu` with a search field, for a list that can grow long, such
 * as the projects of an organization. The crumb is the same, and so is its
 * label swap. The popup is a `Command`: a "Find …" field at the top, the
 * options with a check on the current one, then `children` in a footer that
 * stays in view while the list scrolls, such as "All projects" and "Create
 * project". The search matches the option labels and `keywords`.
 *
 * Picking an option calls `onValueChange` and closes the popup, so the crumb's
 * label is seen swapping. `loading` shows a loading row in place of the
 * options. `error` shows its text as a row that cannot be picked and, with
 * `onRetry`, a Retry row. A search that matches nothing shows `emptyText`.
 * Footer items are `CommandItem`s with `forceMount`, so a search does not
 * hide them, and close the popup themselves through `onOpenChange`.
 */
function BreadcrumbSearchMenu({
  options,
  value,
  onValueChange,
  label,
  placeholder,
  open: openProp,
  onOpenChange,
  defaultOpen = false,
  searchPlaceholder = `Find ${label.toLowerCase()}…`,
  emptyText = "No results.",
  loading = false,
  error,
  onRetry,
  children,
  className,
  contentClassName,
}: BreadcrumbMenuBaseProps & {
  /** The search field's placeholder. Default: "Find <label>…". */
  searchPlaceholder?: string
  /** Shows when the search matches no option. */
  emptyText?: React.ReactNode
  /** The options are on their way: a loading row shows in their place. */
  loading?: boolean
  /** The options could not be read: this text shows as a row. */
  error?: React.ReactNode
  /** With `error`, a Retry row calls it. */
  onRetry?: () => void
  /** Footer items: `CommandItem`s with `forceMount`. */
  children?: React.ReactNode
}) {
  const [open, setOpen] = useMenuOpen(openProp, defaultOpen, onOpenChange)
  const crumb = useCrumbTrigger({ options, value, label, placeholder, open })
  const failed = error != null && error !== false
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger
          render={
            <PopoverTrigger
              data-slot="breadcrumb-menu"
              {...crumb.triggerProps}
              render={
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(crumbTriggerClassName, className)}
                />
              }
            />
          }
        >
          {crumb.content}
        </TooltipTrigger>
        {crumb.tooltip}
      </Tooltip>
      <PopoverContent
        {...popupEventProps}
        data-slot="breadcrumb-search-menu-content"
        aria-label={label}
        className={cn("w-72 max-w-90 gap-0 overflow-hidden p-0", contentClassName)}
      >
        {/* A new Command once the error clears: cmdk keeps the Retry row
            selected after it unmounts, and the field then points at a row
            that is gone (aria-activedescendant). */}
        <Command key={failed ? "failed" : "read"} label={label} filter={searchFilter}>
          <CommandInput autoFocus placeholder={searchPlaceholder} />
          {/* Outside the list: a listbox takes only options and groups. */}
          {loading && (
            <div
              role="status"
              data-slot="breadcrumb-search-menu-loading"
              className="text-muted-foreground flex min-h-8.5 items-center gap-2.5 px-4 pt-2.5 pb-1 text-sm"
            >
              <Loader2Icon aria-hidden className="size-3.75 animate-spin motion-reduce:animate-none" />
              Loading…
            </div>
          )}
          <CommandList>
            {!loading && !failed && <CommandEmpty>{emptyText}</CommandEmpty>}
            {failed && !loading && (
              <CommandGroup forceMount heading={error}>
                {onRetry && (
                  <CommandItem forceMount value="__retry" onSelect={onRetry}>
                    <RefreshCwIcon />
                    <span className="min-w-0 truncate">Retry</span>
                  </CommandItem>
                )}
              </CommandGroup>
            )}
            {!loading && options.length > 0 && (
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    keywords={[option.label, ...(option.keywords ?? [])]}
                    disabled={option.disabled}
                    data-checked={option.value === value ? true : undefined}
                    data-slot="breadcrumb-menu-item"
                    onSelect={() => {
                      setOpen(false)
                      if (option.value !== value) onValueChange?.(option.value)
                    }}
                  >
                    <OptionRow option={option} />
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            {children != null && (
              // Sticky inside the scrolling list, so a long list keeps it in view.
              <CommandGroup
                forceMount
                data-slot="breadcrumb-search-menu-footer"
                className="bg-popover border-border sticky bottom-0 border-t"
              >
                {children}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export {
  Breadcrumb,
  BreadcrumbMenu,
  BreadcrumbSearchMenu,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
export type { BreadcrumbMenuOption, BreadcrumbSearchMenuOption }
