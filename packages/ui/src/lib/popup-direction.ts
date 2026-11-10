import * as React from 'react';

type Direction = 'ltr' | 'rtl';

/**
 * The direction the nearest DirectionProvider sets, or undefined outside one.
 * Base UI's `useDirection` returns "ltr" in both cases, so it cannot tell a
 * provider that says left to right from no provider at all.
 */
export const ProvidedDirection = React.createContext<Direction | undefined>(undefined);

/**
 * The `dir` a popup positioner carries. A popup renders in a portal at the end
 * of the body, so it inherits the document's direction, not the provider's.
 * Floating UI reads the direction from the positioner's computed style to
 * place `start` and `end`, and the items inherit it too. Inside a provider the
 * positioner gets the provider's direction. Outside one it gets no `dir` and
 * keeps the document's, so `dir="rtl"` on `<html>` alone still works.
 */
export function usePopupDir(): Direction | undefined {
  return React.useContext(ProvidedDirection);
}
