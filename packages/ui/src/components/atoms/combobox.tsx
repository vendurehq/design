"use client"

import * as React from "react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react"

import { cn } from "@vendure-io/ui/lib/utils"
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
import { ChevronDownIcon, XIcon, CheckIcon } from "lucide-react"
import { usePopupDir } from "../../lib/popup-direction.ts"
import { usePopupAlign } from "../../lib/popup-align.ts"
import { hasName, nameFrom, useRegisteredRef } from "../../lib/control-name.ts"

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

function Combobox<Value, Multiple extends boolean | undefined = false, Item = Value>(
  props: ComboboxPrimitive.Root.Props<Value, Multiple, Item>
) {
  const [trigger, setTrigger] = React.useState<HTMLElement | null>(null)
  const [input, setInput] = React.useState<HTMLElement | null>(null)
  const controls = React.useMemo(() => ({ trigger, input, setTrigger, setInput }), [trigger, input])
  return (
    <ComboboxControlsContext.Provider value={controls}>
      <ComboboxPrimitive.Root {...props} />
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
        "data-placeholder:text-faint-foreground flex w-fit items-center justify-between gap-1.5 px-2.5 py-2 text-sm whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-8.5 data-[size=sm]:h-8 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
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
          className={cn("bg-popover text-popover-foreground shadow-overlay group/combobox-content relative max-h-(--available-height) w-(--anchor-width) max-w-(--available-width) min-w-[calc(var(--anchor-width)+--spacing(7))] overflow-hidden rounded-xl data-[chips=true]:min-w-(--anchor-width) data-[field-group=true]:min-w-(--anchor-width) *:data-[slot=input-group]:m-1 *:data-[slot=input-group]:mb-0 *:data-[slot=input-group]:h-8 *:data-[slot=input-group]:shadow-none", popupMotion, className )}
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

function ComboboxList({ className, ...props }: ComboboxPrimitive.List.Props) {
  const name = useComboboxName()
  return (
    <ComboboxPrimitive.List
      {...(hasName(props) ? {} : name)}
      data-slot="combobox-list"
      className={cn(
        "no-scrollbar max-h-[min(calc(--spacing(72)---spacing(9)),calc(var(--available-height)---spacing(9)))] scroll-py-1 overflow-y-auto overscroll-contain p-1 data-empty:p-0",
        className
      )}
      {...props}
    />
  )
}

function ComboboxItem({
  className,
  children,
  ...props
}: ComboboxPrimitive.Item.Props) {
  return (
    <ComboboxPrimitive.Item
      data-slot="combobox-item"
      className={cn(
        "data-highlighted:bg-muted data-highlighted:text-accent-foreground not-data-[variant=destructive]:data-highlighted:**:text-accent-foreground relative flex min-h-8.5 w-full cursor-default items-center gap-2 rounded-lg py-1.5 pe-8 ps-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75] [&>svg:not([class*='opacity-'])]:opacity-55 [&>svg:not([class*='opacity-'])]:transition-opacity [&>svg:not([class*='opacity-'])]:duration-moderate data-highlighted:[&>svg:not([class*='opacity-'])]:opacity-85",
        className
      )}
      {...props}
    >
      {children}
      <ComboboxPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute end-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </ComboboxPrimitive.ItemIndicator>
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

function ComboboxEmpty({ className, ...props }: ComboboxPrimitive.Empty.Props) {
  return (
    <ComboboxPrimitive.Empty
      data-slot="combobox-empty"
      className={cn(
        "text-muted-foreground hidden w-full justify-center py-2 text-center text-sm group-data-empty/combobox-content:flex",
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
        "flex min-h-8.5 flex-wrap items-center gap-1.5 px-2.5 py-1.5 text-sm has-data-[slot=combobox-chip]:px-1.5",
        className
      )}
      {...props}
    />
  )
}

// A chip is the v3 look's grey chip: the accent fill, one step above the
// muted field it sits on, with a grey outline, so each value stands out.
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
        "bg-accent [--status-tone:var(--neutral-text)]", statusChipRing, "text-foreground flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-sm px-1.5 text-xs font-medium whitespace-nowrap has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50 has-data-[slot=combobox-chip-remove]:pr-0",
        className
      )}
      {...props}
    >
      {children}
      {showRemove && (
        <ComboboxPrimitive.ChipRemove
          render={<Button variant="ghost" size="icon-xs" />}
          className="-ml-1 opacity-50 hover:opacity-100"
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
