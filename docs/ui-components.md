# UI Components

`@vendure-io/ui` is the React component library for Vendure. Built on shadcn/ui with Tailwind v4 and React 19+.

## Setup

`@vendure-io/ui` ships raw `.tsx` source files (no pre-compiled JS). Bundlers need to be configured to transpile the package.

### Next.js

Add `@vendure-io/ui` to `transpilePackages` in your Next.js config:

```ts
// next.config.ts
const nextConfig = {
  transpilePackages: ["@vendure-io/ui"],
};

export default nextConfig;
```

This applies to both Turbopack and Webpack modes.

## Import Pattern

Components use wildcard subpath exports — there are no barrel files. Always import from the specific component path:

```tsx
import { Button } from "@vendure-io/ui/components/atoms/button";
import { Card, CardHeader, CardTitle, CardContent } from "@vendure-io/ui/components/atoms/card";
import { Dialog, DialogTrigger, DialogContent } from "@vendure-io/ui/components/atoms/dialog";
```

Utilities and hooks follow the same pattern:

```tsx
import { cn } from "@vendure-io/ui/lib/utils";
import { useIsMobile } from "@vendure-io/ui/hooks/use-mobile";
```

## Available Components

Components are split by provenance: atoms track a shadcn upstream; molecules are
Vendure-owned compositions. Prefer a molecule when it already expresses the
behavior you need instead of rebuilding it from atoms.

### Atoms

### Layout & Structure
`accordion`, `aspect-ratio`, `card`, `collapsible`, `resizable`, `scroll-area`, `separator`, `sidebar`, `tabs`

### Forms & Inputs
`button`, `button-group`, `checkbox`, `combobox`, `field`, `input`, `input-group`, `input-otp`, `label`, `native-select`, `radio-group`, `select`, `slider`, `switch`, `textarea`, `toggle`, `toggle-group`

> **Labelling Checkbox, RadioGroup and Switch:** Base UI puts the `id` on a hidden input, not on the visible control. Because of this, `<Label htmlFor>` does not give the control an accessible name. Set `aria-label` on the control, or `aria-labelledby` with the `id` of the visible label. This note stays until a component fix lands.

### Feedback
`alert`, `alert-dialog`, `badge`, `empty`, `progress`, `skeleton`, `sonner` (toasts), `spinner`

