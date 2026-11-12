import { NavigationMenu as NavigationMenuPrimitive } from "@base-ui/react/navigation-menu"
import { cva } from "class-variance-authority"

import { cn } from "@vendure-io/ui/lib/utils"
import { popupMotion } from "../../lib/popup-motion.ts"
import { ChevronDownIcon } from "lucide-react"
import { usePopupDir } from "../../lib/popup-direction.ts"

function NavigationMenu({
  align = "start",
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Root.Props &
  Pick<NavigationMenuPrimitive.Positioner.Props, "align">) {
  return (
    <NavigationMenuPrimitive.Root
      data-slot="navigation-menu"
      className={cn(
        "group/navigation-menu relative flex max-w-max flex-1 items-center justify-center",
        className
      )}
      {...props}
    >
      {children}
      <NavigationMenuPositioner align={align} />
    </NavigationMenuPrimitive.Root>
  )
}

function NavigationMenuList({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.List>) {
  return (
    <NavigationMenuPrimitive.List
      data-slot="navigation-menu-list"
      className={cn(
        "group flex flex-1 list-none items-center justify-center gap-0",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuItem({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Item>) {
  return (
    <NavigationMenuPrimitive.Item
      data-slot="navigation-menu-item"
      className={cn("relative", className)}
      {...props}
    />
  )
}

const navigationMenuTriggerStyle = cva(
  "bg-transparent hover:bg-muted focus:bg-muted data-open:hover:bg-muted data-open:focus:bg-muted data-open:bg-muted/50 focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring data-popup-open:bg-muted/50 data-popup-open:hover:bg-muted rounded-md px-4 py-2 text-sm font-medium transition-[background-color,opacity] disabled:opacity-50 group/navigation-menu-trigger inline-flex h-9 w-max items-center justify-center disabled:pointer-events-none outline-none"
)

function NavigationMenuTrigger({
  className,
  children,
  ...props
}: NavigationMenuPrimitive.Trigger.Props) {
  return (
    <NavigationMenuPrimitive.Trigger
      data-slot="navigation-menu-trigger"
      className={cn(navigationMenuTriggerStyle(), "group", className)}
      {...props}
    >
      {children}{" "}
      <ChevronDownIcon className="relative top-px ml-1 size-3 transition duration-slow group-data-popup-open/navigation-menu-trigger:rotate-180" aria-hidden="true" />
    </NavigationMenuPrimitive.Trigger>
  )
}

function NavigationMenuContent({
  className,
  ...props
}: NavigationMenuPrimitive.Content.Props) {
  return (
    <NavigationMenuPrimitive.Content
      data-slot="navigation-menu-content"
      className={cn(
        "motion-safe:data-ending-style:data-activation-direction=left:translate-x-[50%] motion-safe:data-ending-style:data-activation-direction=right:translate-x-[-50%] motion-safe:data-starting-style:data-activation-direction=left:translate-x-[-50%] motion-safe:data-starting-style:data-activation-direction=right:translate-x-[50%] h-full w-auto p-2 pr-2.5 transition-[opacity,transform,translate] duration-popup-resize ease-out motion-reduce:transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuPositioner({
  className,
  side = "bottom",
  sideOffset = 8,
  align = "start",
  alignOffset = 0,
  ...props
}: NavigationMenuPrimitive.Positioner.Props) {
  const dir = usePopupDir()
  return (
    <NavigationMenuPrimitive.Portal>
      <NavigationMenuPrimitive.Positioner
        dir={dir}
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        className={cn(
          "isolate z-50 h-(--positioner-height) w-(--positioner-width) max-w-(--available-width) transition-[top,left,right,bottom] duration-popup-resize ease-out data-instant:transition-none motion-reduce:transition-none data-[side=bottom]:before:top-[-10px] data-[side=bottom]:before:right-0 data-[side=bottom]:before:left-0",
          className
        )}
        {...props}
      >
        {/* Opens with popupMotion. While open, it resizes to the next item's content in `popup-resize` (350ms). */}
        <NavigationMenuPrimitive.Popup className={cn("bg-popover text-popover-foreground shadow-overlay xs:w-(--popup-width) relative h-(--popup-height) w-(--popup-width) rounded-xl outline-none", popupMotion, "transition-[opacity,scale,translate,width,height] [transition-duration:var(--transition-duration-popup-fade),var(--transition-duration-normal),var(--transition-duration-normal),var(--transition-duration-popup-resize),var(--transition-duration-popup-resize)] motion-reduce:transition-opacity")}>
          <NavigationMenuPrimitive.Viewport className="relative size-full overflow-hidden" />
        </NavigationMenuPrimitive.Popup>
      </NavigationMenuPrimitive.Positioner>
    </NavigationMenuPrimitive.Portal>
  )
}

// Base UI writes a valueless data-active (with aria-current="page") on the
// active link, so the variant is data-active:, not data-[active=true]:. The
// active link gets the tabs line-variant underline.
function NavigationMenuLink({
  className,
  ...props
}: NavigationMenuPrimitive.Link.Props) {
  return (
    <NavigationMenuPrimitive.Link
      data-slot="navigation-menu-link"
      className={cn(
        "data-active:text-foreground data-active:font-medium focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring hover:bg-muted focus:bg-muted relative flex items-center gap-1.5 rounded-sm p-2 text-sm transition-[color,background-color] outline-none [&_svg:not([class*='size-'])]:size-4 after:bg-foreground after:absolute after:inset-x-2 after:bottom-0 after:h-0.5 after:opacity-0 after:transition-opacity data-active:after:opacity-100",
        className
      )}
      {...props}
    />
  )
}

function NavigationMenuIndicator({
  className,
  ...props
}: React.ComponentPropsWithRef<typeof NavigationMenuPrimitive.Icon>) {
  // Base UI's Icon emits data-popup-open while its item's popup is open (never Radix-style
  // data-[state=...]) and stays mounted when closed with no closed/ending attribute, so the
  // closed state is hidden via opacity, faded in step with the popup
  return (
    <NavigationMenuPrimitive.Icon
      data-slot="navigation-menu-indicator"
      className={cn(
        "transition-opacity duration-popup-fade ease-out not-data-popup-open:opacity-0 top-full z-1 flex h-1.5 items-end justify-center overflow-hidden",
        className
      )}
      {...props}
    >
      <div className="bg-border relative top-[60%] h-2 w-2 rotate-45 rounded-tl-sm shadow-md" />
    </NavigationMenuPrimitive.Icon>
  )
}

export {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
  NavigationMenuPositioner,
}
