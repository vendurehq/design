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

### Layout & Structure
`accordion`, `aspect-ratio`, `card`, `collapsible`, `resizable`, `scroll-area`, `separator`, `sidebar`, `tabs`

### Forms & Inputs
`button`, `button-group`, `checkbox`, `combobox`, `field`, `input`, `input-group`, `input-otp`, `label`, `native-select`, `radio-group`, `select`, `slider`, `switch`, `textarea`, `toggle`, `toggle-group`

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

## Utilities

### `cn()` — Class Merging

Combines `clsx` and `tailwind-merge` for conflict-free class composition:

```tsx
import { cn } from "@vendure-io/ui/lib/utils";

function MyComponent({ className }: { className?: string }) {
  return <div className={cn("p-4 bg-background", className)} />;
}
```

### `slugify()` and `hashString()`

String utilities available from the same path:

```tsx
import { slugify, hashString } from "@vendure-io/ui/lib/utils";
```

## Hooks

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

Button's `default` variant is solid brand (primary). Use it for the single primary action of a view — **one primary per view**: everything else should be `secondary`, `outline`, or `ghost`.

### Badge

```tsx
import { Badge } from "@vendure-io/ui/components/atoms/badge";

<Badge>Neutral</Badge>
<Badge variant="primary">Primary</Badge>
<Badge variant="brand">Brand</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

> **Breaking change in ui v2:** Badge's `default` variant is neutral (neutral-subtle), not solid brand. Solid brand is an explicit opt-in via `variant="brand"` and follows the same one-primary-per-view rule as Button. The `secondary` variant was removed — it was visually identical to the new neutral default; migrate `variant="secondary"` to no variant. Status colors belong to the intent variants, not brand.

### Dialog

```tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@vendure-io/ui/components/atoms/dialog";
import { Button } from "@vendure-io/ui/components/atoms/button";

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm Action</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
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
| `react-hook-form`  | Form validation and state management |
