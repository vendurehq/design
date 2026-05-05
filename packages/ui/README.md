# @vendure-io/ui

React component library for Vendure, built on [shadcn/ui](https://ui.shadcn.com/) and [Tailwind CSS v4](https://tailwindcss.com/).

## Install

```bash
npm install @vendure-io/ui
```

### Peer dependencies

- `react` >= 19
- `react-dom` >= 19

Optional peers: `next`, `next-themes`, `react-hook-form`

## Usage

```tsx
import { Button } from "@vendure-io/ui/components/ui/button";
import { cn } from "@vendure-io/ui/lib/utils";
```

## Exports

| Export | Description |
|--------|-------------|
| `@vendure-io/ui/components/ui/*` | shadcn/ui primitives (button, dialog, input, etc.) |
| `@vendure-io/ui/components/custom/*` | Vendure-specific components |
| `@vendure-io/ui/lib/*` | Utilities (`cn`, etc.) |
| `@vendure-io/ui/lib/base-ui` | `@base-ui/react` primitive namespaces (see below) |
| `@vendure-io/ui/hooks/*` | Shared React hooks |

## Customizing wrapper components

The components under `components/ui/*` are thin wrappers around [`@base-ui/react`](https://base-ui.com/) primitives. To override a single subcomponent (e.g. swap `DialogTitle` for one with a different font) while re-using the rest, import the underlying primitive namespace from `@vendure-io/ui/lib/base-ui` rather than from `@base-ui/react` directly:

```tsx
// In your own dialog.tsx
import { DialogPrimitive } from "@vendure-io/ui/lib/base-ui";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
} from "@vendure-io/ui/components/ui/dialog";

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTrigger,
};

export function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("font-display text-lg", className)}
      {...props}
    />
  );
}
```

Each primitive is exposed as a TypeScript namespace, so you get both the runtime component (`<DialogPrimitive.Title />`) and its prop types (`DialogPrimitive.Title.Props`) from the same import. This means you don't need `@base-ui/react` as a direct dependency in your project — `@vendure-io/ui` is the single source of truth for both wrappers and primitives.

Available primitives include `AccordionPrimitive`, `AlertDialogPrimitive`, `AvatarPrimitive`, `ButtonPrimitive`, `CheckboxPrimitive`, `CollapsiblePrimitive`, `ComboboxPrimitive`, `ContextMenuPrimitive`, `DialogPrimitive`, `InputPrimitive`, `MenuPrimitive`, `MenubarPrimitive`, `NavigationMenuPrimitive`, `PopoverPrimitive`, `PreviewCardPrimitive`, `ProgressPrimitive`, `RadioPrimitive`, `RadioGroupPrimitive`, `ScrollAreaPrimitive`, `SelectPrimitive`, `SeparatorPrimitive`, `SliderPrimitive`, `SwitchPrimitive`, `TabsPrimitive`, `TogglePrimitive`, `ToggleGroupPrimitive`, `TooltipPrimitive`, plus the `mergeProps` and `useRender` helpers.

> Where two wrappers share the same base-ui primitive (e.g. both `dialog` and `sheet` are built on `Dialog`; both `dropdown-menu` and `menubar` on `Menu`), the primitive is exposed under its canonical base-ui name only.

## License

See [LICENSE.md](../../LICENSE.md) for details.
