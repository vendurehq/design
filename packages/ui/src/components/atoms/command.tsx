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
   * Draws the selected item's highlight as one fill that slides from item to
   * item. It snaps while an arrow key repeats, so it never trails the
   * selection. Off by default: each item then fills itself.
   */
  slidingHighlight?: boolean
}) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      data-highlight={slidingHighlight ? "slide" : undefined}
      className={cn(
        "no-scrollbar h-(--cmdk-list-height) max-h-72 scroll-py-1 overflow-x-hidden overflow-y-auto overscroll-contain outline-none transition-[height] duration-(--transition-duration-normal) ease-drawer in-data-[slot=dialog-content]:max-h-95 motion-reduce:transition-none *:[[cmdk-list-sizer]]:relative *:[[cmdk-list-sizer]]:p-1",
        className
      )}
      {...props}
    >
      {slidingHighlight && <CommandHighlight />}
      {children}
    </CommandPrimitive.List>
  )
}

// The sliding highlight of a CommandList. It sits in cmdk's list sizer, so it
// scrolls with the items, and follows the item cmdk marks
// data-selected="true": a MutationObserver catches the selection moving and
// the results changing, a ResizeObserver catches layout changes. While a key
// repeats the transition is off, so the highlight stays under the selection.
function CommandHighlight() {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useLayoutEffect(() => {
    const highlight = ref.current
    const sizer = highlight?.parentElement
    if (!highlight || !sizer) {
      return
    }

    const place = () => {
      const selected = sizer.querySelector<HTMLElement>(
        '[cmdk-item][data-selected="true"]'
      )
      if (!selected) {
        delete highlight.dataset.shown
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
      highlight.style.transform = `translate(${left}px, ${top}px)`
      highlight.style.width = `${selected.offsetWidth}px`
      highlight.style.height = `${selected.offsetHeight}px`
      highlight.dataset.shown = ""
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
    const onKeyDown = (event: Event) => {
      if ((event as KeyboardEvent).repeat) {
        highlight.dataset.instant = ""
      }
    }
    const onKeyUp = () => {
      delete highlight.dataset.instant
    }
    root?.addEventListener("keydown", onKeyDown)
    root?.addEventListener("keyup", onKeyUp)

    return () => {
      cancelAnimationFrame(frame)
      mutations.disconnect()
      resize.disconnect()
      root?.removeEventListener("keydown", onKeyDown)
      root?.removeEventListener("keyup", onKeyUp)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      role="none"
      data-slot="command-highlight"
      className="bg-accent pointer-events-none absolute top-0 left-0 rounded-sm opacity-0 in-data-[slot=dialog-content]:rounded-lg data-shown:opacity-100 data-ready:transition-[transform,height,opacity] data-ready:duration-(--transition-duration-moderate) data-ready:ease-out data-instant:transition-none! motion-reduce:data-ready:transition-opacity"
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
// item's own fill. Palette items (in the dialog) are 40px tall.
function CommandItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[selected=true]:**:[svg]:text-accent-foreground in-data-[highlight=slide]:data-[selected=true]:bg-transparent! group/command-item relative flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none in-data-[slot=dialog-content]:h-10 in-data-[slot=dialog-content]:gap-3 in-data-[slot=dialog-content]:rounded-lg! in-data-[slot=dialog-content]:px-2.5 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='stroke-'])]:stroke-[1.75] [&>svg:not([class*='opacity-'])]:opacity-55 [&>svg:not([class*='opacity-'])]:transition-opacity [&>svg:not([class*='opacity-'])]:duration-(--transition-duration-moderate) data-[selected=true]:[&>svg:not([class*='opacity-'])]:opacity-85",
        className
      )}
      {...props}
    >
      {children}
      <CheckIcon className="ml-auto opacity-0 group-has-data-[slot=command-shortcut]/command-item:hidden group-data-[checked=true]/command-item:opacity-100" />
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
  CommandSeparator,
  CommandFooter,
}
