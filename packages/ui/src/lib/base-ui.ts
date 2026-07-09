/**
 * Re-exports of `@base-ui/react` primitive namespaces.
 *
 * Why this exists: the wrapper components in `@vendure-io/ui/components/atoms/*`
 * are intentionally thin layers over `@base-ui/react` primitives. Consumers
 * (notably `@vendure/dashboard`) often need to override a single subcomponent
 * — e.g. swap `DialogTitle` for one that uses a different font — while
 * re-exporting the rest of the wrapper. To do that they need access to the
 * underlying primitive's types and components (e.g. `Dialog.Title.Props`).
 *
 * Exposing the primitives here means consumers can drop `@base-ui/react` as
 * a direct dependency entirely — `@vendure-io/ui` becomes the single source
 * of truth for both the wrapper and the primitive substrate.
 *
 * Each primitive is a TS namespace, so both values (`<DialogPrimitive.Title />`)
 * and types (`DialogPrimitive.Title.Props`) are available from the same
 * import.
 *
 * Where two wrapper files share a base-ui primitive (e.g. `Dialog` is used
 * by both `dialog.tsx` and `sheet.tsx`; `Menu` by `dropdown-menu.tsx` and
 * `menubar.tsx`), we expose the canonical base-ui name only — they resolve
 * to the same underlying type.
 */

export { Accordion as AccordionPrimitive } from '@base-ui/react/accordion';
export { AlertDialog as AlertDialogPrimitive } from '@base-ui/react/alert-dialog';
export { Autocomplete as AutocompletePrimitive } from '@base-ui/react/autocomplete';
export { Avatar as AvatarPrimitive } from '@base-ui/react/avatar';
export { Button as ButtonPrimitive } from '@base-ui/react/button';
export { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox';
export { Collapsible as CollapsiblePrimitive } from '@base-ui/react/collapsible';
export { Combobox as ComboboxPrimitive } from '@base-ui/react/combobox';
export { ContextMenu as ContextMenuPrimitive } from '@base-ui/react/context-menu';
export { Dialog as DialogPrimitive } from '@base-ui/react/dialog';
// Standalone escape hatch: the Input atom renders a plain <input> and no longer builds on this primitive; kept for consumer compat.
export { Input as InputPrimitive } from '@base-ui/react/input';
export { Menu as MenuPrimitive } from '@base-ui/react/menu';
export { Menubar as MenubarPrimitive } from '@base-ui/react/menubar';
export { mergeProps } from '@base-ui/react/merge-props';
export { NavigationMenu as NavigationMenuPrimitive } from '@base-ui/react/navigation-menu';
export { Popover as PopoverPrimitive } from '@base-ui/react/popover';
export { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card';
export { Progress as ProgressPrimitive } from '@base-ui/react/progress';
export { Radio as RadioPrimitive } from '@base-ui/react/radio';
export { RadioGroup as RadioGroupPrimitive } from '@base-ui/react/radio-group';
export { ScrollArea as ScrollAreaPrimitive } from '@base-ui/react/scroll-area';
export { Select as SelectPrimitive } from '@base-ui/react/select';
export { Separator as SeparatorPrimitive } from '@base-ui/react/separator';
export { Slider as SliderPrimitive } from '@base-ui/react/slider';
export { Switch as SwitchPrimitive } from '@base-ui/react/switch';
export { Tabs as TabsPrimitive } from '@base-ui/react/tabs';
export { Toggle as TogglePrimitive } from '@base-ui/react/toggle';
export { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group';
export { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip';
export { useRender } from '@base-ui/react/use-render';