### Overlays & Menus
`command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `hover-card`, `menubar`, `popover`, `sheet`, `tooltip`

### Navigation
`breadcrumb`, `navigation-menu`, `pagination`

### Data Display
`avatar`, `calendar`, `carousel`, `chart`, `kbd`, `table`

### Utility
`direction`, `item`

### Molecules

#### Application structure
`app-shell`, `page-header`, `skip-link`

#### Forms & selection
`combobox-free-text`, `file-dropzone`, `multi-select`, `password-input`

#### Date & number entry/display
`date-picker`, `date-time-picker`, `date-range-picker`, `date-time`, `relative-time`, `money`, `format-provider`

#### Feedback & identity
`confirm-dialog`, `state-views/*`, `status-badge`, `chip`, `id-chip`, `copyable-text`, `copy-feedback-provider`, `anonymized-token`

#### Data display
`code-block`, `data-table/*`, `description-list`, `stat-card`, `illustrations/*`

## Utilities

### `cn()` — Class Merging

Combines `clsx` and `tailwind-merge` for conflict-free class composition:

```tsx
import { cn } from "@vendure-io/ui/lib/utils";

function MyComponent({ className }: { className?: string }) {
  return <div className={cn("p-4 bg-background", className)} />;
}
```

### `state-dictionary` — state to tone mapping

`@vendure-io/ui/lib/state-dictionary` exports the `Tone` type, `defineStateEntries()` to declare a typed map from your domain states to tones and labels, `commonStates` for states every app shares, and `maxTone()` to roll several tones up to the most severe. See [StatusBadge and domain states](#statusbadge-and-domain-states) for an example.

### `base-ui` — Base UI primitives

`@vendure-io/ui/lib/base-ui` re-exports the `@base-ui/react` primitive namespaces that the atoms wrap, for example `DialogPrimitive` and `MenuPrimitive`. Use it when you override one subcomponent of an atom and need the primitive's components or types (`DialogPrimitive.Title.Props`), without a direct dependency on `@base-ui/react`.

```tsx
import { DialogPrimitive } from "@vendure-io/ui/lib/base-ui";
```

## Hooks

### `useCopy()`

Writes text to the clipboard and returns a `copied` flag that stays `true` for `timeout` ms (default 2000). `copy()` resolves `true` on success and `false` on failure. It never throws and never shows a toast.

```tsx
import { useCopy } from "@vendure-io/ui/hooks/use-copy";

function CopyOrderCode({ code }: { code: string }) {
  const { copied, copy } = useCopy();
  return <button onClick={() => copy(code)}>{copied ? "Copied" : "Copy"}</button>;
}
```

The copy molecules (`CopyableText`, `CopyButton`, `IdChip`, `AnonymizedToken`, `CodeBlock`) already use it. To show a toast after a copy, pass `onCopied` and `onCopyError` to the molecule, or mount `CopyFeedbackProvider` once in a client component. The provider is the only option when the copy surface renders from a React Server Component, which cannot pass function props:

```tsx
"use client";
import { CopyFeedbackProvider } from "@vendure-io/ui/components/molecules/copy-feedback-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopyFeedbackProvider onCopied={() => toast("Copied")} onCopyError={() => toast.error("Copy failed")}>
      {children}
    </CopyFeedbackProvider>
  );
}
```

### `useIsMobile()`

Responsive hook that returns `true` when the viewport is mobile-sized:

```tsx
import { useIsMobile } from "@vendure-io/ui/hooks/use-mobile";

function MyComponent() {
  const isMobile = useIsMobile();
  return isMobile ? <MobileView /> : <DesktopView />;
}
```

## Icons

Components use [lucide-react](https://lucide.dev/) for icons. It ships as a dependency of `@vendure-io/ui`, so you can import icons directly:

```tsx
import { Search, ChevronDown, X } from "lucide-react";
```

## Usage Examples

### Button

```tsx
import { Button } from "@vendure-io/ui/components/atoms/button";

<Button variant="default">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Edit</Button>
<Button variant="ghost">More</Button>
```

Button's `default` variant uses the neutral `primary` slot, not Vendure blue. Use it for the single primary action of a view — **one primary per view**: everything else should be `secondary`, `outline`, or `ghost`. For a deliberate identity moment, use `variant="brand"`.

### Badge

```tsx
import { Badge } from "@vendure-io/ui/components/atoms/badge";

<Badge>Neutral</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="brand">Brand</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

> **Breaking change in ui v2:** Badge's `default` variant is neutral (neutral-subtle), not solid brand. Solid brand is an explicit opt-in via `variant="brand"` and follows the same one-primary-per-view rule as Button. The `secondary` variant was removed — it was visually identical to the new neutral default; migrate `variant="secondary"` to no variant. State colors belong to `StatusBadge` and its tones, not to Badge variants.

### StatusBadge and domain states

State words render through `StatusBadge`, not a `Badge` with local color
classes. The consumer owns the domain meaning; the design system owns how each
tone looks:

```tsx
import { StatusBadge } from "@vendure-io/ui/components/molecules/status-badge";
import { defineStateEntries } from "@vendure-io/ui/lib/state-dictionary";

type DeploymentState = "QUEUED" | "DEPLOYING" | "RUNNING" | "FAILED";

const deploymentStates = defineStateEntries<DeploymentState>({
  QUEUED: { tone: "neutral", defaultLabel: "Queued" },
  DEPLOYING: { tone: "progress", defaultLabel: "Deploying" },
  RUNNING: { tone: "success", defaultLabel: "Running" },
  FAILED: { tone: "critical", defaultLabel: "Failed" },
});

<StatusBadge
  tone={deploymentStates.toneFor(deployment.status)}
>
  {deploymentStates.labelFor(deployment.status)}
</StatusBadge>;
```

Do not attach ramp colors to states. Unknown wire values deliberately fall back
to neutral and warn once in development.

### Dialog

Use `Dialog` for a reversible task or supporting content that temporarily needs
focus. Use `ConfirmDialog` for a consequential action that the user must
explicitly confirm.

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogClose,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@vendure-io/ui/components/atoms/dialog";
import { Button } from "@vendure-io/ui/components/atoms/button";

<Dialog>
  <DialogTrigger render={<Button variant="outline" />}>Edit customer</DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Edit customer</DialogTitle>
      <DialogDescription>Update the customer-facing details.</DialogDescription>
    </DialogHeader>
    {/* Form fields */}
    <DialogFooter>
      <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
      <Button>Save changes</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

