"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"

import { cn } from "@vendure-io/ui/lib/utils"
import { MenuCheck, menuCheckItem, menuItemDisabled } from "../../lib/menu-item.tsx"
import { statusChipRing } from "@vendure-io/ui/lib/tint-recipes"
import { fieldSurface, fieldSurfaceWithin } from "@vendure-io/ui/lib/field-surface"
import { popupMotion } from "../../lib/popup-motion.ts"
import { Button } from "@vendure-io/ui/components/atoms/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@vendure-io/ui/components/atoms/input-group"
import { ChevronDownIcon, Loader2Icon, XIcon } from "lucide-react"
import { usePopupDir } from "../../lib/popup-direction.ts"
import { usePopupAlign } from "../../lib/popup-align.ts"
import { hasName, nameFrom, useRegisteredRef } from "../../lib/control-name.ts"
import { useMessages } from "../../lib/format-messages.ts"

/**
 * The controls of the nearest Combobox. Base UI names the trigger and the
 * input but not the popup or the list, so ComboboxContent and ComboboxList
 * take their name from here: the field trigger when there is one (the search
 * input then sits in the popup), else the input.
 */
type ComboboxControls = {
  trigger: HTMLElement | null
  input: HTMLElement | null
  setTrigger: (trigger: HTMLElement | null) => void
  setInput: (input: HTMLElement | null) => void
}

const ComboboxControlsContext = React.createContext<ComboboxControls | null>(null)

type ComboboxPagingProps = {
  /**
   * Asks for the next page of a server-searched list. Called once when the
   * list scrolls near its end, or the arrow keys reach its last option, while
   * `hasMore` is set and `isLoading` is not. It is called again once the
   * options change, the search changes, the list reopens, or the list
   * scrolls away from its end and back: a failed fetch is retried by
   * scrolling, never in a loop.
   */
  onLoadMore?: () => void
  /** There is a next page for `onLoadMore` to fetch. */
  hasMore?: boolean
  /**
   * A page is loading: the list shows a loading row at its end, is busy for
   * assistive technology and announces `loadingLabel`. With no options yet,
   * the loading row takes the place of ComboboxEmpty.
   */
  isLoading?: boolean
  /**
   * Announced to screen readers while `isLoading` is set.
   * @default `messages.combobox.loading`, "Loading…"
   */
  loadingLabel?: string
}

/**
 * The paging state of the nearest Combobox, for its list and its empty state.
 * Null when the Combobox takes none of the paging props.
 */
type ComboboxPaging = {
  isLoading: boolean
  loadingLabel: string
  canLoadMore: boolean
  list: HTMLElement | null
  setList: (list: HTMLElement | null) => void
  /** Calls `onLoadMore` once per set of options. */
  requestMore: () => void
  /** Lets the next request through: the options or the search changed. */
  rearm: () => void
}

const ComboboxPagingContext = React.createContext<ComboboxPaging | null>(null)

function Combobox<Value, Multiple extends boolean | undefined = false, Item = Value>({
  onLoadMore,
  hasMore = false,
  isLoading,
  loadingLabel,
  onItemHighlighted,
  onInputValueChange,
  ...props
}: ComboboxPrimitive.Root.Props<Value, Multiple, Item> & ComboboxPagingProps) {
  const [trigger, setTrigger] = React.useState<HTMLElement | null>(null)
  const [input, setInput] = React.useState<HTMLElement | null>(null)
  const [list, setList] = React.useState<HTMLElement | null>(null)
  const controls = React.useMemo(() => ({ trigger, input, setTrigger, setInput }), [trigger, input])

  // Read at call time, so an observer set up on an earlier render sees the
  // current flags.
  const latest = React.useRef({ onLoadMore, hasMore, isLoading })
  React.useLayoutEffect(() => {
    latest.current = { onLoadMore, hasMore, isLoading }
  })
  // Set once a page is asked for. Scrolling fires many events before the
  // consumer's `isLoading` flag turns on; the latch keeps that to one call.
  const latched = React.useRef(false)
  const requestMore = React.useCallback(() => {
    const current = latest.current
    if (!current.onLoadMore || !current.hasMore || current.isLoading || latched.current) return
    latched.current = true
    current.onLoadMore()
  }, [])
  const rearm = React.useCallback(() => {
    latched.current = false
  }, [])

  const canLoadMore = onLoadMore !== undefined
  const enabled = canLoadMore || isLoading !== undefined
  const t = useMessages("combobox", { loading: loadingLabel })
  const paging = React.useMemo(
    () =>
      enabled
        ? {
            isLoading: !!isLoading,
            loadingLabel: t.loading,
            canLoadMore,
            list,
            setList,
            requestMore,
            rearm,
          }
        : null,
    [enabled, isLoading, t.loading, canLoadMore, list, requestMore, rearm]
  )

  return (
    <ComboboxControlsContext.Provider value={controls}>
      <ComboboxPagingContext.Provider value={paging}>
        <ComboboxPrimitive.Root
          {...props}
          onInputValueChange={(value, details) => {
            rearm()
            onInputValueChange?.(value, details)
          }}
          onItemHighlighted={(value, details) => {
            onItemHighlighted?.(value, details)
            // The arrow keys reached the last option: load the next page, as
            // scrolling there would. Counted from the DOM, so groups and rows
            // that are not part of the page line up.
            if (details.reason !== "keyboard" || !list) return
            if (details.index === list.querySelectorAll("[role=option]").length - 1) requestMore()
          }}
        />
      </ComboboxPagingContext.Provider>
    </ComboboxControlsContext.Provider>
  )
}

