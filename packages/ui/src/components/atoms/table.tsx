"use client"

import * as React from "react"

import { cn } from "@vendure-io/ui/lib/utils"

// How far the table runs past each edge of its scroll container, in px.
// Start and end follow the reading direction. Right to left, browsers report
// `scrollLeft` from 0 at the start down to a negative number at the end, so
// the distance from the start is its absolute value.
function overflowAtEdges(container: HTMLElement) {
  const overflow = Math.max(container.scrollWidth - container.clientWidth, 0)
  const start = Math.min(Math.abs(container.scrollLeft), overflow)
  return { start, end: overflow - start }
}

// The scroll cue: when the table is wider than its container, each edge with
// hidden content past it fades out, so the column cut at the edge reads as
// cut, not as the last column. The fade is a mask on the container, so it
// needs no background colour and works on any surface (page, card). Each fade
// is as wide as the content hidden past its edge, up to 32px, so it shrinks
// with the scroll and is gone when that edge is reached; it follows the
// scroll and has no transition of its own. `data-overflow-start` and
// `data-overflow-end` mark the edges that fade. A table that fits has no mask.
// The focus ring is drawn inside the container, where the mask would fade it,
// so while it shows, a 2px frame under it stays opaque.
const scrollCue = [
  "[--table-fade-start:min(var(--table-overflow-start,0px),calc(var(--spacing)*8))] [--table-fade-end:min(var(--table-overflow-end,0px),calc(var(--spacing)*8))]",
  "[--table-fade:linear-gradient(to_right,transparent,black_var(--table-fade-start),black_calc(100%_-_var(--table-fade-end)),transparent)]",
  "rtl:[--table-fade:linear-gradient(to_left,transparent,black_var(--table-fade-start),black_calc(100%_-_var(--table-fade-end)),transparent)]",
  "data-overflow-start:[mask-image:var(--table-fade)] data-overflow-end:[mask-image:var(--table-fade)]",
  "focus-visible:[mask-image:var(--table-fade),var(--table-ring-strip),var(--table-ring-strip),var(--table-ring-strip),var(--table-ring-strip)]! [--table-ring-strip:linear-gradient(black,black)]",
  "focus-visible:[mask-position:0_0,left,right,top,bottom] focus-visible:[mask-size:100%_100%,2px_100%,2px_100%,100%_2px,100%_2px] focus-visible:[mask-repeat:no-repeat]",
].join(" ")

// Pinning (`pinFirstColumn`): the first cell of every row (header, body,
// footer) stays at the inline-start edge while the other columns scroll under
// it. Every other cell is isolated, so a raised control inside it (`z-10`)
// still scrolls under the pinned cell; popovers and menus render in a portal
// and stay above. The selected-row bar is drawn above the pinned cell.
// A pinned cell must be opaque. It paints `--table-surface` (default: the card
// surface; set it on an ancestor when the table sits on another surface) and
// layers the row's state fill over it (`--table-row-fill`, set by TableRow on
// hover and selection and by TableFooter), so hover and selection still show.
// While content is scrolled under it (`data-overflow-start`), the pinned cell
// shows a 1px edge in the input colour on its inline-end side, the sideways
// twin of `shadow-scrolled` on a sticky header. It is an inset shadow: a
// table cell with collapsed borders does not paint an outer one. The edge fades in and out
// (`fast`) and switches at once under reduced motion. The start fade is off
// when pinned: it would fade the pinned cell, and the edge replaces it. The
// end fade stays.
// Tailwind reads class names from this source as written, so each one is
// spelled out in full.
const pinnedColumn = [
  "[&[data-pin-first-column]_tr>:first-child]:sticky [&[data-pin-first-column]_tr>:first-child]:start-0 [&[data-pin-first-column]_tr>:first-child]:z-3 [&[data-pin-first-column]_tr>:first-child]:[background-color:var(--table-surface,var(--card))] [&[data-pin-first-column]_tr>:first-child]:[background-image:linear-gradient(var(--table-row-fill,transparent),var(--table-row-fill,transparent))]",
  "[&[data-pin-first-column]_tr>:not(:first-child)]:isolate",
  "[&[data-pin-first-column]_tr]:before:z-4 [&[data-pin-first-column]_tr]:after:z-4",
  "[&[data-pin-first-column]_tr>:first-child]:[box-shadow:var(--table-pin-edge)] [--table-pin-edge:inset_0_0_0_transparent] data-overflow-start:[--table-pin-edge:inset_-1px_0_0_var(--input)] rtl:data-overflow-start:[--table-pin-edge:inset_1px_0_0_var(--input)]",
  "motion-safe:[&[data-pin-first-column]_tr>:first-child]:[transition:box-shadow_var(--transition-duration-fast)_var(--ease-soft)]",
  "[&[data-pin-first-column]]:[--table-fade-start:0px]",
].join(" ")

