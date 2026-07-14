import * as React from "react"

import { cn } from "@vendure-io/ui/lib/utils"

// The size variant publishes the card's spacing contract as CSS variables
// (--card-px: horizontal content padding, --card-gap: vertical rhythm shared
// by the root padding and the flex gap). Slots consume the variables instead
// of `group-data-[size=sm]` hooks so that nested cards resolve to the NEAREST
// card — a group selector matches any ancestor and leaks the outer card's
// size into an inner one.
function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & { size?: "default" | "sm" }) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        "bg-card text-card-foreground group/card [--card-gap:--spacing(6)] [--card-px:--spacing(6)] data-[size=sm]:[--card-gap:--spacing(4)] data-[size=sm]:[--card-px:--spacing(4)] flex flex-col gap-(--card-gap) overflow-hidden rounded-xl border border-border/60 py-(--card-gap) text-sm has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl",
        className
      )}
      {...props}
    />
  )
}

// Band dividers (consumer-applied border-b / border-t on header/footer) render
// at row-separator strength (border/50) so the card outline (border/60) stays
// the strongest structural line.
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-(--card-px) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:border-border/50 [.border-b]:pb-(--card-gap)",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "text-style-card-title group-data-[size=sm]/card:text-sm",
        className
      )}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-(--card-px)", className)}
      {...props}
    />
  )
}

// Hosts a Table full-bleed inside the card: negative vertical margins cancel
// the card's flex gap against a border-b header / border-t footer, and cancel
// the card's own padding when the table is the first/last child, so rows and
// band dividers run edge to edge (the card's overflow-hidden clips the
// corners). Edge cells get the card's content padding so cell content aligns
// with CardHeader/CardFooter content. Two contract notes:
// - The gap cancellation is unconditional: an adjacent CardHeader/CardFooter
//   must carry its band border (border-b / border-t), otherwise the table
//   sits directly against the band's content.
// - The edge-cell selector ((0,2,1)) out-specifies a plain padding utility on
//   the cell ((0,1,0)): a `pl-*`/`pr-*` on a first/last cell silently loses —
//   override with the important modifier (`pl-0!`) when a cell must opt out.
function CardTable({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-table"
      className={cn(
        "-my-(--card-gap) [&_tr>*:first-child]:pl-(--card-px) [&_tr>*:last-child]:pr-(--card-px)",
        className
      )}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        "flex items-center rounded-b-xl px-(--card-px) [.border-t]:border-border/50 [.border-t]:pt-(--card-gap)",
        className
      )}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  CardTable,
}