/** The name of the Combobox, for its popup and its list. */
function useComboboxName() {
  const controls = React.useContext(ComboboxControlsContext)
  if (controls?.trigger) return nameFrom(controls.trigger, { orSelf: true })
  return nameFrom(controls?.input ?? null)
}

function ComboboxValue({ ...props }: ComboboxPrimitive.Value.Props) {
  return <ComboboxPrimitive.Value data-slot="combobox-value" {...props} />
}

// Field styling matches SelectTrigger, so a select-like combobox (the trigger
// shows the value, the search input sits in the popup) looks like the other
// form fields. ComboboxValue renders no element, so there is no value slot to
// style.
function ComboboxTrigger({
  className,
  size = "default",
  children,
  ref,
  ...props
}: ComboboxPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  const triggerRef = useRegisteredRef(ref, React.useContext(ComboboxControlsContext)?.setTrigger)
  return (
    <ComboboxPrimitive.Trigger
      ref={triggerRef}
      data-slot="combobox-trigger"
      data-size={size}
      className={cn(
        fieldSurface,
        "data-placeholder:text-faint-foreground flex w-fit items-center justify-between gap-1.5 px-2.5 py-2 text-sm whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-8.5 data-[size=sm]:h-7 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4" />
    </ComboboxPrimitive.Trigger>
  )
}

// Icon-only, so it carries a name. Like the open button, it stays out of the
// tab order: Backspace clears the input from the keyboard, and while the list
// is open Base UI hides it from assistive technology.
function ComboboxClear({ className, "aria-label": ariaLabel = "Clear", ...props }: ComboboxPrimitive.Clear.Props) {
  return (
    <ComboboxPrimitive.Clear
      data-slot="combobox-clear"
      aria-label={ariaLabel}
      tabIndex={-1}
      render={<InputGroupButton variant="ghost" size="icon-xs" />}
      className={cn(className)}
      {...props}
    >
      <XIcon className="pointer-events-none" />
    </ComboboxPrimitive.Clear>
  )
}

function ComboboxInput({
  className,
  children,
  disabled = false,
  showTrigger = true,
  showClear = false,
  triggerLabel = "Open options",
  clearLabel = "Clear",
  ref,
  ...props
}: ComboboxPrimitive.Input.Props & {
  showTrigger?: boolean
  showClear?: boolean
  /** Accessible name of the icon-only trigger button. */
  triggerLabel?: string
  /** Accessible name of the icon-only clear button. */
  clearLabel?: string
}) {
  const inputRef = useRegisteredRef(ref, React.useContext(ComboboxControlsContext)?.setInput)
  return (
    <InputGroup className={cn("w-auto", className)}>
      <ComboboxPrimitive.Input
        ref={inputRef}
        render={<InputGroupInput disabled={disabled} />}
        {...props}
      />
      <InputGroupAddon align="inline-end">
        {showTrigger && (
          // The bare primitive, not ComboboxTrigger: the icon button inside
          // the input group must not take the field styling. It stays out of
          // the tab order, as in the ARIA combobox pattern: the input opens
          // the list with the arrow keys. While the list is open, Base UI
          // hides everything but the input and the list from assistive
          // technology, and a hidden element must not be tabbable.
          // ComboboxPrimitive.Trigger renders a native <button>, so Base UI is
          // told so: Button turns nativeButton off when `render` is set.
          <InputGroupButton
            nativeButton
            tabIndex={-1}
            size="icon-xs"
            variant="ghost"
            render={<ComboboxPrimitive.Trigger />}
            data-slot="input-group-button"
            aria-label={triggerLabel}
            className="group-has-data-[slot=combobox-clear]/input-group:hidden data-pressed:bg-transparent"
            disabled={disabled}
          >
            <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4" />
          </InputGroupButton>
        )}
        {showClear && <ComboboxClear aria-label={clearLabel} disabled={disabled} />}
      </InputGroupAddon>
      {children}
    </InputGroup>
  )
}

/**
 * The element a list lines up with, other than an explicit `anchor`: the
 * field trigger when there is one (the search input then sits in the popup),
 * else the input's whole field group. Base UI would take the bare input,
 * which stops short of the open and clear buttons, so a list lined up on
 * its right edge would end before the field does.
 */
function fieldAnchor(controls: ComboboxControls | null): Element | null {
  if (controls?.trigger) return controls.trigger
  return controls?.input?.closest("[data-slot=input-group]") ?? controls?.input ?? null
}

function resolveAnchor(anchor: ComboboxPrimitive.Positioner.Props["anchor"]): Element | null {
  const resolved = typeof anchor === "function" ? anchor() : anchor && "current" in anchor ? anchor.current : anchor
  return resolved instanceof Element ? resolved : null
}

/**
 * Without an `align`, the list opens toward the centre of the screen, as a
 * DropdownMenu does: a field in the right half lines the list up with its
 * right edge, one in the left half with its left edge. This shows only when
 * the list is wider than its field. An explicit `align` always wins.
 */
function ComboboxContent({
  className,
  side = "bottom",
  sideOffset = 6,
  align,
  alignOffset = 0,
  anchor,
  ref,
  ...props
}: ComboboxPrimitive.Popup.Props &
  Pick<
    ComboboxPrimitive.Positioner.Props,
    "side" | "align" | "sideOffset" | "alignOffset" | "anchor"
  >) {
  const dir = usePopupDir()
  const name = useComboboxName()
  const controls = React.useContext(ComboboxControlsContext)
  // Without a field trigger, the list lines up with the whole field group.
  const fieldGroup = !anchor && !controls?.trigger ? fieldAnchor(controls) : null
  const getTrigger = React.useCallback(
    () => resolveAnchor(anchor) ?? fieldAnchor(controls),
    [anchor, controls]
  )
  const { popupRef, align: positionAlign } = usePopupAlign(align, side, ref, getTrigger)
  return (
    <ComboboxPrimitive.Portal>
      <ComboboxPrimitive.Positioner
        dir={dir}
        side={side}
        sideOffset={sideOffset}
        align={positionAlign}
        alignOffset={alignOffset}
        anchor={anchor ?? fieldGroup ?? undefined}
        className="isolate z-50"
      >
        <ComboboxPrimitive.Popup
          ref={popupRef}
          data-slot="combobox-content"
          data-chips={!!anchor}
          data-field-group={!!fieldGroup}
          className={cn("bg-popover text-popover-foreground shadow-overlay group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] overflow-hidden rounded-2xl data-[chips=true]:min-w-(--anchor-width) data-[field-group=true]:min-w-(--anchor-width) *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:shadow-none *:data-[slot=input-group]:inset-ring-0", popupMotion, className )}
          // A closing list is gone for assistive technology: the input no
          // longer points at it, and it takes no input while it fades out.
          // With the search input inside it, the popup is a dialog: it takes
          // the Combobox's name unless it has its own.
          render={(popupProps, state) => (
            <div
              {...(popupProps.role === "dialog" && !hasName(popupProps) ? name : {})}
              {...popupProps}
              aria-hidden={state.open ? popupProps["aria-hidden"] : true}
            />
          )}
          {...props}
        />
      </ComboboxPrimitive.Positioner>
    </ComboboxPrimitive.Portal>
  )
}

/** How near the end of the list, in pixels, the next page starts to load. */
const LOAD_MORE_THRESHOLD = 64

/**
 * Asks for the next page when the end of the list is in view or near it:
 * when the list opens, when it scrolls (the arrow keys scroll it too), and
 * when its options change, so a page shorter than the list fills it. A new
 * set of options, a reopened list, or a scroll away from the end lets the
 * next request through.
 */
function useLoadMore(paging: ComboboxPaging | null, end: React.RefObject<HTMLElement | null>) {
  const list = paging?.list ?? null
  const canLoadMore = !!paging?.canLoadMore
  const requestMore = paging?.requestMore
  const rearm = paging?.rearm
  React.useEffect(() => {
    if (!list || !canLoadMore || !requestMore || !rearm) return
    const check = () => {
      const marker = end.current
      if (!marker || !list.isConnected) return
      if (marker.getBoundingClientRect().top - list.getBoundingClientRect().bottom <= LOAD_MORE_THRESHOLD) {
        requestMore()
      } else {
        rearm()
      }
    }
    const options = () => list.querySelectorAll("[role=option]").length
    let count = options()
    // A page may have landed while the list was closed.
    rearm()
    const observer = new MutationObserver(() => {
      const next = options()
      if (next === count) return
      count = next
      rearm()
      check()
    })
    observer.observe(list, { childList: true, subtree: true })
    list.addEventListener("scroll", check, { passive: true })
    // After the popup has its size.
    const frame = requestAnimationFrame(check)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      list.removeEventListener("scroll", check)
    }
  }, [list, canLoadMore, requestMore, rearm, end])
}

function ComboboxList({ className, children, ref, ...props }: ComboboxPrimitive.List.Props) {
  const name = useComboboxName()
  const paging = React.useContext(ComboboxPagingContext)
  const listRef = useRegisteredRef(ref, paging?.setList)
  const endRef = React.useRef<HTMLDivElement | null>(null)
  useLoadMore(paging, endRef)
  // A paged list adds rows after the options, so a render function is
  // wrapped in the Collection the primitive would wrap it in.
  const items =
    paging && typeof children === "function" ? (
      <ComboboxPrimitive.Collection>{children}</ComboboxPrimitive.Collection>
    ) : (
      children
    )
  return (
    <>
      <ComboboxPrimitive.List
        {...(hasName(props) ? {} : name)}
        ref={listRef}
        data-slot="combobox-list"
        aria-busy={paging?.isLoading || undefined}
        className={cn(
          "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
          className
        )}
        {...props}
      >
        {paging ? (
          <>
            {items}
            {/* Decorative: a listbox holds only options and groups, so the
                row is hidden from assistive technology. The list is busy
                and the status below announces the load. */}
            {paging.isLoading && (
              <div
                data-slot="combobox-loading"
                aria-hidden="true"
                className="text-muted-foreground flex min-h-8.5 items-center justify-center"
              >
                <Loader2Icon className="size-4 motion-safe:animate-spin" />
              </div>
            )}
            {paging.canLoadMore && <div ref={endRef} data-slot="combobox-list-end" aria-hidden="true" />}
          </>
        ) : (
          children
        )}
      </ComboboxPrimitive.List>
      {/* Stays mounted, so screen readers announce the change. Outside the
          listbox, which may hold only options and groups. */}
      {paging && (
        <ComboboxPrimitive.Status data-slot="combobox-status" className="sr-only">
          {paging.isLoading ? paging.loadingLabel : null}
        </ComboboxPrimitive.Status>
      )}
    </>
  )
}

// The input keeps focus and the list moves a virtual highlight
// (`data-highlighted`), so `focus-visible` never fires on an option. An
// enabled option shows the highlight as the muted fill. A disabled one takes
// no fill: the arrow keys still stop on it, and it shows the focus ring at
// full strength instead, as a disabled menu item does under the arrow keys.
function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        menuItemDisabled,
        menuCheckItem,
        "not-data-disabled:data-highlighted:bg-muted not-data-disabled:data-highlighted:text-accent-foreground data-disabled:data-highlighted:outline-solid data-disabled:data-highlighted:outline-2 data-disabled:data-highlighted:-outline-offset-2 data-disabled:data-highlighted:outline-ring not-data-[variant=destructive]:not-data-disabled:data-highlighted:**:text-accent-foreground relative flex min-h-8.5 w-full cursor-default items-center gap-2 rounded-lg py-1.5 pe-8 ps-2 text-sm outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75] [&>svg:not([class*='opacity-'])]:opacity-55 [&>svg:not([class*='opacity-'])]:transition-opacity [&>svg:not([class*='opacity-'])]:duration-moderate not-data-disabled:data-highlighted:[&>svg:not([class*='opacity-'])]:opacity-85",
        className
      )}
      {...props}
    >
      {children}
      <span className="pointer-events-none absolute end-2 flex size-4 items-center justify-center">
        <MenuCheck />
      </span>
    </ComboboxPrimitive.Item>
  )
}