// When the table is wider than its container, the container scrolls and must
// be reachable by keyboard (axe scrollable-region-focusable), so it becomes a
// tab stop with a focus ring. A table that fits adds no tab stop.
function Table({
  className,
  pinFirstColumn = false,
  ...props
}: React.ComponentProps<"table"> & {
  /** Keeps the first column in place while the others scroll sideways. */
  pinFirstColumn?: boolean
}) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = React.useState(false)

  // Measure before the first paint, so an overflowing table is a tab stop and
  // shows its cue from the start; the observer then tracks later size
  // changes, and the scroll listener moves the cue. The cue is written to the
  // container directly, not through state, so a scroll does not re-render.
  React.useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }
    const updateCue = () => {
      const { start, end } = overflowAtEdges(container)
      // `scrollWidth` and `clientWidth` are rounded, so at the end of the
      // scroll up to 1px can still seem hidden. That is not worth a cue.
      container.toggleAttribute("data-overflow-start", start > 1)
      container.toggleAttribute("data-overflow-end", end > 1)
      container.style.setProperty("--table-overflow-start", `${start}px`)
      container.style.setProperty("--table-overflow-end", `${end}px`)
    }
    const update = () => {
      setScrollable(container.scrollWidth > container.clientWidth)
      updateCue()
    }
    update()
    container.addEventListener("scroll", updateCue, { passive: true })
    if (typeof ResizeObserver === "undefined") {
      return () => container.removeEventListener("scroll", updateCue)
    }
    const observer = new ResizeObserver(update)
    observer.observe(container)
    if (container.firstElementChild) {
      observer.observe(container.firstElementChild)
    }
    return () => {
      observer.disconnect()
      container.removeEventListener("scroll", updateCue)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      data-slot="table-container"
      tabIndex={scrollable ? 0 : undefined}
      data-pin-first-column={pinFirstColumn ? "" : undefined}
      className={`focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring relative w-full overflow-x-auto rounded-[inherit] outline-none ${scrollCue} ${pinnedColumn}`}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

// Marks each row whose next row is selected with `data-next-selected`, for the
// selected-row bar (see selectedBar). The marks are synced in a layout effect
// on every commit, so they change in the same task as the selection (a style
// read before a microtask would see stale marks and start the bar from the
// wrong place). A MutationObserver covers a row that changes `data-state`
// without this body re-rendering.
function syncNextSelectedMarks(body: HTMLTableSectionElement) {
  for (let row = body.firstElementChild; row; row = row.nextElementSibling) {
    const mark =
      row.nextElementSibling?.getAttribute("data-state") === "selected"
    if (row.hasAttribute("data-next-selected") !== mark) {
      row.toggleAttribute("data-next-selected", mark)
    }
  }
}

function useNextSelectedMarks(
  body: React.RefObject<HTMLTableSectionElement | null>
) {
  React.useLayoutEffect(() => {
    if (body.current) {
      syncNextSelectedMarks(body.current)
    }
  })
  React.useLayoutEffect(() => {
    const element = body.current
    if (!element || typeof MutationObserver === "undefined") {
      return
    }
    const observer = new MutationObserver((records) => {
      if (
        records.some(
          (record) =>
            record.target === element ||
            record.target.parentElement === element
        )
      ) {
        syncNextSelectedMarks(element)
      }
    })
    observer.observe(element, {
      childList: true,
      subtree: true,
      attributeFilter: ["data-state"],
    })
    return () => observer.disconnect()
  }, [body])
}

function TableBody({
  className,
  ref,
  ...props
}: React.ComponentProps<"tbody">) {
  const bodyRef = React.useRef<HTMLTableSectionElement>(null)
  useNextSelectedMarks(bodyRef)
  const setRef = React.useCallback(
    (node: HTMLTableSectionElement | null) => {
      bodyRef.current = node
      if (typeof ref === "function") {
        return ref(node)
      }
      if (ref) {
        ref.current = node
      }
    },
    [ref]
  )
  return (
    <tbody
      ref={setRef}
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0 [--table-row-fill:color-mix(in_oklab,var(--muted)_50%,transparent)]",
        className
      )}
      {...props}
    />
  )
}

