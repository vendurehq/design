# ADR 0001: Surface/elevation ramp & differentiated radius scale

- **Status**: Accepted (spike output, [OSS-602](https://linear.app/vendure/issue/OSS-602/spike-surfaceelevation-ramp-and-radius-scale-design); implemented in [OSS-609](https://linear.app/vendure/issue/OSS-609/implement-surfaceelevation-ramp-and-restored-radius-scale))
- **Date**: 2026-07-08

## Context

Two structural gaps surfaced by the dashboard density audit:

1. **No surface/elevation ramp.** Only `background`, `card`, `popover`, `sidebar` exist. Everything sits at the same visual level, so screens separate content exclusively with identical hairline borders — the "equal-weight boxes" finding (9 bordered cards on the order-detail page). A micro-ramp already exists in the light theme (`background` 0.97 → `sidebar` 0.98 → `card` 1.0) but it is accidental, undocumented, and borders are drawn on top of it anyway. Worse, Dialog/Sheet/Drawer render on `bg-background` — the page canvas color — so modals have zero surface separation and rely entirely on the scrim.
2. **The radius scale is collapsed.** `sm` = `md` = `lg` = `xl` = `2xl` = `3xl` = `4xl` = `0.2rem`. Atoms *already encode* a meaningful hierarchy in their classes (`rounded-sm` on menu items, `md` on controls, `xl` on Card/Dialog) that the tokens erase. The flat-look intent doesn't require a single value.

Constraint from the flat-look decision (see `packages/ui/CLAUDE.md`): xs-tier shadows are removed from primitives; overlay shadows (`shadow-md`+) are kept. The ramp therefore cannot lean on shadows below the overlay tier.

## Decision 1: a four-tier surface ramp

New slots, derived from the de-branded neutrals (hue 231, chroma 0.004 light / 0.007 dark):

| Tier | Role | Light | Dark |
| --- | --- | --- | --- |
| `background` | App canvas: page ground, sidebar rail | `oklch(0.97 0.004 231)` (neutral-50, unchanged) | `oklch(0.15 0.007 231)` (neutral-950, unchanged) |
| `surface` | Primary content plane: cards, panels, tables | `oklch(1 0 0)` | `oklch(0.18 0.007 231)` |
| `surface-raised` | Elements lifted within a surface: sticky headers, toolbars, nested panels | `oklch(1 0 0)` | `oklch(0.21 0.007 231)` |
| `overlay` | Floating layer: popovers, menus, dialogs, sheets, command palette | `oklch(1 0 0)` | `oklch(0.24 0.007 231)` |

Principles:

- **Contrast between tiers separates content; borders divide siblings within a tier.** A card on the canvas needs no border. A table inside a card keeps its row dividers. Inputs keep `border-input` (functional affordance, not separation).
- **Light mode deliberately collapses `surface` = `surface-raised` = `overlay` to white.** That *is* the flat look. Tier identity in light mode comes from the canvas showing through gaps, and from `shadow-md`+ on the overlay tier only. Dark mode expresses all four tiers through lightness (+0.03 L per step) — shadows are useless there anyway.
- **`overlay` keeps its existing shadow pairing** (`shadow-md` on menus/popovers, `shadow-lg` where already present). No new shadows below the overlay tier.

### Slot wiring (shadcn compatibility)

Existing slots become aliases into the ramp; atom class names don't change except where noted:

| Slot | Now points to | Effective change |
| --- | --- | --- |
| `card` | `surface` | none (light), none (dark — 0.18 already) |
| `popover` | `overlay` | none (light); dark 0.18 → 0.24 |
| `sidebar` | `background` | light 0.98 → 0.97; dark 0.17 → 0.15 — sidebar becomes canvas, content reads as the raised region |
| Dialog / AlertDialog / Sheet / Drawer | `bg-background` → `bg-overlay` (atom edit, 4 files) | modals finally sit above the page; dark 0.15 → 0.24 |
| TabsList / active TabsTrigger | `bg-muted` → `bg-inset`; `data-active:bg-background` → `bg-surface-raised` (atom edit) | see "Sunken wells" below — fixes the active tab rendering as a canvas-colored hole on white cards |

`card-foreground` / `popover-foreground` remain as-is. Tooltip stays inverted (`bg-foreground`) — it is outside the ramp by design.

Card drops `ring-foreground/10` (transition option: reduce to `/5` for one release). This is the actual "surfaces instead of borders" change on screens like order-detail.

### Companion: alpha-based intensity slots

The intensity slots (`muted` < `secondary` < `accent`) are absolute lightness values today. On the dark `overlay` tier (0.24) the current `accent` hover (0.25) becomes invisible — menu hover would break the moment `popover` maps to `overlay`. Redefine them as translucent foreground mixes so they hold on any tier:

| Slot | Light | Dark | Rendered on default surface |
| --- | --- | --- | --- |
| `muted` | `color-mix(in oklab, var(--foreground) 5%, transparent)` | 5% | ≈ current 0.955 / 0.21 |
| `secondary` | 7% | 8% | ≈ current 0.945 / 0.23 |
| `accent` | 8% | 11% | ≈ current 0.935 / 0.25 |

Percentages are calibrated per theme to reproduce today's rendered values exactly on the default surfaces — this is a representation change, not a visual one, until a component sits on a raised/overlay tier, where it now degrades correctly instead of vanishing.

### Companion: sunken wells (`inset`)

Some components need to read *below* their host surface: the tabs track, and later switch/progress tracks and skeletons. A foreground mix can't express this in dark mode (it lightens), so `inset` is a shade mix:

| Slot | Light | Dark |
| --- | --- | --- |
| `inset` | `color-mix(in oklab, black 5%, transparent)` | `color-mix(in oklab, black 25%, transparent)` |

This fixes the active-tab hierarchy: today the active trigger uses `bg-background`, which on a white `surface` card renders as a hole punched down to the canvas. Proposed treatment: **TabsList sits in an `inset` well; the active trigger lifts to `surface-raised`** — a segmented-control thumb that reads raised out of a sunken track in both themes, on any host surface (light: white thumb on a gray well; dark: 0.21 thumb on a ~0.14 well).

## Decision 2: differentiated radius scale

| Token | Now | Proposed | Used by (class census of `@vendure-io/ui`) |
| --- | --- | --- | --- |
| `none` | 0 | 0 | ×7 — table corners etc., unchanged |
| `sm` | 0.2rem | **0.125rem** (2px) | ×18 — menu/select items, small nested controls |
| `md` | 0.2rem | **0.25rem** (4px) | ×44 — buttons, inputs, selects, menus/popovers, tooltip. The workhorse; also the `--radius` slot |
| `lg` | 0.2rem | **0.375rem** (6px) | ×11 — tab lists, alerts, panels |
| `xl` | 0.2rem | **0.5rem** (8px) | ×6 — Card, Dialog, AlertDialog, Command |
| `2xl`–`4xl` | 0.2rem | **0.75 / 1 / 1.5rem** | ×1 — Badge (`rounded-4xl`) |
| `full` | 9999px | 9999px | ×17 — unchanged |

Rationale: the whole scale stays on the small side to keep the flat look — tight 2px steps, with containers sitting two steps above their controls (4px controls inside 8px cards, 2px items inside 4px menus). The workhorse `md` moves 3.2px → 4px, which is effectively imperceptible; differentiation is restored without softening the system.

Blast radius: controls are effectively unchanged (3.2 → 4px); `rounded-sm` items tighten slightly (3.2 → 2px); Card/Dialog shift 3.2 → 8px — the visible, intended change. **Badge**: `rounded-4xl` at 1.5rem clamps to a pill for `h-5` badges — accepted (see resolved decisions).

## Resolved decisions (review 2026-07-08)

1. **Radius scale sits on the smaller side.** A differentiated scale is wanted, but defaults stay tight — the 2/4/6/8px scale above supersedes the spike's initial 4/6/8/12px draft.
2. **Badge becomes a pill.** Accept the `rounded-4xl` behavior change.
3. **Sidebar moves to the canvas tier.** Bespoke 0.98/0.17 values are dropped; the boundary hairline (`sidebar-border`) stays.
4. **Active tab gets a real hierarchy treatment** — the `inset` well + `surface-raised` thumb described above, included in this change rather than deferred.

## Consequences

- `@vendure-io/design-tokens`: new `surface`, `surface-raised`, `overlay`, `inset` slots in `semantic.ts` (+ generated CSS vars + `@theme` entries); `radii.ts` rewrite; intensity slots become `color-mix()`.
- `@vendure-io/ui`: 5 atom edits (Dialog/AlertDialog/Sheet/Drawer → `bg-overlay`; Tabs → `bg-inset` track + `bg-surface-raised` active trigger), Card ring removal. All other atoms pick the changes up through tokens.
- Consumers: no class-level API changes, but the visual delta (card radius, borderless cards, dark-mode overlays) warrants a coordinated minor-version rollout per the raw-source publishing gotcha in the root CLAUDE.md.
- `color-mix()` requires Chrome 111+/Safari 16.2+/Firefox 113+ — within the dashboard's support matrix.

## Deliverables

- This spec.
- Mockups: OSS dashboard order-detail page (the 9-bordered-card screen), current vs. proposed, light and dark — linked on OSS-602.