function ComboboxGroup({ className, ...props }: ComboboxPrimitive.Group.Props) {
  return (
    <ComboboxPrimitive.Group
      data-slot="combobox-group"
      className={cn(className)}
      {...props}
    />
  )
}

function ComboboxLabel({
  className,
  ...props
}: ComboboxPrimitive.GroupLabel.Props) {
  return (
    <ComboboxPrimitive.GroupLabel
      data-slot="combobox-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function ComboboxCollection({ ...props }: ComboboxPrimitive.Collection.Props) {
  return (
    <ComboboxPrimitive.Collection data-slot="combobox-collection" {...props} />
  )
}

// While a page loads, the list's loading row stands in for the empty state:
// a new search has no options yet, but it is not empty.
function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  const isLoading = !!React.useContext(ComboboxPagingContext)?.isLoading
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "text-muted-foreground hidden w-full justify-center py-2 text-center text-sm group-data-empty/combobox-content:flex",
        isLoading && "group-data-empty/combobox-content:hidden",
        className
      )}
      {...props}
    />
  )
}

function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props) {
  return (
    <ComboboxPrimitive.Separator
      data-slot="combobox-separator"
      className={cn("bg-border -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function ComboboxChips({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof ComboboxPrimitive.Chips> &
  ComboboxPrimitive.Chips.Props) {
  return (
    <ComboboxPrimitive.Chips
      data-slot="combobox-chips"
      className={cn(
        fieldSurfaceWithin,
        "flex min-h-8.5 flex-wrap items-center gap-1.5 px-2.5 py-1.5 text-sm has-data-[slot=combobox-chip]:p-1.25",
        className
      )}
      {...props}
    />
  )
}

// A chip is the v3 look's grey chip: the accent fill, one step above the
// muted field it sits on, with a grey outline, so each value stands out.
// It has the Chip height, 24px, and is denser than a standalone Chip: the
// label is 8px from the edge, so a field fits more of them. In the 34px
// field it sits 5px from the edge, so its corner is the field's 8px minus that
// 5px, 3px. The remove button sits 4px inside the chip, so its corner is the
// chip's 3px minus 4px, which is square.
function ComboboxChip({
  className,
  children,
  showRemove = true,
  removeLabel = "Remove",
  ...props
}: ComboboxPrimitive.Chip.Props & {
  showRemove?: boolean
  /** Accessible name of the icon-only remove button. */
  removeLabel?: string
}) {
  return (
    <ComboboxPrimitive.Chip
      data-slot="combobox-chip"
      className={cn(
        "bg-accent [--status-tone:var(--neutral-text)]", statusChipRing, "text-foreground flex h-6 w-fit items-center justify-center gap-1.5 rounded-[calc(var(--radius-xl)-5px)] ps-2 pe-2 text-xs font-medium whitespace-nowrap has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pe-1",
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          className="size-4 rounded-none [--button-box:--spacing(4)] opacity-50 hover:opacity-100"
          data-slot="combobox-chip-remove"
          aria-label={removeLabel}
        >
          <XIcon className="pointer-events-none" />
        </ComboboxPrimitive.ChipRemove>
      )}
    </ComboboxPrimitive.Chip>
  )
}

function ComboboxChipsInput({
  className,
  ref,
  ...props
}: ComboboxPrimitive.Input.Props) {
  const inputRef = useRegisteredRef(ref, React.useContext(ComboboxControlsContext)?.setInput)
  return (
    <ComboboxPrimitive.Input
      ref={inputRef}
      data-slot="combobox-chip-input"
      className={cn("min-w-16 flex-1 outline-none", className)}
      {...props}
    />
  )
}

function useComboboxAnchor() {
  return React.useRef<HTMLDivElement | null>(null)
}

export {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxGroup,
  ComboboxLabel,
  ComboboxCollection,
  ComboboxEmpty,
  ComboboxSeparator,
  ComboboxChips,
  ComboboxChip,
  ComboboxChipsInput,
  ComboboxTrigger,
  ComboboxValue,
  useComboboxAnchor,
}