// data-state="selected" is the DataTable (TanStack) row-selection marker, not a
// Radix attribute, so the selector is live. Selected rows use the muted fill,
// as in the v3 look, plus a brand-colour bar on the inline-start edge, so they
// stay distinct from the lighter muted/50 hover.
//
// The bar draws itself and knows its neighbours. It is two pseudo-elements of
// the row, both full height and absolute (so neither becomes a table cell):
// ::before shows the top half and ::after the bottom half, each through a
// clip-path inset. A selected row shows both halves. An unselected row
// collapses each half to the point the bar grows from, so selecting animates
// the clip from there (`moderate`, `ease-out`) and deselecting plays it back:
// - no selected neighbour: both halves from the middle, so it grows outward;
// - a selected row above: both from the top, so it extends that row's bar down;
// - a selected row below: both from the bottom, so it grows up from it;
// - selected rows on both sides: the top half from the top and the bottom half
//   from the bottom, so they meet in the middle.
// The selected clips are `!important` to beat the neighbour rules, whose
// sibling selectors are more specific. A range selection grows all its bars
// at once. The DataTable's select all and clear all ripple instead: they
// delay each row and start every bar from its top (SELECT_RIPPLE_ROW_CLASS). The selected halves overlap by 1px (each runs 0.5px past the middle):
// on a row of an odd height the middle falls on a half pixel, and two edges
// that each cover half of a pixel row blend to a lighter 1px notch. With the
// overlap one half fully covers every pixel row, whatever the height.
// A bar that grows on its own (no selected neighbour) also fades in and
// widens from 1px to 2px against the table edge (`scale` 0.5 on x, origin
// inline-start), so it arrives softly: `moderate`, opacity on `ease-soft` and
// scale on `ease-out`, as the checkbox fill. Clearing plays it back in
// `fast`, both on `ease-soft`, as the checkbox clears; its clip waits for that
// and then jumps, since a collapsing clip would hide the bar in a few frames.
// A bar that extends a selected neighbour stays opaque and full width, so the
// line has no lighter or thinner join, and clears by shrinking toward the
// neighbour (`--bar-clip-duration`, `--bar-clip-delay`, set on the
// pseudo-elements: on the row they would be inherited by every cell, and a
// change would restyle the whole row). The row below is read from
// `data-next-selected`, which TableBody keeps up to date, not with
// `:has(+[data-state=selected])`: in Chromium any such rule makes a change of
// `data-state` restyle every row with all its cells, and select all on a long
// table then drops frames. At rest
// the bar is the same as without the motion: opacity 1, no scale. Under
// reduced motion the bar is whole and only fades: the clip jumps on select and
// waits for the fade on deselect.
const selectedBar = [
  "before:pointer-events-none before:absolute before:inset-y-0 before:start-0 before:w-0.5 before:bg-brand-indicator",
  "after:pointer-events-none after:absolute after:inset-y-0 after:start-0 after:w-0.5 after:bg-brand-indicator",
  "before:[clip-path:inset(50%_0_50%_0)] after:[clip-path:inset(50%_0_50%_0)]",
  "[[data-state=selected]+&]:before:[clip-path:inset(0_0_100%_0)] [[data-state=selected]+&]:after:[clip-path:inset(0_0_100%_0)]",
  "data-next-selected:before:[clip-path:inset(100%_0_0_0)] data-next-selected:after:[clip-path:inset(100%_0_0_0)]",
  "[[data-state=selected]+&[data-next-selected]]:before:[clip-path:inset(0_0_100%_0)] [[data-state=selected]+&[data-next-selected]]:after:[clip-path:inset(100%_0_0_0)]",
  "data-[state=selected]:before:[clip-path:inset(0_0_calc(50%_-_0.5px)_0)]! data-[state=selected]:after:[clip-path:inset(calc(50%_-_0.5px)_0_0_0)]!",
  "before:origin-left after:origin-left rtl:before:origin-right rtl:after:origin-right",
  "motion-safe:before:opacity-0 motion-safe:after:opacity-0 motion-safe:before:[scale:0.5_1] motion-safe:after:[scale:0.5_1]",
  "motion-safe:[[data-state=selected]+&]:before:opacity-100 motion-safe:[[data-state=selected]+&]:after:opacity-100 motion-safe:[[data-state=selected]+&]:before:[scale:none] motion-safe:[[data-state=selected]+&]:after:[scale:none]",
  "motion-safe:data-next-selected:before:opacity-100 motion-safe:data-next-selected:after:opacity-100 motion-safe:data-next-selected:before:[scale:none] motion-safe:data-next-selected:after:[scale:none]",
  "motion-safe:data-[state=selected]:before:opacity-100 motion-safe:data-[state=selected]:after:opacity-100 motion-safe:data-[state=selected]:before:[scale:none] motion-safe:data-[state=selected]:after:[scale:none]",
  "before:[--bar-clip-duration:0s] after:[--bar-clip-duration:0s] before:[--bar-clip-delay:var(--transition-duration-fast)] after:[--bar-clip-delay:var(--transition-duration-fast)]",
  "[[data-state=selected]+&]:before:[--bar-clip-duration:var(--transition-duration-moderate)] [[data-state=selected]+&]:after:[--bar-clip-duration:var(--transition-duration-moderate)] [[data-state=selected]+&]:before:[--bar-clip-delay:0s] [[data-state=selected]+&]:after:[--bar-clip-delay:0s] data-next-selected:before:[--bar-clip-duration:var(--transition-duration-moderate)] data-next-selected:after:[--bar-clip-duration:var(--transition-duration-moderate)] data-next-selected:before:[--bar-clip-delay:0s] data-next-selected:after:[--bar-clip-delay:0s]",
  "before:[transition:clip-path_var(--bar-clip-duration)_var(--ease-out)_var(--bar-clip-delay),opacity_var(--transition-duration-fast)_var(--ease-soft),scale_var(--transition-duration-fast)_var(--ease-soft)] after:[transition:clip-path_var(--bar-clip-duration)_var(--ease-out)_var(--bar-clip-delay),opacity_var(--transition-duration-fast)_var(--ease-soft),scale_var(--transition-duration-fast)_var(--ease-soft)]",
  "motion-safe:data-[state=selected]:before:[transition:clip-path_var(--transition-duration-moderate)_var(--ease-out),opacity_var(--transition-duration-moderate)_var(--ease-soft),scale_var(--transition-duration-moderate)_var(--ease-out)] motion-safe:data-[state=selected]:after:[transition:clip-path_var(--transition-duration-moderate)_var(--ease-out),opacity_var(--transition-duration-moderate)_var(--ease-soft),scale_var(--transition-duration-moderate)_var(--ease-out)]",
  "motion-reduce:before:opacity-0 motion-reduce:after:opacity-0 motion-reduce:data-[state=selected]:before:opacity-100 motion-reduce:data-[state=selected]:after:opacity-100",
  "motion-reduce:before:[transition:opacity_var(--transition-duration-fast)_var(--ease-soft),clip-path_0s_linear_var(--transition-duration-fast)] motion-reduce:after:[transition:opacity_var(--transition-duration-fast)_var(--ease-soft),clip-path_0s_linear_var(--transition-duration-fast)]",
  "motion-reduce:data-[state=selected]:before:[transition:opacity_var(--transition-duration-moderate)_var(--ease-soft)] motion-reduce:data-[state=selected]:after:[transition:opacity_var(--transition-duration-moderate)_var(--ease-soft)]",
].join(" ")

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted relative border-b border-border/50 transition-colors hover:[--table-row-fill:color-mix(in_oklab,var(--muted)_50%,transparent)] data-[state=selected]:[--table-row-fill:var(--muted)]",
        selectedBar,
        className
      )}
      {...props}
    />
  )
}

// Every header label has the same size, weight and colour: 12px, medium,
// muted, the small label of the v3 look. A sortable header (a ghost Button)
// inherits the colour, so only its sort icon says it sorts.
function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-muted-foreground h-10 px-2 text-start align-middle text-xs font-medium whitespace-nowrap [&:has([role=checkbox])]:pe-0",
        className
      )}
      {...props}
    />
  )
}

// A body row is at least 48px (`h-12`), the same as a ListRow and a CardRow.
// On a table cell `height` is a minimum (`min-height` does nothing there), so
// taller content (a thumbnail, two lines) still grows the row. The column
// header row stays 40px (TableHead). The row's 1px divider counts in the
// 48px. The table collapses its borders, so each row box holds half of the
// divider above and half of its own. The cell pads 7.5px on both sides, so
// 32px content (a thumbnail, a button) fills the row at 48px, and it and
// one-line text sit as far from the divider above as from the one below.
function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "h-12 px-2 py-[7.5px] align-middle whitespace-nowrap [&:has([role=checkbox])]:pe-0",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
