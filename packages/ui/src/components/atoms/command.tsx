"use client"

import * as React from "react"
import { Command as CommandPrimitive, useCommandState } from "cmdk"

import { cn } from "@vendure-io/ui/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@vendure-io/ui/components/atoms/dialog"
import {
  InputGroup,
  InputGroupAddon,
} from "@vendure-io/ui/components/atoms/input-group"
import { SearchIcon, CheckIcon } from "lucide-react"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex size-full flex-col overflow-hidden rounded-xl! in-data-[slot=dialog-content]:rounded-3xl!",
        className
      )}
      {...props}
    />
  )
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  className,
  showCloseButton = false,
  ...props
}: Omit<React.ComponentProps<typeof Dialog>, "children"> & {
  title?: string
  description?: string
  className?: string
  showCloseButton?: boolean
  children: React.ReactNode
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      {/* The palette: 600px wide, 12% of the viewport from the top so the
          list can grow down without moving the input. It opens often, so its
          motion is shorter than a dialog's: it drops 6px from 98% at the top
          centre (opacity 160ms, transform 180ms) and closes in 110ms. Reduced
          motion fades only. */}
      <DialogContent
        className={cn(
          "shadow-overlay top-[12vh] translate-y-0 gap-0 overflow-hidden rounded-3xl! p-0 ring-0 sm:max-w-150 origin-top transition-[opacity,scale,translate] duration-[160ms,180ms,180ms] motion-safe:data-starting-style:-translate-y-1.5 motion-safe:data-starting-style:scale-98 data-ending-style:duration-110 data-ending-style:ease-[ease] motion-safe:data-ending-style:scale-98 motion-reduce:transition-opacity motion-reduce:duration-120 motion-reduce:ease-[ease]",
          className
        )}
        showCloseButton={showCloseButton}
        // The palette is transient and keeps the page in view: a lighter scrim
        // with a 2px blur that fades with the palette.
        overlayClassName="bg-scrim-subtle duration-160 data-ending-style:duration-110 supports-backdrop-filter:backdrop-blur-[2px]"
      >
        {children}
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    // Unboxed: the input runs edge to edge above a hairline, with no field
    // border, fill or ring. 54px with 16px text in the palette dialog.
    <div data-slot="command-input-wrapper" className="border-border border-b">
      <InputGroup className="h-10! rounded-none! border-0! bg-transparent! pr-3.5 shadow-none! ring-0! outline-none! in-data-[slot=dialog-content]:h-13.5! *:data-[slot=input-group-addon]:pl-3! in-data-[slot=dialog-content]:*:data-[slot=input-group-addon]:pl-4.5!">
        <CommandPrimitive.Input
          data-slot="command-input"
          className={cn(
            "placeholder:text-muted-foreground w-full pl-2.5! text-sm outline-hidden in-data-[slot=dialog-content]:text-base disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
        <InputGroupAddon>
          <SearchIcon className="size-4 shrink-0 opacity-50" />
        </InputGroupAddon>
      </InputGroup>
    </div>
  )
}

// In the palette, results that appear after the first render (a new query)
// fade in from a 3px blur, 50ms after the old results start to leave. Rows that
// stay are not touched: cmdk re-inserts them when it sorts, so the ghost marks
// every shown result data-result-seen before the query changes. The colour
// transition is the palette item's own (see CommandItem). Reduced motion drops
// the blur.
const ENTERING_RESULTS =
  "[&[data-results-ready]_:is([cmdk-item],[cmdk-group-heading],[cmdk-empty]):not([data-result-seen],[data-slot=command-results-ghost]_*)]:transition-[color,opacity,filter] [&[data-results-ready]_:is([cmdk-item],[cmdk-group-heading],[cmdk-empty]):not([data-result-seen],[data-slot=command-results-ghost]_*)]:duration-[120ms,200ms,240ms] [&[data-results-ready]_:is([cmdk-item],[cmdk-group-heading],[cmdk-empty]):not([data-result-seen],[data-slot=command-results-ghost]_*)]:delay-[0ms,50ms,50ms] [&[data-results-ready]_:is([cmdk-item],[cmdk-group-heading],[cmdk-empty]):not([data-result-seen],[data-slot=command-results-ghost]_*)]:ease-[ease,ease,var(--ease-out)] [&[data-results-ready]_:is([cmdk-item],[cmdk-group-heading],[cmdk-empty]):not([data-result-seen],[data-slot=command-results-ghost]_*)]:starting:opacity-0 motion-safe:[&[data-results-ready]_:is([cmdk-item],[cmdk-group-heading],[cmdk-empty]):not([data-result-seen],[data-slot=command-results-ghost]_*)]:starting:blur-[3px]"

// cmdk measures the list's content and writes it to --cmdk-list-height, so the
// list eases to its new height as results change. The first measure is not
// animated (the height starts as auto). Reduced motion drops the animation.
function CommandList({
  className,
  slidingHighlight = false,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List> & {
  /**
   * Draws the selected item's highlight as one fill that follows the
   * selection from item to item, and eases the list's scroll with it. Off by
   * default: each item then fills itself.
   */
  slidingHighlight?: boolean
}) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      data-highlight={slidingHighlight ? "slide" : undefined}
      className={cn(
        "no-scrollbar h-(--cmdk-list-height) max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto overscroll-contain outline-none transition-[height] duration-(--transition-duration-normal) ease-drawer in-data-[slot=dialog-content]:max-h-95 motion-reduce:transition-none *:[[cmdk-list-sizer]]:relative *:[[cmdk-list-sizer]]:p-1",
        ENTERING_RESULTS,
        className
      )}
      {...props}
    >
      {slidingHighlight && <CommandHighlight />}
      <CommandResultsGhost />
      {children}
    </CommandPrimitive.List>
  )
}

