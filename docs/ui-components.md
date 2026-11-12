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

## Right-to-left

Switch a page to right-to-left in two places:

1. Set `dir="rtl"` on `<html>`, or on the element that wraps the right-to-left region. The page's own layout and the `rtl:` variants follow it.
2. Wrap the same region in `DirectionProvider` from `@vendure-io/ui/components/atoms/direction`. Keyboard navigation, popup sides and `start`/`end` alignment follow it.

```tsx
import { DirectionProvider } from "@vendure-io/ui/components/atoms/direction";

document.documentElement.setAttribute("dir", "rtl");

<DirectionProvider direction="rtl">
  <App />
</DirectionProvider>;
```

Popups (menus, selects, popovers, tooltips, comboboxes, hover cards) render in a portal at the end of the body. Inside a `DirectionProvider` they take the provider's direction, also when the document has another one. Use this provider, not the one from `@base-ui/react`: only this one passes the direction to the portalled popups.

Dialog, AlertDialog, Sheet and Drawer render in a portal too and take the provider's direction the same way. A Sheet or Drawer keeps the side you give it (`side="right"`, `swipeDirection`): the sides are physical and do not mirror in right-to-left. Pick the side for the language. The Sheet's close button sits at the end of the line, so it moves to the left in right-to-left.

## Available Components

Components are split by provenance: atoms track a shadcn upstream; molecules are
Vendure-owned compositions. Prefer a molecule when it already expresses the
behavior you need instead of rebuilding it from atoms.

### Atoms

### Layout & Structure
`accordion`, `aspect-ratio`, `card`, `collapsible`, `resizable`, `scroll-area`, `separator`, `sidebar`, `tabs`

### Forms & Inputs
`button`, `button-group`, `checkbox`, `combobox`, `field`, `input`, `input-group`, `input-otp`, `label`, `native-select`, `radio-group`, `select`, `slider`, `switch`, `textarea`, `toggle`, `toggle-group`

> **Toggle.** A disabled toggle that must say why takes `aria-disabled` in place of `disabled`, with a Tooltip that gives the reason. It keeps its tab stop and the pointer, so the tooltip opens. It looks like a disabled toggle, pressed or not: half opacity, a not-allowed cursor, no hover change. Base UI's Toggle has no `focusableWhenDisabled`, so blocking the press is your job: `onPressedChange={(_, details) => details.cancel()}`. That also stops a ToggleGroup from changing its value. Use plain `disabled` when the page already shows why.

> **Labelling Checkbox, RadioGroup and Switch:** Base UI puts the `id` on a hidden input, not on the visible control. Because of this, `<Label htmlFor>` does not give the control an accessible name. Set `aria-label` on the control, or `aria-labelledby` with the `id` of the visible label. This note stays until a component fix lands.

### Feedback
`alert`, `alert-dialog`, `badge`, `empty`, `progress`, `skeleton`, `sonner` (toasts), `spinner`

### Overlays & Menus
`command`, `context-menu`, `dialog`, `drawer`, `dropdown-menu`, `hover-card`, `menubar`, `popover`, `sheet`, `tooltip`

> **Drawer.** The Drawer is built on the Base UI drawer, like every other overlay. Compose its parts with the `render` prop (`<DrawerTrigger render={<Button />}>`); there is no `asChild`. Set the side with `swipeDirection` (`down` by default, or `up`, `left`, `right`), and show the drag handle with `showSwipeHandle`. Add `body { position: relative; }` to your global styles so the overlay covers the viewport on iOS Safari. Coming from 1.x or an earlier 2.0.0 beta: replace `asChild` with `render`, replace `direction` with `swipeDirection` (`top` is `up`, `bottom` is `down`), and add `showSwipeHandle` where you want the handle.

> **Triggers and `data-slot`.** A trigger (`TooltipTrigger`, `PopoverTrigger`, `HoverCardTrigger`, `DropdownMenuTrigger`, `DialogTrigger`, `AlertDialogTrigger`, `SheetTrigger`, `DrawerTrigger`, `CollapsibleTrigger`, `ContextMenuTrigger`) always marks its element with `data-<slot>`, for example `data-tooltip-trigger`. It sets `data-slot="<slot>"` only when it renders a plain element: no `render`, a render function, or an HTML element such as `<span>`. A component passed as `render` keeps its own slot: `<TooltipTrigger render={<Button />}>` renders `data-slot="button"` and `data-tooltip-trigger`. Select a trigger by `[data-tooltip-trigger]`, not by `[data-slot=tooltip-trigger]`.

