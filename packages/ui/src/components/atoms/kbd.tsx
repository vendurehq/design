import * as React from "react"

import { cn } from "@vendure-io/ui/lib/utils"

// A key name such as Ctrl+O or ⌘K reads left to right in a right-to-left
// page too. Each run of text sits in a span with dir="ltr"; the kbd box keeps
// the page direction, so a logical margin such as ms-auto still points to the
// end of the line. A run of text stays one flex item, as it was.
function ltrText(children: React.ReactNode) {
  const out: React.ReactNode[] = []
  let run: React.ReactNode[] = []
  const flush = () => {
    if (run.length > 0) out.push(<span key={out.length} dir="ltr">{run}</span>)
    run = []
  }
  React.Children.toArray(children).forEach((child) => {
    if (typeof child === "string" || typeof child === "number") run.push(child)
    else {
      flush()
      out.push(child)
    }
  })
  flush()
  return out
}

// The v3 look: 12px medium text on the muted tint with a 1px inset hairline,
// 20px high, 5px side padding and the md radius. Inside a tooltip the
// hairline drops, so the key sits on the inverted fill alone.
function Kbd({ className, children, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "bg-muted text-muted-foreground inset-ring inset-ring-border in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background in-data-[slot=tooltip-content]:inset-ring-0 dark:in-data-[slot=tooltip-content]:bg-background/10 pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-md px-1.25 font-sans text-xs leading-none font-medium select-none [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      {...props}
    >
      {ltrText(children)}
    </kbd>
  )
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  )
}

export { Kbd, KbdGroup }
