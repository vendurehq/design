import * as React from "react"

import type { Tone } from "@vendure-io/ui/lib/state-dictionary"
import { cn } from "@vendure-io/ui/lib/utils"

// The size variant publishes the card's spacing contract as CSS variables
// (--card-ps: start padding, --card-px: end padding, --card-gap: vertical
// rhythm shared by the root padding and the flex gap). The default card starts
// its content 2px further in than it ends (18px / 16px), the inset the v3 look
// gives every panel head and row. Slots consume the variables instead
// of `group-data-[size=sm]` hooks so that nested cards resolve to the NEAREST
// card — a group selector matches any ancestor and leaks the outer card's
// size into an inner one.
// The v3 panel: a 12px radius, a full-strength hairline border and the
// themed shadow-control, the 1px lift a resting control has.
// --card-head is the height of a one-line header: 48px, the height of a row,
// so a header and the rows under it share one rhythm (44px in the sm size).
// variant="accent" marks the one card that holds the live subject of the
// page, such as the deployment that is building: the border mixes toward the
// brand (38% in dark; 30% in light, where the translucent `border` gives the
// brand more weight in the mix), and a 1.5% brand wash fades out by 55% of
// the height. The bright brand (brand-500) is the same in both modes. Use it on at most one card per
// view, and show state inside it with a bare StatusBadge, not a chip.
const ACCENT_CARD =
  "data-[variant=accent]:border-[color:color-mix(in_oklab,var(--brand-500)_30%,var(--border))] dark:data-[variant=accent]:border-[color:color-mix(in_oklab,var(--brand-500)_38%,var(--border))] data-[variant=accent]:bg-[image:linear-gradient(180deg,color-mix(in_oklab,var(--brand-500)_1.5%,transparent),transparent_55%)]"

function Card({
  className,
  size = "default",
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?: "default" | "sm"
  variant?: "default" | "accent"
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      data-variant={variant}
      className={cn(
        "bg-card text-card-foreground group/card [--card-gap:--spacing(4)] [--card-ps:--spacing(4.5)] [--card-px:--spacing(4)] [--card-head:--spacing(12)] data-[size=sm]:[--card-gap:--spacing(3)] data-[size=sm]:[--card-ps:--spacing(3)] data-[size=sm]:[--card-px:--spacing(3)] data-[size=sm]:[--card-head:--spacing(11)] flex flex-col gap-(--card-gap) overflow-hidden rounded-2xl border border-border shadow-control py-(--card-gap) text-sm has-[>img:first-child]:pt-0 *:[img:first-child]:rounded-t-2xl *:[img:last-child]:rounded-b-2xl",
        ACCENT_CARD,
        className
      )}
      {...props}
    />
  )
}

// A one-line header (only a CardTitle and an optional CardAction) is one
// --card-head row: 48px, 44px in the sm size, measured from the card edge to
// the next content (or to the border-b). The header keeps the card padding
// above it and the card gap below it. Its children take a negative block
// margin so their line fits between the two, and the header drops its row
// gap (the action spans an empty second row). Nothing moves out of the
// header's box, so a card with its own padding or gap keeps its layout, and a
// title that wraps makes the header taller. A header with a description,
// controls or chips keeps the padded layout.
const ONE_LINE_HEADER =
  "[&:has(>[data-slot=card-title]):not(:has(>:not([data-slot=card-title],[data-slot=card-action])))]:gap-y-0 [&:has(>[data-slot=card-title]):not(:has(>:not([data-slot=card-title],[data-slot=card-action])))]:*:my-[calc((var(--card-head)-2*var(--card-gap)-1lh)/2)] [&:has(>[data-slot=card-title]):not(:has(>:not([data-slot=card-title],[data-slot=card-action])))]:[&.border-b]:*:my-[calc((var(--card-head)-2*var(--card-gap)-1px-1lh)/2)]"

// Band dividers (consumer-applied border-b / border-t on header/footer) use the
// same hairline as the card outline and the CardRows separators.
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-2xl ps-(--card-ps) pe-(--card-px) has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-(--card-gap)",
        ONE_LINE_HEADER,
        className
      )}
      {...props}
    />
  )
}

// The card-title role at body size: 13px/600 in foreground-secondary, quieter
// than the data it labels. Spelled out because tailwind-merge would drop the
// `text-style-card-title` utility next to `text-sm`.
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        "font-heading text-sm font-semibold tracking-[-0.005em] text-foreground-secondary",
        className
      )}
      {...props}
    />
  )
}

// A count beside the title, such as the number of rows in the card. Place it
// inside CardTitle so it sits on the title line, 10px after the title. The
// count is muted; `tone` colours a count that needs action, such as rows
// waiting on the user (warning) or failed pushes (critical). The tones are
// glossary tones; `critical` renders with the `destructive` slots. The card
// itself stays neutral.
type CardCountTone = Extract<Tone, "neutral" | "warning" | "critical">

const cardCountTone: Record<CardCountTone, string> = {
  neutral: "text-muted-foreground",
  warning: "text-warning-text",
  critical: "text-destructive-text",
}

function CardCount({
  className,
  tone = "neutral",
  ...props
}: React.ComponentProps<"span"> & { tone?: CardCountTone }) {
  return (
    <span
      data-slot="card-count"
      className={cn(
        cardCountTone[tone],
        "ms-2.5 text-xs font-semibold tabular-nums",
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
      className={cn("text-foreground-secondary text-sm", className)}
      {...props}
    />
  )
}

// The action box is one title line high and centres its content, so a small
// button lines up with the title and overflows into the card padding instead
// of making the header row taller.
function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 flex h-lh flex-wrap content-center items-center gap-2 self-start justify-self-end",
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
      className={cn("ps-(--card-ps) pe-(--card-px)", className)}
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
        "-my-(--card-gap) [&_tr>*:first-child]:pl-[calc(var(--card-ps)+var(--column-indent,0px))] [&_tr>*:last-child]:pr-(--card-px)",
        className
      )}
      {...props}
    />
  )
}

// Hosts a list of rows edge to edge, for cards whose body is a list. Each row
// draws its own top border, so the first row's border divides it from the
// header: do not add border-b to a CardHeader above CardRows. The negative
// bottom margin cancels the card padding (or the gap before a footer, which
// then must carry its band border-t). As the first child, CardRows also
// cancels the top padding and drops the first row's border. The card clips
// its children, and the last row takes the bottom radius so its hover fill
// and focus ring follow the corner.
function CardRows({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-rows"
      className={cn(
        "-mb-(--card-gap) first:-mt-(--card-gap) *:last:rounded-b-2xl [&:first-child>*:first-child]:border-t-0",
        className
      )}
      {...props}
    />
  )
}

// One row of CardRows: a 48px minimum height, a top border and the card's
// horizontal padding, so row content lines up with the header.
function CardRow({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-row"
      className={cn(
        "flex min-h-12 items-center gap-3 border-t ps-(--card-ps) pe-(--card-px) py-2",
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
        "flex items-center rounded-b-2xl ps-(--card-ps) pe-(--card-px) [.border-t]:pt-(--card-gap)",
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
  CardCount,
  CardAction,
  CardDescription,
  CardContent,
  CardTable,
  CardRows,
  CardRow,
  type CardCountTone,
}