### Navigation
`breadcrumb`, `navigation-menu`, `pagination`

> **Breadcrumb menu.** `BreadcrumbMenu` is a crumb that switches the current item, such as the environment at the start of a breadcrumb. Pass the `options` (`value`, `label`, an optional `leading` status dot and `detail`), the current `value`, `onValueChange` and a `label` that names the list. The menu opens toward the centre of the screen and stays open after a pick. Extra items, such as "Add environment", go in `children`. The data and the switch stay in your app.

### Data Display
`avatar`, `calendar`, `carousel`, `chart`, `kbd`, `table`

### Utility
`direction`, `item`

### Molecules

#### Application structure
`app-shell`, `page-header`, `skip-link`, `arrow-link`, `search-trigger`

> **SearchTrigger.** The search field at the end of the top bar: a button that looks like a 28px field, with a search icon, the word "Search" and the shortcut (⌘K on Apple platforms, Ctrl K elsewhere). Its accessible name is "Search (command palette)", and it announces a dialog. It only shows the shortcut: open the palette in `onClick` and bind the same key yourself. `shortcutKey` sets the letter (`null` for none). `collapse` shrinks it to an icon button: below 768px by default (`md`), `never` or `always`.
>
> ```tsx
> <AppShellHeader>
>   …
>   <div className="ml-auto flex items-center gap-1">
>     <SearchTrigger onClick={() => setPaletteOpen(true)} />
>   </div>
> </AppShellHeader>
> ```

#### Forms & selection
`combobox-free-text`, `file-dropzone`, `multi-select`, `password-input`

> **VisibilityIcon.** An eye for a show/hide toggle: `<VisibilityIcon visible={isVisible} />`. When `visible` turns false a line draws across the eye and cuts it; when it turns true the line draws back out. It does not animate on first render, and with reduced motion the change is instant. It sizes and colours like a lucide icon. It is decorative, so label the button or menu item that holds it. An `opacity-*` class on it (to dim a hidden state) fades on the line's timing. PasswordInput and SecretValue use it.

#### Date & number entry/display
`date-picker`, `date-time-picker`, `date-range-picker`, `date-time`, `relative-time`, `elapsed-time`, `money`, `format-provider`

#### Feedback & identity
`confirm-dialog`, `state-views/*`, `status-badge`, `live-indicator`, `chip`, `id-chip`, `copyable-text`, `copy-feedback-provider`, `anonymized-token`

#### Data display
`code-block`, `data-table/*`, `list-row`, `timeline`, `collapsible-section`, `description-list`, `stat-card`, `illustrations/*`

> **Timeline.** A feed of events about one thing, newest first, on one rail: `<Timeline><TimelineItem><TimelineMarker tone="warning" /><TimelineContent><TimelineTitle>The server restarted.</TimelineTitle><TimelineMeta><RelativeTime value={at} /></TimelineMeta></TimelineContent></TimelineItem></Timeline>`. A TimelineMarker with children (an icon) replaces the 8px dot. TimelineDetail holds a note or an amount under the meta line. TimelineLink makes the whole entry open a page. For days, put a TimelineGroupHeading before each day's Timeline. An entry added while the page is open takes `enter="new"`.

> **Timeline.** A feed of events about one thing, newest first, on one rail: `<Timeline><TimelineItem><TimelineMarker tone="warning" /><TimelineContent><TimelineTitle>The server restarted.</TimelineTitle><TimelineMeta><RelativeTime value={at} /></TimelineMeta></TimelineContent></TimelineItem></Timeline>`. A TimelineMarker with children (an icon) replaces the 8px dot. TimelineDetail holds a note or an amount under the meta line. TimelineLink makes the whole entry open a page. For days, put a TimelineGroupHeading before each day's Timeline. An entry added while the page is open takes `enter="new"`.

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

