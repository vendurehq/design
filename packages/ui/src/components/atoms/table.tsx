"use client"

import * as React from "react"

import { cn } from "@vendure-io/ui/lib/utils"

// When the table is wider than its container, the container scrolls and must
// be reachable by keyboard (axe scrollable-region-focusable), so it becomes a
// tab stop with a focus ring. A table that fits adds no tab stop.
function Table({ className, ...props }: React.ComponentProps<"table">) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [scrollable, setScrollable] = React.useState(false)

  // Measure before the first paint, so an overflowing table is a tab stop
  // from the start; the observer then tracks later size changes.
  React.useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }
    const update = () =>
      setScrollable(container.scrollWidth > container.clientWidth)
    update()
    if (typeof ResizeObserver === "undefined") {
      return
    }
    const observer = new ResizeObserver(update)
    observer.observe(container)
    if (container.firstElementChild) {
      observer.observe(container.firstElementChild)
    }
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={containerRef}
      data-slot="table-container"
      tabIndex={scrollable ? 0 : undefined}
      className="focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring relative w-full overflow-x-auto rounded-[inherit] outline-none"
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

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
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
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
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
// overlap one half fully covers every pixel row, whatever the height. Under
// reduced motion the bar is whole and only fades: the clip jumps on select and
// waits for the fade on deselect.
const selectedBar = [
  "before:pointer-events-none before:absolute before:inset-y-0 before:start-0 before:w-0.5 before:bg-brand-indicator",
  "after:pointer-events-none after:absolute after:inset-y-0 after:start-0 after:w-0.5 after:bg-brand-indicator",
  "before:[clip-path:inset(50%_0_50%_0)] after:[clip-path:inset(50%_0_50%_0)]",
  "[[data-state=selected]+&]:before:[clip-path:inset(0_0_100%_0)] [[data-state=selected]+&]:after:[clip-path:inset(0_0_100%_0)]",
  "[&:has(+[data-state=selected])]:before:[clip-path:inset(100%_0_0_0)] [&:has(+[data-state=selected])]:after:[clip-path:inset(100%_0_0_0)]",
  "[[data-state=selected]+&:has(+[data-state=selected])]:before:[clip-path:inset(0_0_100%_0)] [[data-state=selected]+&:has(+[data-state=selected])]:after:[clip-path:inset(100%_0_0_0)]",
  "data-[state=selected]:before:[clip-path:inset(0_0_calc(50%_-_0.5px)_0)]! data-[state=selected]:after:[clip-path:inset(calc(50%_-_0.5px)_0_0_0)]!",
  "before:[transition:clip-path_var(--transition-duration-moderate)_var(--ease-out)] after:[transition:clip-path_var(--transition-duration-moderate)_var(--ease-out)]",
  "motion-reduce:before:opacity-0 motion-reduce:after:opacity-0 motion-reduce:data-[state=selected]:before:opacity-100 motion-reduce:data-[state=selected]:after:opacity-100",
  "motion-reduce:before:[transition:opacity_var(--transition-duration-fast)_var(--ease-soft),clip-path_0s_linear_var(--transition-duration-fast)] motion-reduce:after:[transition:opacity_var(--transition-duration-fast)_var(--ease-soft),clip-path_0s_linear_var(--transition-duration-fast)]",
  "motion-reduce:data-[state=selected]:before:[transition:opacity_var(--transition-duration-moderate)_var(--ease-soft)] motion-reduce:data-[state=selected]:after:[transition:opacity_var(--transition-duration-moderate)_var(--ease-soft)]",
].join(" ")

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted relative border-b border-border/50 transition-colors",
        selectedBar,
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0",
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
