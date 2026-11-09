"use client"

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"

import { cn } from "@vendure-io/ui/lib/utils"
import { ChevronDownIcon } from "lucide-react"

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:border-b", className)}
      {...props}
    />
  )
}

/**
 * The header of an item: one full-width button with the title and a down
 * chevron. The chevron sits 2px down, centred on the title's first 20px line,
 * so it stays on that line when the title wraps. A closed trigger fills on hover. The chevron turns over on the
 * panel's height timing, so both settle together; its colour follows the
 * hover on the fill's timing.
 */
function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:outline-solid focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring **:data-[slot=accordion-trigger-icon]:text-muted-foreground group/accordion-trigger relative flex flex-1 cursor-pointer items-start justify-between rounded-md border border-transparent px-3 py-4 text-left text-sm font-medium outline-none transition-colors duration-(--transition-duration-fast) ease-(--ease-default) not-aria-expanded:hover:bg-muted aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:mt-0.5",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          data-slot="accordion-trigger-icon"
          aria-hidden="true"
          className="pointer-events-none shrink-0 [transition:rotate_var(--transition-duration-slow)_var(--ease-drawer),color_var(--transition-duration-fast)_var(--ease-default)] group-hover/accordion-trigger:text-foreground group-aria-expanded/accordion-trigger:rotate-180 motion-reduce:[transition:color_var(--transition-duration-fast)_var(--ease-default)]"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

/**
 * The panel eases its height and opacity with CSS transitions, so a second
 * click mid-way reverses from where the panel is. Under reduced motion the
 * height snaps and only a short fade remains.
 */
function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="h-(--accordion-panel-height) overflow-hidden text-sm data-starting-style:h-0 data-starting-style:opacity-0 data-ending-style:h-0 data-ending-style:opacity-0 motion-safe:transition-[height,opacity] motion-safe:duration-(--transition-duration-slow) motion-safe:ease-(--ease-drawer) motion-reduce:transition-opacity motion-reduce:data-ending-style:h-(--accordion-panel-height) motion-reduce:duration-(--transition-duration-fast) motion-reduce:ease-(--ease-default)"
      {...props}
    >
      <div
        className={cn(
          "[&_a]:hover:text-foreground px-3 pt-0 pb-4 [&_a]:underline [&_a]:underline-offset-3 [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
