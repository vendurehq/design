import { cn } from "@vendure-io/ui/lib/utils"

// The v3 look: 12px medium text on the muted tint with a 1px inset hairline,
// 20px high, 5px side padding and the md radius. Inside a tooltip the
// hairline drops, so the key sits on the inverted fill alone. A key name
// such as Ctrl+O reads left to right in a right-to-left page too.
function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      dir="ltr"
      className={cn(
        "bg-muted text-muted-foreground inset-ring inset-ring-border in-data-[slot=tooltip-content]:bg-background/20 in-data-[slot=tooltip-content]:text-background in-data-[slot=tooltip-content]:inset-ring-0 dark:in-data-[slot=tooltip-content]:bg-background/10 pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-md px-1.25 font-sans text-xs leading-none font-medium select-none [&_svg:not([class*='size-'])]:size-3",
        className
      )}
      {...props}
    />
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
