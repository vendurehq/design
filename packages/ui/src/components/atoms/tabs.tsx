"use client"

import { mergeProps } from "@base-ui/react/merge-props"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@vendure-io/ui/lib/utils"

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "rounded-lg p-[3px] group-data-horizontal/tabs:h-9 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-inset",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent",
        // ADR 0001: the active trigger lifts to surface-raised out of the inset
        // track in both themes. Dark keeps a hairline — lightness alone can't
        // separate a 0.21 thumb near the black end of the ramp.
        "data-active:bg-surface-raised dark:data-active:border-input dark:data-active:text-foreground data-active:text-foreground",
        "after:bg-foreground after:absolute after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 text-sm outline-none", className)}
      {...props}
    />
  )
}

// Link tabs: section navigation where each tab is a route. They look like the
// line variant, but they are a <nav> of links with aria-current="page", not a
// tablist. Base UI Tabs would put role="tab" on a link and expect a panel for
// each tab, and the router already owns which section shows.
function TabsNav({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      data-slot="tabs-nav"
      className={cn(
        // The padding keeps the focus ring and the underline inside the
        // scroll box, which clips everything outside it.
        "text-muted-foreground flex h-9 max-w-full items-center gap-1 overflow-x-auto p-[3px]",
        className
      )}
      {...props}
    />
  )
}

// `active` sets aria-current="page". The style reads aria-current, so a router
// link that sets it on the active route (TanStack Router, React Router's
// NavLink) works through `render` without `active`.
function TabsLink({
  className,
  active,
  render,
  ...props
}: useRender.ComponentProps<"a"> & { active?: boolean }) {
  return useRender({
    defaultTagName: "a",
    render,
    props: mergeProps<"a">(
      {
        // Leave the attribute to the router link unless `active` is set.
        ...(active !== undefined && {
          "aria-current": active ? ("page" as const) : undefined,
        }),
        className: cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-full shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-all focus-visible:ring-[3px] focus-visible:outline-1 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          "aria-[current=page]:text-foreground dark:aria-[current=page]:text-foreground",
          // The underline sits on the bottom edge of the nav, like the line variant.
          "after:bg-foreground after:absolute after:inset-x-0 after:bottom-[-4px] after:h-0.5 after:opacity-0 after:transition-opacity aria-[current=page]:after:opacity-100",
          className
        ),
      },
      props
    ),
    state: {
      slot: "tabs-link",
    },
  })
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsNav,
  TabsLink,
  tabsListVariants,
}