// The palette's results crossfade. Just before the query changes (beforeinput),
// a copy of the current results goes into this layer, at the place they were
// shown, and fades out with a 3px blur (opacity 140ms, blur 160ms) while the
// new results fade in under it. Only in the palette (a CommandList in a
// dialog). Reduced motion skips the copy: new results only fade in.
function CommandResultsGhost() {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    const ghost = ref.current
    const sizer = ghost?.parentElement
    const list = sizer?.closest<HTMLElement>("[cmdk-list]")
    const root = sizer?.closest("[cmdk-root]")
    if (
      !ghost ||
      !sizer ||
      !list ||
      !root ||
      !list.closest("[data-slot=dialog-content]")
    ) {
      return
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")
    let timer = 0

    // Results rendered from now on are new: they fade in.
    const frame = requestAnimationFrame(() => {
      list.dataset.resultsReady = ""
    })

    const onBeforeInput = (event: Event) => {
      if (!(event.target instanceof HTMLInputElement)) {
        return
      }
      // Results shown now stay still if the new query keeps them.
      for (const result of sizer.querySelectorAll<HTMLElement>(
        "[cmdk-item],[cmdk-group-heading],[cmdk-empty]"
      )) {
        if (ghost.contains(result)) {
          continue
        }
        if (result.offsetParent) {
          result.dataset.resultSeen = ""
        } else {
          delete result.dataset.resultSeen
        }
      }
      if (reduced.matches) {
        return
      }
      const copies: Node[] = []
      for (const child of sizer.children) {
        if (
          child === ghost ||
          child.getAttribute("data-slot") === "command-highlight"
        ) {
          continue
        }
        const copy = child.cloneNode(true) as HTMLElement
        // The copy must not answer cmdk's or the highlight's item queries.
        for (const node of [copy, ...copy.querySelectorAll("*")]) {
          node.removeAttribute("id")
          node.removeAttribute("cmdk-item")
          node.removeAttribute("cmdk-empty")
          node.removeAttribute("data-result-seen")
        }
        copies.push(copy)
      }
      ghost.replaceChildren(...copies)
      // A new query scrolls the list to the top: keep the copy where it was.
      ghost.style.top = `${-list.scrollTop}px`
      delete ghost.dataset.leaving
      void ghost.offsetHeight
      ghost.dataset.leaving = ""
      window.clearTimeout(timer)
      timer = window.setTimeout(() => ghost.replaceChildren(), 220)
    }
    root.addEventListener("beforeinput", onBeforeInput, true)

    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
      root.removeEventListener("beforeinput", onBeforeInput, true)
      delete list.dataset.resultsReady
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      role="none"
      inert
      data-slot="command-results-ghost"
      className="pointer-events-none absolute inset-x-0 top-0 z-10 p-1 empty:hidden data-leaving:*:opacity-0 data-leaving:*:blur-[3px] data-leaving:*:transition-[opacity,filter] data-leaving:*:duration-[140ms,160ms] data-leaving:*:ease-[ease]"
    />
  )
}

// The follower's time constant. Each frame closes 1 - e^(-dt/42ms) of the
// distance: about 95% in 130ms, with no overshoot.
const FOLLOW_MS = 42
const NAVIGATION_KEYS = new Set([
  "ArrowDown",
  "ArrowUp",
  "Home",
  "End",
  "PageDown",
  "PageUp",
])