`@vendure-io/ui` 2.0 requires `@base-ui/react` `^1.8.0`. If your app also depends on `@base-ui/react` directly, set it to `^1.8.0` too. Then the package manager installs one copy, and the primitive types match the types that the atoms use.

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
<Button variant="destructive-outline">Tear down…</Button>
<Button variant="outline">Edit</Button>
<Button variant="ghost">More</Button>
```

Button's `default` variant uses the neutral `primary` slot, not Vendure blue. Use it for the single primary action of a view — **one primary per view**: everything else should be `secondary`, `outline`, or `ghost`. For a deliberate identity moment, use `variant="brand"`.

Destructive actions come in two weights. On the page, use the quiet `variant="destructive-outline"`: the outline button with a red label and icon, and a red tint on hover and press. A danger zone that is always on screen stays calm, and a disabled one does not read as an alarm. In the confirm, use the solid `variant="destructive"`: it is the press that does the damage.

A disabled button that must say why takes `disabled` with `focusableWhenDisabled` and a Tooltip that gives the reason. Base UI then renders `aria-disabled="true"` instead of the native attribute: the button keeps its tab stop and the pointer, so the tooltip opens, and it ignores the click and every key but Tab. It looks like a native disabled button in every variant: half opacity, no shadow, a not-allowed cursor, no hover or press change. A raw `aria-disabled="true"` gets the same look; ignoring the click is then up to you. Use plain `disabled` when the page already shows why.

The small icon sizes `icon-xs` (24px) and `icon-sm` (28px) have a 40 × 40px click area around the icon. It is an invisible `::before`, so the button keeps its visible size. Next to another control the area keeps the button's own width, so neighbours never share a point. Inside an InputGroup and in the copy chips it is off. Do not give these buttons a `::before` of your own. Keep a positioned scroll container at least 8px from such a button, or the area adds to the scroll width.

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
to neutral and warn once in development. `labelFor` then shows the state name in
sentence case words: `ValidatingCustomer` reads "Validating customer".

An entry can carry an `icon` when its shape says more than the tone's own icon.
`iconFor` returns it, or `undefined` for the tone's icon:

```tsx
const orderStates = defineStateEntries<OrderState>({
  Shipped: { tone: "neutral", defaultLabel: "Shipped", icon: <TruckIcon /> },
  Delivered: { tone: "success", defaultLabel: "Delivered" },
  // …
});

<StatusBadge
  appearance="icon"
  tone={orderStates.toneFor(order.state)}
  icon={orderStates.iconFor(order.state)}
>
  {orderStates.labelFor(order.state)}
</StatusBadge>;
```

`StatusBadge` renders as a chip by default, with the tone's own icon in front
of the label (`progress` spins). A status that every row of a table shows uses
`appearance="icon"`: the tone icon with no box and a neutral label. Use
`appearance="dot"` only where no word fits (the label stays as screen-reader
text). `size="lg"` is the 28px chip for a page header.

In a table, a chip marks only the exception: use one where the normal state is
far more common and shows nothing (a disabled product in a products list).
Never use plain coloured text for a status, and never put a chip in the first
or the last column.

In the icon-and-label form the icon keeps its tone colour for every state,
green for success included. The label stays neutral. Give each group of
states its own icon shape (pass `icon` for a state whose shape says more), so
the column reads without colour.

`progress` and its spinner are only for work that runs right now and ends in
seconds or minutes: a build, a deploy. A state that lasts hours or days, such
as a shipped order, gets a still icon and a neutral tone:

```tsx
<StatusBadge appearance="icon" tone="neutral" icon={<TruckIcon />}>
  Shipped
</StatusBadge>
```

`LiveIndicator` is the mark for a state that stays on: a live log stream, a
service that runs right now. It is a 7px tone dot (success by default) with a
soft ring that grows out of it and fades every 2.4s. Under reduced motion only
the dot shows. The `progress` spinner stays for work that ends; the dot means
"live":

```tsx
import { LiveIndicator } from "@vendure-io/ui/components/molecules/live-indicator";

<LiveIndicator>Streaming</LiveIndicator>; // a visible label; the dot is hidden from screen readers
<LiveIndicator label="Live" />; // the dot alone, with screen-reader text
<LiveIndicator tone="info" pulse={false}>Streaming</LiveIndicator>; // still, beside a spinner
```

Leave out both `label` and `children` when the text next to the indicator
already says the same: the indicator is then hidden from assistive technology.

`detail` adds a second line under the label of `appearance="icon"`, with the
one time that matters for the state. In a `DataTable` the row is 46px.

```tsx
<StatusBadge appearance="icon" tone="progress" detail={<ElapsedTime since={deployment.startedAt} tooltip />}>
  Building
</StatusBadge>;
<StatusBadge
  appearance="icon"
  tone="success"
  detail={<RelativeTime value={deployment.finishedAt} start={deployment.startedAt} />}
>
  Ready
</StatusBadge>;
<StatusBadge
  appearance="icon"
  tone="warning"
  detail={<>for <RelativeTime value={deployment.degradedSince} display="duration" /></>}
>
  Degraded
