"use client"

import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { cn } from "../../lib/utils.ts"
import { triggerSlot } from "../../lib/trigger-slot.ts"

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

function CollapsibleTrigger({ ...props }: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger {...triggerSlot("collapsible-trigger", props.render)} {...props} />
  )
}

/**
 * The panel eases its height with a CSS transition on the height curve, so a
 * second click mid-way reverses from where the panel is. Nothing animates on
 * first render: a panel that starts open just shows. The panel clips its
 * content only while the height runs (starting and ending style, and for one
 * slow duration after the open starts), so focus rings and popovers inside are
 * not cut off once it is open. Under reduced motion the height snaps and only
 * a short fade remains.
 */
function CollapsibleContent({
  className,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        "h-(--collapsible-panel-height) data-starting-style:h-0 data-starting-style:overflow-hidden data-ending-style:h-0 data-ending-style:overflow-hidden motion-safe:[transition:height_var(--transition-duration-slow)_var(--ease-height),overflow_0s_var(--transition-duration-slow)_allow-discrete] motion-safe:data-ending-style:[transition-delay:0s] motion-reduce:transition-opacity motion-reduce:duration-fast motion-reduce:ease-default motion-reduce:data-starting-style:opacity-0 motion-reduce:data-ending-style:h-(--collapsible-panel-height) motion-reduce:data-ending-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