// The sliding highlight of a CommandList. It sits in cmdk's list sizer, so it
// scrolls with the items, and follows the item cmdk marks
// data-selected="true": a MutationObserver catches the selection moving and
// the results changing, a ResizeObserver catches layout changes.
//
// One follower moves the highlight and the list's scroll together, so they
// never disagree. It approaches its target exponentially every frame, so a
// new target while it moves (a held arrow key) continues from where it is
// instead of restarting. cmdk scrolls the selected item into view at once;
// after a key press the follower takes that scroll back and eases to it.
// Wheel and pointer scrolling stay native. Reduced motion jumps.
function CommandHighlight() {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    const highlight = ref.current
    const sizer = highlight?.parentElement
    const list = sizer?.closest<HTMLElement>("[cmdk-list]")
    if (!highlight || !sizer || !list) {
      return
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)")

    // y and h are shown, ty and th are the target. scroll is the list's
    // shown scroll position, scrollTo its target while the follower scrolls.
    const f = {
      y: 0,
      h: 0,
      ty: 0,
      th: 0,
      scroll: list.scrollTop,
      scrollTo: null as number | null,
      placed: false,
      byKey: false,
      raf: 0,
      last: 0,
    }

    const draw = () => {
      highlight.style.transform = `translateY(${f.y}px)`
      highlight.style.height = `${f.h}px`
    }

    const tick = (time: number) => {
      const dt = f.last ? Math.min(time - f.last, 48) : 16
      f.last = time
      const k = reduced.matches ? 1 : 1 - Math.exp(-dt / FOLLOW_MS)
      f.y = Math.abs(f.ty - f.y) < 0.25 ? f.ty : f.y + (f.ty - f.y) * k
      f.h = Math.abs(f.th - f.h) < 0.25 ? f.th : f.h + (f.th - f.h) * k
      draw()
      let moving = f.y !== f.ty || f.h !== f.th
      if (f.scrollTo !== null) {
        const next = f.scroll + (f.scrollTo - f.scroll) * k
        f.scroll = Math.abs(f.scrollTo - next) < 0.5 ? f.scrollTo : next
        list.scrollTop = f.scroll
        if (f.scroll === f.scrollTo) {
          f.scrollTo = null
        } else {
          moving = true
        }
      }
      if (moving) {
        f.raf = requestAnimationFrame(tick)
      } else {
        f.raf = 0
        f.last = 0
      }
    }

    const place = () => {
      const selected = sizer.querySelector<HTMLElement>(
        '[cmdk-item][data-selected="true"]'
      )
      if (!selected) {
        delete highlight.dataset.shown
        f.byKey = false
        return
      }
      // Layout offsets, not client rects: they ignore the dialog's scale-in.
      let top = 0
      let left = 0
      for (
        let node: HTMLElement | null = selected;
        node && node !== sizer;
        node = node.offsetParent as HTMLElement | null
      ) {
        top += node.offsetTop
        left += node.offsetLeft
      }
      highlight.style.left = `${left}px`
      highlight.style.width = `${selected.offsetWidth}px`
      f.ty = top
      f.th = selected.offsetHeight
      if (!f.placed) {
        f.placed = true
        f.y = f.ty
        f.h = f.th
        draw()
      }
      highlight.dataset.shown = ""
      // cmdk has already scrolled the item into view. Show the old position
      // and let the follower ease to cmdk's.
      if (f.byKey && list.scrollTop !== f.scroll && !reduced.matches) {
        f.scrollTo = list.scrollTop
        list.scrollTop = f.scroll
      }
      f.byKey = false
      if (!f.raf) {
        f.raf = requestAnimationFrame(tick)
      }
    }

    place()
    const frame = requestAnimationFrame(() => {
      highlight.dataset.ready = ""
    })
    const mutations = new MutationObserver(place)
    mutations.observe(sizer, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["data-selected", "hidden"],
    })
    const resize = new ResizeObserver(place)
    resize.observe(sizer)

    const root = sizer.closest("[cmdk-root]")
    // Only moves between items scroll through the follower. A new query
    // starts at the top of the list at once.
    const onKeyDown = (event: Event) => {
      const { key, ctrlKey } = event as KeyboardEvent
      f.byKey =
        NAVIGATION_KEYS.has(key) || (ctrlKey && "npjk".includes(key))
    }
    // Scrolling by hand takes over from the follower.
    const onScroll = () => {
      if (f.scrollTo === null) {
        f.scroll = list.scrollTop
      }
    }
    const onManualScroll = () => {
      f.scrollTo = null
      f.scroll = list.scrollTop
    }
    root?.addEventListener("keydown", onKeyDown)
    list.addEventListener("scroll", onScroll, { passive: true })
    list.addEventListener("wheel", onManualScroll, { passive: true })
    list.addEventListener("pointerdown", onManualScroll)

    return () => {
      cancelAnimationFrame(frame)
      cancelAnimationFrame(f.raf)
      mutations.disconnect()
      resize.disconnect()
      root?.removeEventListener("keydown", onKeyDown)
      list.removeEventListener("scroll", onScroll)
      list.removeEventListener("wheel", onManualScroll)
      list.removeEventListener("pointerdown", onManualScroll)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      role="none"
      data-slot="command-highlight"
      className="bg-muted pointer-events-none absolute top-0 left-0 rounded-sm opacity-0 will-change-transform in-data-[slot=dialog-content]:rounded-xl data-shown:opacity-100 data-ready:transition-opacity data-ready:duration-(--transition-duration-fast) data-ready:ease-[ease]"
    />
  )
}