</StatusBadge>;
```

`ElapsedTime` counts up every second with tabular digits, and stops while it is
off screen or the tab is hidden. It writes the count in the locale of the
`FormatProvider` (`1m 15s` in English, `1 Min., 15 Sek.` in German), with the
smaller unit zero-padded so the width holds while it counts. With `tooltip`, its tooltip shows when the
count started. `RelativeTime` with `start` shows the range and how long it
took; with `display="duration"` it says how long a state has lasted
(`13 days`), in the reader's locale and with the same unit steps as
`2 minutes ago`. The words around it (`for`) are yours, so they are translated
with the rest of the page. Pass content to `tooltip` on either to show
something else. Don't wrap them in a `Tooltip`.

Under the label each time is a tab stop, and its tooltip opens at the end of
the status block, centred on it. It covers only the cells after the status in
its own row, so the label, the time and the rows above and below stay readable.

- `icon={<Icon />}` replaces the tone icon with a more exact shape. Never put
  an icon in `children`.
- `dot` shows a dot in place of the icon, for a group of chips that is not a
  column.
- `icon={false}` or `icon={null}` shows no icon, for an inline chip whose label
  already names the tone. `progress` keeps its spinner and `dot` keeps the dot.
- To explain a state on hover, render the badge as the tooltip trigger:
  `<TooltipTrigger render={<StatusBadge tone="warning">Degraded</StatusBadge>} />`.
  The badge becomes a tab stop with the focus ring, and a chip takes the hover
  fill.

### Illustrations

Each illustration is its own file under `illustrations/*`. Pass one as
`illustration` to `EmptyState` or `ErrorState`. Without it, `EmptyState` shows
`EmptyCollectionIllustration` and `ErrorState` shows `ErrorIllustration`.

```tsx
import { EmptyState } from "@vendure-io/ui/components/molecules/state-views/empty-state";
import { NoInvoicesIllustration } from "@vendure-io/ui/components/molecules/illustrations/no-invoices";

<EmptyState
  illustration={<NoInvoicesIllustration />}
  title="No invoices yet"
  description="Invoices appear here after the first billing period."
/>;
```

Every illustration takes `className` and `size` (width in px, default 160; the
height keeps the 4:3 ratio). Use one illustration for the whole empty or error
region: a whole page or a whole list. Inside a card, a secondary panel or a
side column, use the compact size with an icon instead. It shows a faint 28px
icon above the title and no illustration:

```tsx
import { KeyRoundIcon } from "lucide-react";

<EmptyState
  size="compact"
  icon={<KeyRoundIcon />}
  title="No emergency boot token was issued for this project."
/>;
```

| Illustration | Use it for | Not for |
| --- | --- | --- |
| `NoResultsIllustration` | A search or filter matched nothing | A list that is empty before any filter |
| `EmptyCollectionIllustration` | Nothing exists yet, when no scenario illustration fits | A list that has a scenario illustration below |
| `NoOrdersIllustration` | No orders yet | Orders filtered to zero (`NoResults`) |
| `NoProductsIllustration` | An empty catalog: products, variants, collection contents | Promotions (`NoPromotions`) |
| `NoPromotionsIllustration` | No promotions, discounts or coupon codes | An empty catalog (`NoProducts`) |
| `NoCustomersIllustration` | No customers in a list or customer group | Team members (`NoMembers`) |
| `NoProjectsIllustration` | An empty project list, for example all archived | The first "create your first project" moment (`FirstRun`) |
| `FirstRunIllustration` | A feature that has never been set up | An ordinary empty list |
| `EmptyMediaIllustration` | An empty media or asset library | A drop target (`UploadDropzone`) |
| `UploadDropzoneIllustration` | An empty drag-and-drop upload target | An empty media library (`EmptyMedia`) |
| `NoMembersIllustration` | No team members or administrators | Customers (`NoCustomers`) |
| `NoKeysIllustration` | No API keys or access tokens | A permission failure (`AccessDenied`) |
| `NoDocumentsIllustration` | No licenses or certificates issued | Invoices (`NoInvoices`) |
| `NoInvoicesIllustration` | No invoices or receipts | A failed payment (`PaymentFailed`) |
| `NoSubscriptionIllustration` | No plan or subscription | A trial that ended (`Expired`) |
| `NoPluginsIllustration` | No plugins, extensions or packages installed | No plan that grants packages (`NoSubscription`) |
| `NoActivityIllustration` | An empty audit log, history or timeline | Output from a running process (`NoLogs`) |
| `NoLogsIllustration` | An empty log stream | An activity history (`NoActivity`) |
| `NoNotificationsIllustration` | No new notifications or alerts | A finished task (`Success`) |
| `NoDeploymentsIllustration` | An environment never deployed or bound to a runtime | A failed deploy (`Error`) |
| `EmptyDatabaseIllustration` | No database or backups | A generic empty list (`EmptyCollection`) |
| `SuccessIllustration` | A finished task, or a queue with nothing left to do | No new notifications (`NoNotifications`) |
| `PendingApprovalIllustration` | An invitation or account awaiting approval | A request that expired (`Expired`) |
| `ExpiredIllustration` | A trial, evaluation, link or sign-in request that ran out of time | A request still waiting (`PendingApproval`) |
| `PaymentFailedIllustration` | A failed charge, past-due invoice or canceled checkout | No plan at all (`NoSubscription`) |
| `ErrorIllustration` | A generic failure (the `ErrorState` default) | Network loss, 404 or 403 |
| `NotFoundIllustration` | A 404 or missing resource, with a "Go back" action | A search with no matches (`NoResults`) |
| `AccessDeniedIllustration` | A 403 or permission failure, with a "Go back" action | Access awaiting approval (`PendingApproval`) |
| `OfflineIllustration` | A network or connectivity failure | A server-side failure (`Error`) |

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

The dialog has no ✕ by default. Cancel, Escape and a click on the backdrop
close it. Pass `showCloseButton` to `DialogContent` when the dialog has no
Cancel button. `DialogTitle` takes an `icon`, drawn at 18px before the title in
the foreground at 60%, and a `tone` to colour it for a state.

A dialog is at most the viewport height less 1rem above and below. A taller
dialog scrolls inside: `DialogHeader` sticks to the top and `DialogFooter` to
the bottom, so the title, the ✕ and the actions stay in view. They stick also
when they sit inside a `<form>` that wraps the fields. Do not add a
`max-h-[90vh] overflow-y-auto` cap of your own. `AlertDialog` (and so
`ConfirmDialog`) and `Sheet` work the same way with their header and footer.

A field that gets focus, by Tab, by a script or by form validation, scrolls
fully into view, clear of the pinned header and footer. The header and the
footer measure their own height, so this holds when the title wraps or the
footer buttons stack. It needs the `DialogHeader` and `DialogFooter`
components (or the `AlertDialog` and `Sheet` ones). A header or footer of your
own `div` does not get it.

The padding of `DialogContent` and `AlertDialogContent` is the
`--dialog-padding` variable, 20px by default. The pinned header and footer
reach over that padding, so they span the full width of the dialog. For a
dialog with another padding, set the variable, not a `p-*` class:

```tsx
{/* No padding: the header, the body and the footer set their own. */}
<DialogContent className="[--dialog-padding:0px]">
  <DialogHeader className="px-6 pt-6">…</DialogHeader>
  …
  <DialogFooter className="px-6 pb-6">…</DialogFooter>
