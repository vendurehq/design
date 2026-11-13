"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@vendure-io/ui/lib/utils"
import { MenuCheck, menuCheckItem, menuItemDisabled } from "../../lib/menu-item.tsx"
import { fieldSurface } from "@vendure-io/ui/lib/field-surface"
import { popupMotion } from "../../lib/popup-motion.ts"
import { useFieldControlProps } from "@vendure-io/ui/components/atoms/field"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"
import { usePopupDir } from "../../lib/popup-direction.ts"
import { usePopupAlign } from "../../lib/popup-align.ts"
import { nameFrom, useRegisteredRef } from "../../lib/control-name.ts"

/**
 * The trigger of the nearest Select. Base UI names the trigger but not the
 * list, so SelectContent reads the trigger's name from here and gives it to
 * the list.
 */
const SelectTriggerContext = React.createContext<{
  trigger: HTMLElement | null
  setTrigger: (trigger: HTMLElement | null) => void
} | null>(null)

function Select<Value, Multiple extends boolean | undefined = false>(
  props: SelectPrimitive.Root.Props<Value, Multiple>
) {
  const [trigger, setTrigger] = React.useState<HTMLElement | null>(null)
  const context = React.useMemo(() => ({ trigger, setTrigger }), [trigger])
  return (
    <SelectTriggerContext.Provider value={context}>
      <SelectPrimitive.Root {...props} />
    </SelectTriggerContext.Provider>
  )
}

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
      className={cn("flex flex-1 text-start", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ref,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: "sm" | "default"
}) {
  const triggerRef = useRegisteredRef(ref, React.useContext(SelectTriggerContext)?.setTrigger)
  return (
    <SelectPrimitive.Trigger
      ref={triggerRef}
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
 * Turns a `box-shadow` value into `drop-shadow()` filters. A 1px ring (no
 * offset, no blur, a spread) becomes four 1px drop shadows, one per side.
 * A drop shadow's blur is a standard deviation, half a box-shadow blur, and it
 * has no spread: a soft shadow with a negative spread takes 0.4 of its blur
 * and 60% of its colour instead, which matches `shadow-overlay` in light and
 * dark within a few levels of grey.
 */
function shadowToFilter(shadow: string) {
  const outside = /[,\s]+(?![^(]*\))/
  return shadow
    .split(/,(?![^(]*\))/)
    .flatMap((layer) => {
      const parts = layer.trim().split(outside).filter((part) => part && part !== "inset")
      const isLength = (part: string) => /^-?[\d.]+(px)?$/.test(part)
      const [x = 0, y = 0, blur = 0, spread = 0] = parts.filter(isLength).map(parseFloat)
      const color = parts.filter((part) => !isLength(part)).join(" ")
      if (!color) return []
      if (!x && !y && !blur && spread > 0) {
        return [`${spread}px 0`, `-${spread}px 0`, `0 ${spread}px`, `0 -${spread}px`].map(
          (offset) => `drop-shadow(${offset} 0 ${color})`
        )
      }
      if (spread < 0) {
        const lighter = `color-mix(in oklab, ${color} 60%, transparent)`
        return [`drop-shadow(${x}px ${y}px ${blur * 0.4}px ${lighter})`]
      }
      return [`drop-shadow(${x}px ${y}px ${blur / 2}px ${color})`]
    })
    .join(" ")
}

/**
 * A list that Base UI places over its trigger (`data-side="none"`) covers the
 * trigger and grows out of it.
 *
 * Base UI moves the list so the selected item's text sits on the trigger's
 * text. The item text is further in than the trigger text, so the list starts
 * left of the trigger by the difference; at the trigger's width it then ends
 * inside the trigger, and the trigger's edge and chevron show beside it. The
 * list is made wider by that difference on both sides, so it overhangs the
 * trigger evenly.
 *
 * `--select-trigger-box` is the trigger's box as a `clip-path` inset of the
 * list. The list starts and ends clipped to it, so it opens out of the
 * trigger and closes back into it. A `clip-path` also clips the list's own
 * shadow, so the positioner draws the edge and the shadow as `drop-shadow`
 * filters, which follow the clip.
 *
 * Base UI positions the list on each open, so this runs on every style
 * change of the popup.
 */
/**
 * Base UI puts the selected item on the trigger and cuts the list at the edge
 * of the screen, so a short list near an edge shows a few items and scrolls
 * ("10" selected at the bottom of the screen hides 20 to 100 below the edge).
 * When the whole list fits on the screen, this moves it up or down just far
 * enough to show every item, inside Base UI's 10px screen margin, and drops
 * the scroll. It still covers the trigger: Base UI places a list over its
 * trigger only when the trigger is at least 20px from the edges, and the list
 * moves by no more than it ran past the edge. A list taller than the screen
 * keeps Base UI's placement and scrolls.
 */
function fitOnScreen(positioner: HTMLElement, list: HTMLElement) {
  const hidden = list.scrollHeight - list.clientHeight
  if (hidden <= 1) return
  const style = getComputedStyle(positioner)
  const marginTop = parseFloat(style.marginTop) || 0
  const marginBottom = parseFloat(style.marginBottom) || 0
  const rect = positioner.getBoundingClientRect()
  const height = rect.height + hidden
  const screen = document.documentElement.clientHeight
  if (height > screen - marginTop - marginBottom) return
  // Where the list's first item would be if the list did not scroll: the
  // selected item stays on the trigger as far as the screen allows.
  const top = Math.min(
    Math.max(rect.top - list.scrollTop, marginTop),
    screen - marginBottom - height
  )
  // `top` positions the margin box: move by the difference from now.
  const currentTop = parseFloat(style.top) || 0
  positioner.style.top = `${currentTop + top - rect.top}px`
  positioner.style.bottom = ""
  positioner.style.height = `${height}px`
  list.scrollTop = 0
  // Base UI shows its scroll arrows from scroll events: a list that no
  // longer scrolls hides them.
  list.dispatchEvent(new Event("scroll"))
}

function growFromTrigger(popup: HTMLElement | null) {
  if (!popup) return () => {}
  const positioner = popup.parentElement
  let placed = ""
  const place = () => {
    if (popup.dataset.side !== "none") {
      placed = ""
      popup.style.removeProperty("min-width")
      popup.style.removeProperty("--select-trigger-box")
      positioner?.style.removeProperty("filter")
      return
    }
    // A closing list keeps the box it opened from: a new box would turn the
    // closing transition towards it.
    if (popup.hasAttribute("data-ending-style") || popup.hasAttribute("data-closed")) return
    const list = popup.querySelector<HTMLElement>("[role=listbox]")
    const trigger = list?.id
      ? document.querySelector<HTMLElement>(`[aria-controls="${CSS.escape(list.id)}"]`)
      : null
    const value = trigger?.querySelector<HTMLElement>("[data-slot=select-value]")
    const item =
      popup.querySelector<HTMLElement>("[data-slot=select-item][data-selected]") ??
      popup.querySelector<HTMLElement>("[data-slot=select-item]")
    const text = item?.firstElementChild
    if (!trigger || !value || !text || !popup.offsetWidth) return
    if (positioner && list) fitOnScreen(positioner, list)
    const rtl = getComputedStyle(popup).direction === "rtl"
    const box = trigger.getBoundingClientRect()
    const valueBox = value.getBoundingClientRect()
    const textBox = text.getBoundingClientRect()
    let popupBox = popup.getBoundingClientRect()
    const overhang = Math.max(
      0,
      rtl
        ? popupBox.right - textBox.right - (box.right - valueBox.right)
        : textBox.left - popupBox.left - (valueBox.left - box.left)
    )
    const minWidth = `calc(var(--anchor-width) + ${2 * overhang}px)`
    if (popup.style.minWidth !== minWidth) popup.style.minWidth = minWidth
    popupBox = popup.getBoundingClientRect()
    const radius = getComputedStyle(trigger).borderTopLeftRadius
    const inset = [
      box.top - popupBox.top,
      popupBox.right - box.right,
      popupBox.bottom - box.bottom,
      box.left - popupBox.left,
    ]
      .map((side) => `${Math.round(side * 100) / 100}px`)
      .join(" ")
    const clip = `inset(${inset} round ${radius})`
    // Writing a style is a style change, which runs this again: skip a write
    // that would only repeat the last one.
    if (clip === placed) return
    placed = clip
    popup.style.setProperty("--select-trigger-box", clip)
    if (positioner) {
      positioner.style.filter = shadowToFilter(
        getComputedStyle(popup).getPropertyValue("--shadow-overlay")
      )
    }
  }
  const observer = new MutationObserver(place)
  observer.observe(popup, { attributes: true, attributeFilter: ["style", "data-side", "data-closed"] })
  place()
  return () => observer.disconnect()
}

/**
 * The motion of a list over its trigger. It has no side, so it drops the
 * popup's 2px slide and its scale, and keeps its opacity at 1: from the first
 * frame it covers the trigger. Its `clip-path` grows from the trigger's box
 * (`--select-trigger-box`) to its own, with the popup's timings: `normal` on
 * the strong ease-out to open, `quick` on `ease-soft` to close. A transition
 * starts from where the last one stopped, so a list closed while it opens
 * turns back from there. Reduced motion keeps only the popup's fade.
 */
const growFromTriggerMotion =
  "data-[side=none]:shadow-none data-[side=none]:transition-[opacity,clip-path] data-[side=none]:[transition-duration:var(--transition-duration-popup-fade),var(--transition-duration-normal)] data-[side=none]:data-ending-style:duration-quick motion-safe:data-[side=none]:[clip-path:inset(0_round_var(--radius-xl))] motion-safe:data-[side=none]:data-starting-style:[clip-path:var(--select-trigger-box)] motion-safe:data-[side=none]:data-ending-style:[clip-path:var(--select-trigger-box)] motion-safe:data-[side=none]:data-starting-style:opacity-100 motion-safe:data-[side=none]:data-ending-style:opacity-100 motion-safe:data-[side=none]:data-starting-style:scale-100 motion-safe:data-[side=none]:data-ending-style:scale-100 motion-safe:data-[side=none]:data-starting-style:translate-y-0 motion-safe:data-[side=none]:data-ending-style:translate-y-0"

// min-w-(--anchor-width) rather than w-(--anchor-width) so the popup can expand beyond the trigger to fit content
/**
 * By default the list opens over its trigger and grows out of it. A list
 * that opens below or above its trigger (`alignItemWithTrigger={false}`, or
 * when Base UI falls back for touch or a lack of room) opens toward the
 * centre of the screen, as a DropdownMenu does: a trigger in the right half
 * lines the list up with its right edge, one in the left half with its left
 * edge. An explicit `align` always wins.
 */
function SelectContent({
  className,
  children,
  side = "bottom",
  sideOffset = 4,
  align,
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

  const trigger = React.useContext(SelectTriggerContext)?.trigger ?? null
  const getTrigger = React.useCallback(() => trigger, [trigger])
  const { popupRef: alignRef, align: positionAlign } = usePopupAlign(align, side, undefined, getTrigger)

  const popupRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      alignRef(node)
      const stop = growFromTrigger(node)
      if (typeof ref === "function") ref(node)
      else if (ref) ref.current = node
      return () => {
        stop()
        if (typeof ref === "function") ref(null)
        else if (ref) ref.current = null
      }
    },
    [ref, alignRef]
  )

  const dir = usePopupDir()
  return (
    <SelectPrimitive.Portal key={childrenKey}>
      <SelectPrimitive.Positioner
        dir={dir}
        side={side}
        sideOffset={sideOffset}
        align={positionAlign}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        // Base UI gives up on placing the list over its trigger when less
        // than its min-height (100px by default) fits between the trigger
        // and the edge, and opens it beside the trigger instead. 1px keeps
        // the list over the trigger; `fitOnScreen` then moves it into view.
        className="isolate z-50 min-h-px"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn("bg-popover text-popover-foreground shadow-overlay relative isolate z-50 max-h-(--available-height) min-w-(--anchor-width) overflow-x-hidden overflow-y-auto rounded-xl", popupMotion, growFromTriggerMotion, className)}
          ref={popupRef}
          // A closing list is gone for assistive technology: its trigger no
          // longer points at it, and it takes no input while it fades out.
          render={(popupProps, state) => (
            <div {...popupProps} aria-hidden={state.open ? popupProps["aria-hidden"] : true} />
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List className="p-1.25" {...nameFrom(trigger, { orSelf: true })}>
            {children}
          </SelectPrimitive.List>
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
        menuItemDisabled,
        menuCheckItem,
        "not-data-disabled:focus:bg-muted not-data-disabled:focus:text-accent-foreground not-data-[variant=destructive]:not-data-disabled:focus:**:text-accent-foreground relative flex min-h-8.5 w-full cursor-default items-center gap-2 rounded-lg py-1.5 pe-8 ps-2 text-sm text-foreground-secondary data-selected:text-foreground outline-hidden select-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75] [&>:first-child>svg:not([class*='opacity-'])]:opacity-55 [&>:first-child>svg:not([class*='opacity-'])]:transition-opacity [&>:first-child>svg:not([class*='opacity-'])]:duration-moderate not-data-disabled:focus:[&>:first-child>svg:not([class*='opacity-'])]:opacity-85 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <span className="pointer-events-none absolute end-2 flex size-4 items-center justify-center">
        <MenuCheck />
      </span>
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