```tsx
import { ConfirmDialog } from "@vendure-io/ui/components/molecules/confirm-dialog";

<ConfirmDialog
  title="Delete channel?"
  description="Products assigned only to this channel will become unavailable."
  confirmLabel="Delete channel"
  variant="destructive"
  onConfirm={deleteChannel}
>
  <Button variant="destructive">Delete channel</Button>
</ConfirmDialog>
```

### Card

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@vendure-io/ui/components/atoms/card";

<Card>
  <CardHeader>
    <CardTitle>Order Summary</CardTitle>
    <CardDescription>Review your order details</CardDescription>
  </CardHeader>
  <CardContent>
    <p>3 items in your cart</p>
  </CardContent>
</Card>
```

## Optional Peer Dependencies

These packages are optional — install them only if you use the features that need them:

| Package            | When needed |
| ------------------ | ----------- |
| `next`             | Next.js framework features |
| `next-themes`      | Dark mode toggle in Next.js (ThemeProvider) |

## Migrating from 1.x to 2.0

`@vendure-io/ui` 2.0 and `@vendure-io/design-tokens` 2.0 ship together. Upgrade both in the same change.

### Breaking changes in `@vendure-io/ui`

1. Export paths moved. `@vendure-io/ui/components/ui/*` is now `@vendure-io/ui/components/atoms/*`, and `@vendure-io/ui/components/custom/*` is now `@vendure-io/ui/components/molecules/*`. The old paths are removed.
2. Badge `default` is neutral subtle, not solid brand. Use `variant="brand"` for solid brand. `variant="secondary"` is removed: delete the prop.
3. Button `default` and every use of the `primary` slot are neutral. Use `variant="brand"` for an identity moment.
4. The look is flat. Primitives have no `shadow-xs` or `shadow-2xs`. Select and dropdown popups size to their content, not to the trigger width.
5. The `react-hook-form` peer dependency is removed.
6. `@vendure-io/design-tokens` is a peer dependency. Install it next to `@vendure-io/ui`.
7. CodeBlock no longer exports `transformCommand`, `processCode` or `matchFileTypeIcon`. The `molecules/code-block/*` files and `molecules/data-table/data-table-helpers` are not exported.
8. `ComboboxFreeText` `loading` is deprecated. Use `isLoading`. Chip `variant` no longer accepts `link` or `ghost`. CodeBlock has no outer margin: add your own.
9. Drawer is built on Base UI. Replace `asChild` on `DrawerTrigger` and `DrawerClose` with the `render` prop, as on every other atom.

### Migration steps

1. Install `@vendure-io/design-tokens@^2.0.0` and `@vendure-io/ui@^2.0.0`.
2. Replace `@vendure-io/ui/components/ui/` with `@vendure-io/ui/components/atoms/` and `@vendure-io/ui/components/custom/` with `@vendure-io/ui/components/molecules/`. A search and replace is enough. For Dashboard extensions, the `@vendure/cli` `dashboard-ui` codemod rewrites the imports.
3. In your Tailwind entry CSS, import `@vendure-io/design-tokens/css/theme` and `@vendure-io/design-tokens/css/fonts`, and add `@source` for `@vendure-io/ui/src` relative to that CSS file. See [Getting Started](./getting-started.md#css-setup).
4. Transpile `@vendure-io/ui`. In Next.js, add it to `transpilePackages`.
5. Find `variant="secondary"` on Badge and remove it. Check every Badge without a variant: it is now neutral.
6. Find code that uses `primary`, `ring` or `accent` to mean Vendure blue. Change it to `brand` where you want the identity color.
7. Change `DrawerTrigger asChild` and `DrawerClose asChild` to `render`.
8. Run `@vendure-io/design-lint` 1.0 (ESLint or Biome) to find raw colors. See [Getting Started](./getting-started.md#lint-for-raw-colors).
9. Update the agent skills: `npx skills update --global vendure-ui vendure-tokens`.

The token value changes (neutral `primary`, the new surface ramp, `--radius`, fonts no longer loaded by `css/theme`) are in [Design Tokens](./design-tokens.md).