</DialogContent>

{/* 32px all round. */}
<DialogContent className="[--dialog-padding:--spacing(8)]">…</DialogContent>
```

A `p-0` (or any `p-*`) on `DialogContent` changes the padding but not the
header and footer offsets. They then sit 20px outside the dialog's edges.
`SheetContent` has no padding of its own. Its header and footer bring their
own 16px; pad the body, not `SheetContent`.

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

For a card whose body is a list, put a `CardCount` in the title and the rows in `CardRows`. The count is muted; give it `tone="critical"` for failures or `tone="warning"` for rows that wait on the user, and the card stays neutral. Each `CardRow` draws its own top border and runs edge to edge, so the header needs no `border-b`. A `CardFooter` after the rows carries `border-t`.

```tsx
<Card>
  <CardHeader>
    <CardTitle>
      Deployments <CardCount>3</CardCount>
    </CardTitle>
    <CardAction>
      <Button variant="outline" size="sm">View all</Button>
    </CardAction>
  </CardHeader>
  <CardRows>
    <CardRow>Add the gift card checkout step</CardRow>
    <CardRow>Fix the tax zone fallback</CardRow>
  </CardRows>
</Card>
```

`variant="accent"` marks the one card that holds the live subject of the page, such as the deployment that is building: a border tinted toward the brand and a faint brand wash that fades out down the card. Use it on at most one card per view. Show state inside it with `StatusBadge appearance="bare"`, not a chip.

```tsx
<Card variant="accent">
  <CardHeader>
    <CardTitle>Current deployment</CardTitle>
    <CardAction>
      <StatusBadge tone="progress" appearance="bare">Building</StatusBadge>
    </CardAction>
  </CardHeader>
