"use client"

import {
  DirectionProvider as DirectionProviderPrimitive,
  useDirection,
} from "@base-ui/react/direction-provider"

import { ProvidedDirection } from "../../lib/popup-direction.ts"

/**
 * Sets the direction for Base UI behaviour (keyboard navigation, sides and
 * alignment) and for every popup inside it, which renders in a portal. It does
 * not set `dir` on any element: set it on `<html>`, or on the element that
 * wraps the right-to-left region, so the page's own layout follows too.
 */
function DirectionProvider({
  direction = "ltr",
  ...props
}: DirectionProviderPrimitive.Props) {
  return (
    <ProvidedDirection.Provider value={direction}>
      <DirectionProviderPrimitive direction={direction} {...props} />
    </ProvidedDirection.Provider>
  )
}

export { DirectionProvider, useDirection }