function CommandEmpty({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className={cn("py-6 text-center text-sm", className)}
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground **:[[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 **:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5 **:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium",
        className
      )}
      {...props}
    />
  )
}

// cmdk's Separator forces role="separator", which a listbox does not allow as
// a child (axe aria-required-children). This div keeps cmdk's behaviour of
// hiding while a search is active, unless alwaysRender is set.
function CommandSeparator({
  className,
  alwaysRender = false,
  ...props
}: React.ComponentProps<"div"> & { alwaysRender?: boolean }) {
  const searching = useCommandState((state) => state.search !== "")
  if (searching && !alwaysRender) {
    return null
  }
  return (
    <div
      data-slot="command-separator"
      role="none"
      className={cn("bg-border -mx-1 h-px w-auto", className)}
      {...props}
    />
  )
}

// cmdk writes data-selected="true" or "false" on every item, so the highlight
// matches the value; a bare data-selected: variant would match every item.
// In a CommandList with slidingHighlight, the list's highlight replaces the
// item's own fill. Palette items (in the dialog) are 40px tall and quiet at
// rest: a medium label in foreground-secondary. The highlighted row turns the
// label to foreground and its leading icon to the brand indicator.
function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-muted data-[selected=true]:text-accent-foreground data-[selected=true]:**:[svg]:text-accent-foreground in-data-[highlight=slide]:data-[selected=true]:bg-transparent! group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none in-data-[slot=dialog-content]:h-10 in-data-[slot=dialog-content]:gap-3 in-data-[slot=dialog-content]:rounded-xl! in-data-[slot=dialog-content]:px-2.5 in-data-[slot=dialog-content]:font-medium in-data-[slot=dialog-content]:text-foreground-secondary! in-data-[slot=dialog-content]:transition-[color] in-data-[slot=dialog-content]:duration-120 in-data-[slot=dialog-content]:ease-[ease] in-data-[slot=dialog-content]:data-[selected=true]:text-foreground! data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75] [&>svg:not([class*='opacity-'])]:opacity-55 [&>svg:not([class*='opacity-'])]:transition-[opacity,color] [&>svg:not([class*='opacity-'])]:duration-(--transition-duration-moderate) in-data-[slot=dialog-content]:[&>svg:not([class*='opacity-'])]:duration-120 in-data-[slot=dialog-content]:[&>svg:not([class*='opacity-'])]:ease-[ease] data-[selected=true]:[&>svg:not([class*='opacity-'])]:opacity-85 in-data-[slot=dialog-content]:data-[selected=true]:[&>svg:not([class*='opacity-'])]:opacity-100! in-data-[slot=dialog-content]:data-[selected=true]:[&>svg:not([class*='opacity-'])]:text-brand-indicator!",
        className
      )}
      {...props}
    >
      {children}
      <CheckIcon className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-has-data-[slot=command-item-detail]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
    </CommandPrimitive.Item>
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground group-data-[selected=true]/command-item:text-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

// Where an item lives, such as "Production · Acme", at the end of the row. It
// shows on the highlighted item only: repeated on every row it is noise. It
// slides in 4px from a 1px blur as the highlight arrives (opacity 180ms,
// transform 220ms, after 40ms) and leaves in 90ms. Reduced motion fades only.
function CommandItemDetail({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-item-detail"
      className={cn(
        "text-muted-foreground ml-auto max-w-[55%] shrink-0 truncate pl-3 text-xs font-normal opacity-0 -translate-x-1 blur-[1px] transition-[opacity,translate,filter] duration-90 ease-[ease] group-data-[selected=true]/command-item:translate-x-0 group-data-[selected=true]/command-item:opacity-100 group-data-[selected=true]/command-item:blur-none group-data-[selected=true]/command-item:delay-40 group-data-[selected=true]/command-item:duration-[180ms,220ms,180ms] group-data-[selected=true]/command-item:ease-out motion-reduce:translate-x-0 motion-reduce:blur-none",
        className
      )}
      {...props}
    />
  )
}

// Key hints under the list. Each direct child is one hint: Kbd keys and a
// label. The keys render at 18px here.
function CommandFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="command-footer"
      className={cn(
        "border-border bg-muted/50 text-muted-foreground flex h-10 shrink-0 items-center gap-4 border-t px-3.5 text-xs *:flex *:items-center *:gap-1 **:data-[slot=kbd]:h-4.5 **:data-[slot=kbd]:min-w-4.5",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandItemDetail,
  CommandSeparator,
  CommandFooter,
}