</Card>
```

### ArrowLink

`ArrowLink` goes to a page with more of what the user is looking at: "View details", "All deployments". It renders an `<a>`; pass `render` with a router link. It is navigation only: an action is a `Button`.

A card or row that opens the same page drives the link's hover and takes its click. Give the parent `group/arrow-link relative` and the link `after:absolute after:inset-0`:

```tsx
<Card className="group/arrow-link relative">
  <CardContent className="flex items-center justify-between gap-4">
    <span>Add a payment handler to checkout</span>
    <ArrowLink render={<Link to="/payment-handlers" />} className="after:absolute after:inset-0">
      View details
    </ArrowLink>
  </CardContent>
</Card>
```

- The link's `::after` covers the parent, so a click anywhere on it follows the link. Pointing anywhere on it brightens the link and moves its chevron.
- Keep the link itself unpositioned: a `relative` link becomes the containing block of its `::after`, which then shrinks to the link.
- Keyboard focus shows the same emphasis as hover, with the focus ring 2px outside the link.

### DataTable loading rows

While `isLoading` is set and `rows` is empty, DataTable renders `skeletonRowCount` skeleton rows. Each cell gets one `DataTableSkeletonLine`, a placeholder exactly one text line tall, so columns of one-line cells (text, Money) need nothing. When a column's cells are taller than one line, pass `skeletonCells` for that column so the loading rows keep the loaded row height. Stack one `DataTableSkeletonLine` per text line, sized like the text it stands in for:

```tsx
import {
  DataTable,
  DataTableSkeletonLine,
} from "@vendure-io/ui/components/molecules/data-table/data-table";

<DataTable
  rows={data?.items ?? []}
  columns={columns}
  isLoading={isPending}
  skeletonCells={{
    // A title over a muted text-xs sub-line.
    customer: (
      <div className="flex flex-col">
        <DataTableSkeletonLine className="w-36" />
        <DataTableSkeletonLine className="w-20 text-xs" />
      </div>
    ),
  }}
/>
```

- Keys are column ids: the column's `id`, else its `accessorKey` with `.` replaced by `_` (`customer.name` becomes `customer_name`). Keys that match no column log a warning in development.
- A missing or `undefined` entry renders the default line. `null` renders an empty cell.
- The generated actions column (key `actions`) defaults to an icon-button-sized block and can be overridden. The generated select cell is always empty, because its checkbox is hidden until hover.

### DataTable bulk actions

`bulkActions` renders the bar that replaces the controls while rows are selected. It takes the controls row's height; a table without a controls row shows it over the column header row. The table does not move either way, so keep the bar to one line of controls no taller than `h-8`. Its context describes the selection:

```tsx
<DataTable
  rowSelection={{ value: selection, onChange: setSelection }}
  bulkActions={({ selectedCount, selectedRowIds, missingRowIds, selection, clearSelection }) => (
    <>
      <span>{selectedCount} selected</span>
      <Button onClick={() => archive(selectedRowIds)}>Archive</Button>
    </>
  )}
/>
```

- `selectedRowIds` is the id of every selected row, on this page, on other pages and restored from storage. Act on these. `selectedCount` is their count: show it as the count in the bar.
- `selection` holds the row objects the table has loaded. Use it to display rows. It can be shorter than `selectedRowIds`: the selection spans pages, it can be restored before its rows load, and a stored id can name a row that no longer exists.
- `missingRowIds` are the ids with no row object in `selection`. Empty means `selection` has every row. When it is not empty, an action that needs row data loads those rows or tells the user. It does not run on fewer rows than `selectedCount` says.

### DataTable selection storage

`selectionStorageKey` keeps the row selection in session storage, so it survives a reload and a visit to another page in the same tab. It needs `rowSelection`.

```tsx
<DataTable
  rows={rows}
  columns={columns}
  getRowId={(row) => row.id}
  selectionStorageKey={`${route}:${channelId}`}
  rowSelection={{ value: selection, onChange: setSelection }}
/>
```

- On its first load the table restores the stored ids and reports them through `rowSelection.onChange`. A controlled consumer takes them there. Nothing stored leaves the selection as you set it.
- Every change is stored, with the ids of rows on other pages: a selection can span pages. An empty selection removes the entry.
- A new key switches to the selection stored under it, or to none. Nothing from the old key carries over, and the switch itself stores nothing.
- No navigation and no request. Blocked or full storage is ignored: the selection then lasts until the table unmounts.
- Put the list and anything that scopes its rows in the key: the route, and a channel or project. Two lists with the same key share one selection.
- See "DataTable bulk actions" for what an action receives when the selection spans pages.
- Without the prop nothing changes.

### DataTable custom rows

`renderRow` replaces the row the table renders. Select all and clear all ripple down the rows, each row starting a little after the one above, and a row you render yourself joins that ripple when it takes `ctx.ripple`:

```tsx
<DataTable
  rows={rows}
  columns={columns}
  renderRow={(row, { ripple, cellProps, selectProps }) => (
    <SortableRow
      {...selectProps}
      row={row}
      className={cn("group/row", ripple.className)}
      style={{ ...ripple.style, transform, transition }}
      cellProps={cellProps}
    />
  )}
