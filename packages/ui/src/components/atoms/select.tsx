"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@vendure-io/ui/lib/utils"
import { fieldSurface } from "@vendure-io/ui/lib/field-surface"
import { popupMotion } from "../../lib/popup-motion.ts"
import { useFieldControlProps } from "@vendure-io/ui/components/atoms/field"
import { ChevronDownIcon, CheckIcon, ChevronUpIcon } from "lucide-react"
import { usePopupDir } from "../../lib/popup-direction.ts"

const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1.25", className)}
      {...props}
    />
  )
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("flex flex-1 text-left", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        fieldSurface,
        "data-placeholder:text-faint-foreground flex w-fit items-center justify-between gap-1.5 px-2.5 py-2 text-sm whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-8.5 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...useFieldControlProps(props)}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

/**
 * Base UI puts the origin of a list placed over its trigger at 50% of the list
 * width and at the height of the selected label. The list is as wide as its
 * widest item, so scaling from 50% moves the label sideways, away from the
 * trigger label under it. Move the origin to the middle of the label: the
 * label then keeps its place while the list opens and closes.
 *
 * The label rect is read through the popup's own scale, so it is the same at
 * any point of the transition. Base UI rewrites its origin variable each time
 * it positions the list, so this runs again on every style change of the popup.
 */
function originOnSelectedLabel(popup: HTMLElement | null) {
  if (!popup) return () => {}
  let placed = { x: NaN, y: NaN }
  const place = () => {
    if (popup.dataset.side !== "none") {
      placed = { x: NaN, y: NaN }
      popup.style.removeProperty("transform-origin")
      return
    }
    const item =
      popup.querySelector<HTMLElement>("[data-slot=select-item][data-selected]") ??
      popup.querySelector<HTMLElement>("[data-slot=select-item]")
    const label = item?.firstElementChild
    if (!label || !popup.offsetWidth) return
    const range = document.createRange()
    range.selectNodeContents(label)
    const text = range.getBoundingClientRect()
    const box = popup.getBoundingClientRect()
    const scale = box.width / popup.offsetWidth
    if (!text.width || !scale) return
    const x = (text.left + text.width / 2 - box.left) / scale
    const y = (text.top + text.height / 2 - box.top) / scale
    // Writing the origin is a style change, which runs this again: skip a
    // write that would only repeat the last one by a rounding difference.
    if (Math.abs(x - placed.x) < 0.1 && Math.abs(y - placed.y) < 0.1) return
    placed = { x, y }
    popup.style.transformOrigin = `${x}px ${y}px`
  }
  const observer = new MutationObserver(place)
  observer.observe(popup, { attributes: true, attributeFilter: ["style", "data-side"] })
  place()
  return () => observer.disconnect()
}

// min-w-(--anchor-width) rather than w-(--anchor-width) so the popup can expand beyond the trigger to fit content
function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align = "center",
  alignOffset = 0,
  alignItemWithTrigger = true,
  ref,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset" | "alignItemWithTrigger"
  >) {
  // Force the popup to remount when the set of items changes. Base UI's Select
  // keeps an internal item registry that doesn't refresh when items change
  // while the controlled value stays the same (e.g. a value="" fire-and-forget
  // pattern used for state transitions), leaving stale items selectable.
  // Re-keying on the children's values remounts the popup so items re-register.
  // Only inspects top-level children — items nested in a SelectGroup or
  // fragment won't contribute to the key.
  const childrenKey = React.useMemo(
    () =>
      React.Children.toArray(children)
        .map((child) =>
          React.isValidElement(child)
            ? String((child.props as { value?: unknown }).value ?? child.key)
            : ""
        )
        .join("|"),
    [children]
  )

  const popupRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      const stop = originOnSelectedLabel(node)
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
      return () => {
        stop()
        if (typeof ref === "function") ref(null)
        else if (ref) ref.current = null
      }
    },
    [ref]
  )

  const dir = usePopupDir()
  return (
    <SelectPrimitive.Portal key={childrenKey}>
      <SelectPrimitive.Positioner
        dir={dir}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn("bg-popover text-popover-foreground shadow-overlay relative isolate z-50 max-h-(--available-height) min-w-(--anchor-width) overflow-x-hidden overflow-y-auto rounded-2xl", popupMotion, "motion-safe:data-[side=none]:data-starting-style:translate-y-0 motion-safe:data-[side=none]:data-ending-style:translate-y-0", className )}
          ref={popupRef}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List className="p-1.25">{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-muted focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground relative flex min-h-8.5 w-full cursor-default items-center gap-2 rounded-lg py-1.5 pr-8 pl-2 text-sm text-foreground-secondary data-selected:text-foreground outline-hidden select-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75] [&>:first-child>svg:not([class*='opacity-'])]:opacity-55 [&>:first-child>svg:not([class*='opacity-'])]:transition-opacity [&>:first-child>svg:not([class*='opacity-'])]:duration-moderate focus:[&>:first-child>svg:not([class*='opacity-'])]:opacity-85 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1.25 my-1.25 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "bg-popover top-0 z-10 flex w-full cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronUpIcon
      />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bg-popover bottom-0 z-10 flex w-full cursor-default items-center justify-center py-1 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <ChevronDownIcon
      />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