/>
```

Inside the row, each cell takes its attributes from the table:

```tsx
{row.getVisibleCells().map((cell) => (
  <TableCell key={cell.id} {...cellProps(cell.column.id)}>
    {flexRender(cell.column.columnDef.cell, cell.getContext())}
  </TableCell>
))}
```

- `ctx.ripple.className` goes into your row's `className`. `ctx.ripple.style` is spread before your own `style`. It holds only the custom properties `--ripple-at` and `--ripple-span`, so an inline `transform`, `transition` or `opacity` (a drag) never collides with it.
- Set `data-state="selected"` on the row while it is selected, as the built-in rows do. The row must be a `TableRow` (or carry its classes) so the selection bar exists.
- `ctx.cellProps(columnId)` returns what a built-in cell of that column carries: `className` (the zero-width select cell `relative w-0 p-0 pl-0!`, the leading cell's checkbox gutter, the content inset), `style` (the column indent) and the `data-column-id` and `data-content-inset-cell` attributes. Spread it on the `TableCell`, and merge your own classes with `cn`. Do not copy the classes: when the table changes them, your rows follow.
- `ctx.selectProps` gives the row click-to-select: spread it on the `<tr>`, before your own handlers. While rows are selected a click on the row then selects it, a click on the name opens the item, Shift+click extends the selection and row controls keep their own action, as on a built-in row. A press that starts on a row control (a drag handle with `role="button"`, or `data-table-row-control`) or moves more than 4px before release never selects, so a drag never does. Without it, the row's link keeps covering the row while rows are selected.
- A row that ignores `ctx.ripple` still works. It changes at once, while the rows around it ripple.
- Returning `ctx.defaultRow` needs nothing: it already has the ripple. Reduced motion: no ripple.

### DataTable row links

A row that opens a detail page opens it from any point of the row. Wrap the item name in `DataTableRowLink`. It renders an `<a>`; pass `href`, or `render` with a router link:

```tsx
import { Link } from "@tanstack/react-router";
import { DataTableRowLink } from "@vendure-io/ui/components/molecules/data-table/data-table";

const columns: ColumnDef<Variant>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <DataTableRowLink render={<Link to={`./${row.original.id}`} />}>
        {row.original.name}
      </DataTableRowLink>
    ),
  },
  // ...
];
```

- The link's `::after` covers the row. The row has one tab stop, named by the link text, and keyboard focus draws an inset ring around the row.
- A chevron appears at the end of the row while it is hovered or holds keyboard focus. It fades in and slides 3px toward the end; under reduced motion it only fades. Do not add a chevron after the name.
- While rows are selected, a click on the row selects it, and only the name opens the item. The link stops covering the row. Hovering the row shows a small chevron after the name; hovering or focusing the name turns it and the chevron `brand-text` blue, and the chevron moves 2px toward the end. The chevron takes no space, so the name and the column do not move. The name stays a tab stop and a link; Enter opens it, and Shift+click on it extends the selection. `DataTableRowLink` does this itself: it is the one way to mark the cell that opens the item. A row you render through `renderRow` does the same when it spreads `ctx.selectProps`; without it, its link keeps covering the row.
- A link with no visible text (its children are `sr-only`, as when the cell shows the item's code as a copy chip) has no name to click. While rows are selected its target is the chevron at the end of the row: the link covers the row-end chevron slot, the full row height. The chevron shows on row hover and turns `brand-text` blue on the target's hover or focus, and the focus ring goes around the slot. A click anywhere else on the row still selects it.
- Buttons, links, inputs, Tooltip triggers, the select checkbox and the copy chips (`IdChip`, `AnonymizedToken`, `CopyableText`) stay above the link and keep their own action. Mark any other control with `data-table-row-control`.
- When the row's name is also its lookup key (an order code), put the key in the link as `sr-only` text and show it beside the link as `<IdChip reveal="row" truncate="none">`. The row keeps one link named by the key; a click on the chip copies, a click anywhere else opens the item.
- Only the first `DataTableRowLink` of a row stretches. One in a later cell (a variant's Product) is a plain link above it.
- Do not render it as a `Button`: a pressed button scales, which makes it the containing block of its `::after`, and the click misses the link.

## Optional Peer Dependencies

These packages are optional — install them only if you use the features that need them:

| Package            | When needed |
| ------------------ | ----------- |
| `next`             | Next.js framework features |
| `next-themes`      | Dark mode toggle in Next.js (ThemeProvider) |

## Migrating from 2.x to 3.0

### Breaking changes in `@vendure-io/ui`

1. Default, brand, destructive and outline buttons, button groups and cards sit on the themed `shadow-control`, a 1px lift. Ghost and link buttons stay flat. Remove any shadow you added to these components yourself.

### Breaking changes in `@vendure-io/design-tokens`

1. `--overlay` is `var(--surface-raised)` in both themes, not its own colour. An override of `--surface-raised` now also changes `--overlay`, `--popover` and every floating surface.

## Migrating from 1.x to 2.0

`@vendure-io/ui` 2.0 and `@vendure-io/design-tokens` 2.0 ship together. Upgrade both in the same change.

### Breaking changes in `@vendure-io/ui`

1. Export paths moved. `@vendure-io/ui/components/ui/*` is now `@vendure-io/ui/components/atoms/*`, and `@vendure-io/ui/components/custom/*` is now `@vendure-io/ui/components/molecules/*`. The old paths are removed.
2. Badge `default` is neutral subtle, not solid brand. Use `variant="brand"` for solid brand. `variant="secondary"` is removed: delete the prop.
3. Button `default` and every use of the `primary` slot are neutral. Use `variant="brand"` for an identity moment.
4. The look is flat. Primitives have no `shadow-xs` or `shadow-2xs`. Select and dropdown popups size to their content, not to the trigger width.
5. The `react-hook-form` peer dependency is removed.
6. `@vendure-io/design-tokens` is a peer dependency. Install it next to `@vendure-io/ui`.
7. CodeBlock no longer exports `transformCommand`, `processCode` or `matchFileTypeIcon`. The `molecules/code-block/*` files and `molecules/data-table/data-table-helpers` are not exported. StatCard no longer exports `statCardDeltaVariants`.
8. The data-table module exports the TanStack table type as `TableInstance`, not `Table`.
9. `ComboboxFreeText` `loading` is deprecated. Use `isLoading`. Chip `variant` no longer accepts `link` or `ghost`. CodeBlock has no outer margin: add your own.
10. Drawer is built on Base UI, and `vaul` is gone. Replace `asChild` with the `render` prop, and `direction` with `swipeDirection` (`top` is `up`, `bottom` is `down`). See the Drawer note under [Atoms](#atoms).
11. `@vendure-io/ui` requires `@base-ui/react` `^1.8.0` (1.x required `^1.2.0`).

### Migration steps

1. Install `@vendure-io/design-tokens@^2.0.0` and `@vendure-io/ui@^2.0.0`.
2. Replace `@vendure-io/ui/components/ui/` with `@vendure-io/ui/components/atoms/` and `@vendure-io/ui/components/custom/` with `@vendure-io/ui/components/molecules/`. A search and replace is enough. For Dashboard extensions, the `@vendure/cli` `dashboard-ui` codemod rewrites the imports.
3. In your Tailwind entry CSS, import `@vendure-io/design-tokens/css/theme` and `@vendure-io/design-tokens/css/fonts`, and add `@source` for `@vendure-io/ui/src` relative to that CSS file. See [Getting Started](./getting-started.md#css-setup).
4. Transpile `@vendure-io/ui`. In Next.js, add it to `transpilePackages`.
5. Find `variant="secondary"` on Badge and remove it. Check every Badge without a variant: it is now neutral.
6. Find code that uses `primary`, `ring` or `accent` to mean Vendure blue. Change it to `brand` where you want the identity color.
7. On Drawer, change `asChild` to `render` and `direction` to `swipeDirection`.
8. If your app depends on `@base-ui/react` directly, set it to `^1.8.0`. If you pinned it to `1.2.0` with an override or resolution, remove that pin.
9. Run `@vendure-io/design-lint` 1.0 (ESLint or Biome) to find raw colors. See [Getting Started](./getting-started.md#lint-for-raw-colors).
10. Update the agent skills: `npx skills update --global vendure-ui vendure-tokens`.

The token value changes (neutral `primary`, the new surface ramp, `--radius`, fonts no longer loaded by `css/theme`) are in [Design Tokens](./design-tokens.md).
