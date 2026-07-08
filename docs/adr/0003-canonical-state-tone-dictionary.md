# ADR 0003: Canonical state→tone dictionary

- **Status**: Accepted (spike output, [OSS-603](https://linear.app/vendure/issue/OSS-603/spike-canonical-statetone-dictionary); implemented in [OSS-627](https://linear.app/vendure/issue/OSS-627/ship-statusbadge-state-dictionary-mechanism-in-vendure-ioui))
- **Date**: 2026-07-08

## Context

There is no contract for what a state looks like, so the estate has diverged into 20+ independent mappings that disagree with each other. `active` is green in the portals but brand blue in ops-admin; `completed` is green in three EE plugins but grey in workflow-engine; `cancelled` is red in the OSS dashboard but grey in EE/Cloud; partner-portal uses two different ambers for `pending` in the same app; OSS `refund` `Failed` falls through a substring matcher to untoned grey and is invisible.

The spike inventoried **177 state strings across 36 state machines/enums in five codebases** (vendure, vendure-ee-plugins, vendure-cloud, vendure-io, vendure-design) and mapped every one to a single tone vocabulary. **The dictionary is the deliverable of the whole StatusBadge effort — the component is only its renderer.** This ADR records the vocabulary, the rules that assign it, the explicit rulings on the contested states, how a state renders, and how the standard is distributed. CONTEXT.md already defines **Tone** as the six values below and **Subtle** as their default treatment; this ADR is the contract those glossary entries point at.

## Decision 1: six tones

Tone is the semantic meaning a color expresses about state — the entire visual vocabulary for status is these six, no more.

| Tone | Meaning | Typical states |
| --- | --- | --- |
| `neutral` | Inert. Nothing needs anyone; nothing is moving. | draft, created, not started, cancelled, expired (no consequence), disabled, hidden, unknown |
| `info` | Noteworthy, no valence. A fact worth seeing, not a judgment. | shipped, authorized, quoted, in review, invited, delegated, registered |
| `success` | Positive terminal, or healthy and operating. | completed, approved, settled, delivered, valid, enabled, active, healthy, running (a service) |
| `warning` | Needs a human, or signals risk. Attention, not failure. | awaiting approval, changes requested, degraded, low stock, stale, suspended, retrying |
| `critical` | Failed, blocked, or service-affecting. Intervene. | failed, error, rejected, declined, revoked, invalid, out of stock, disconnected |
| `progress` | The system is working right now. Transient; will resolve itself. Always shows a pulsing dot. | running (a job), building, deploying, queued in a live pipeline, validating |

**Tone is not a token name.** `critical` renders through the `destructive` ramp (hue 25) — the token keeps its shadcn-compatible name, the dictionary speaks tones. `progress` shares the `info` ramp (hue 250) and is distinguished by **motion, not hue**; it stays a semantically distinct tone so consumers can declare intent and rollup/polling logic can key on it.

## Decision 2: four principles decide every mapping

1. **Tone encodes consequence for the viewer, not the verb.** The same word maps differently by domain when the consequence differs. A `RUNNING` job is `progress` (transient, will finish); a `RUNNING` deployment is `success` (the service is up). An expired quote is `neutral` (it's just over); an expired license is `critical` (the product stops working). This is why the dictionary is keyed by domain, not by bare string.
2. **Red is rationed: cancelled is not a failure.** Critical means "intervene." A user-initiated terminal state — cancelled, revoked invitation, churned — is `neutral`. Reserving red keeps failure scannable in a 200-row table.
3. **Pending splits by who resolves it.** Waits on a human decision (approval queue, review, customer payment) → `warning`. Waits on the system or on time (queued job, pending deployment, async settlement) → `neutral`. Actively executing right now → `progress`. "Pending" as a word gets no single color; pending as a *situation* does.
4. **Good news is green, not brand blue and not grey.** active, approved, completed, healthy → `success`. Brand blue on a state was always an accident of the default variant (ops-admin); grey `completed` (workflow-engine) hid finished work. Brand stays reserved for identity moments per accent rationing.

## Decision 3: the eight named conflicts, resolved

| Conflict | Today | Ruling |
| --- | --- | --- |
| **Cancelled** | Red in OSS dashboard; grey in EE, Cloud, portals; outline in ops-admin & workflow-engine | `neutral` — user-initiated terminal, not failure (principle 2). OSS dashboard drops red. |
| **Pending** | 5-way: amber (OSS, two different partner-portal ambers), grey (Cloud, ops-admin), outline (EE), blue (tax-id) | Split by resolver (principle 3): human-blocking → `warning`; system/time → `neutral`. Everyone converges. |
| **In progress** | Blue raw-Tailwind (Cloud), spinner + grey (OSS job queue), brand default (EE) | `progress` — info hue + always-on pulsing dot. Both info *and* animated, as its own tone. The dot replaces the ad-hoc spinner. |
| **Active / Completed** | Green in portals & 3 EE plugins; brand blue in ops-admin; grey in workflow-engine; 4 tones inside org-hierarchy alone | `success` (principle 4). ops-admin (~10 blue states) and workflow-engine `COMPLETED` change. |
| **Expired** | Grey in EE quote/approval/tax-id; red for licenses in enterprise-portal | `neutral` by default; `critical` when service-affecting (license); `warning` when it demands re-action (tax ID) — principle 1. The dictionary encodes the per-domain exceptions. |
| **Suspended** | Grey (ops-admin customers), red (ops-admin plugins), raw orange (partner-portal) | `warning` — imposed, abnormal, reversible; not a failure. All three converge. |
| **Refund Failed** | Falls through OSS `getTypeForState` substring matcher to untoned grey | `critical` — a failure that was invisible. OSS dashboard bug fix. |
| **Break-glass active** | Deliberate amber in enterprise-portal, brand blue in ops-admin | `warning` — an "active" that means elevated privilege is risk, not success. The portal had it right; ops-admin changes. |

## Decision 4: presentation rules

- **Subtle, always.** Tinted background + readable foreground + matching border, per tone. `StatusBadge` has **no solid mode**. Solid chips (including brand) stay base-`Badge` territory for identity labels and counts — accent rationing applied at the API level. This retires all four divergent mechanisms (app-extended variants, token classNames, raw Tailwind recipes, generic variants).
- **Leading dot is opt-in — except for `progress`.** `dot` reinforces scannability in dense tables; default off for calm detail pages. The `progress` tone **always** renders a pulsing dot; the pulse pauses under `prefers-reduced-motion`.
- **The component never touches the label.** No casing transforms, no translation. The dictionary ships an English `defaultLabel` per entry in sentence case ("Awaiting approval", not `AWAITING_APPROVAL`); consumers pass their translated string as children, which always wins. Raw `UPPER_SNAKE` on screen becomes impossible by default.
- **Exhaustive typed maps, no heuristics.** Cloud's `satisfies Record<State, Tone>` pattern is lifted as-is; the compiler catches new states. Substring matching (the OSS `getTypeForState` that silently dropped refund `Failed`) is banned. Unmapped states render `neutral` and warn in development.

## Decision 5: distribution — the system ships the standard, not the app maps

`@vendure-io/ui` exports the **mechanism**; app domain maps stay in their owning repos, declared with the mechanism's helper and reviewed against the reference table below. The ui package never learns app enums: Cloud owns what `DEPLOYING` means; the design system owns what `progress` looks like.

Ships in `@vendure-io/ui`:

- **The renderer** — `StatusBadge`, a hand-built molecule at `src/components/molecules/status-badge.tsx` (per ADR 0002; the spec predates the `custom/`→`molecules/` rename). Props: `tone?: Tone` (default `neutral`), `dot?: boolean` (default false).
- **The dictionary module** — `src/lib/state-dictionary.ts`: the `Tone` type, `StateEntry`, `defineStateEntries<S>()` (returns an exhaustiveness-checked map plus `toneFor`/`labelFor` lookups that handle open unions — unmapped → `neutral` + dev warning, case-insensitive), the `TONE_SEVERITY` / `maxTone` / `isProgressTone` severity-rollup and polling helpers (Cloud's worst-of pattern generalized), and `commonStates` — the **universal map**, the only state strings the package ships (enabled/disabled, completed, failed, cancelled, expired, draft, suspended, approved, rejected, error, degraded, unknown…).
- **`pending` and `running` are deliberately absent from `commonStates`.** No single tone fits either (principles 1 & 3), so every domain must decide them explicitly against its own consequence.

**Not shipped:** the app-domain state strings themselves. Domain maps (deployment, license, quote, workflow…) live app-side, retyped through `defineStateEntries`. Two alternatives were rejected: docs-only convention (the estate ran that experiment three times and every attempt fragmented) and centralizing all 177 states in the package (couples ui releases to every app's state-machine churn and inverts ownership).

Implementation is [OSS-627](https://linear.app/vendure/issue/OSS-627/ship-statusbadge-state-dictionary-mechanism-in-vendure-ioui).

## Decision 6: the reference table

This table is **part of the decision**, not documentation of it: each domain map lives in its owning repo and is reviewed against these rows (the Storybook reference page mirrors it). Keyed by domain, then state string (exact casing as it exists today). Notes record only a delta from current rendering or the rationale for a non-obvious call; unlisted means the mapping matches what most consumers already do.

### Commerce core — OSS / Platform dashboard (vendure)

| Domain | State | Tone | Note |
| --- | --- | --- | --- |
| Order | Created · Draft · AddingItems | `neutral` | |
| Order | ArrangingPayment · ArrangingAdditionalPayment | `warning` | Blocked on the customer paying |
| Order | Modifying | `warning` | Open until an admin completes it |
| Order | PaymentAuthorized | `info` | Was untoned grey — money reserved is worth seeing |
| Order | PaymentSettled | `success` | |
| Order | PartiallyShipped · Shipped · PartiallyDelivered | `info` | Was untoned grey; healthy mid-fulfillment, not inert |
| Order | Delivered | `success` | |
| Order | Cancelled | `neutral` | Was red (ruling 1) |
| Payment | Created | `neutral` | |
| Payment | Authorized | `info` | Was untoned grey |
| Payment | Settled | `success` | |
| Payment | Declined · Error | `critical` | Declined was untoned grey |
| Payment | Cancelled | `neutral` | Was red |
| Fulfillment | Created · Pending | `neutral` | Pending was amber — system-resolved, not human-blocked (ruling 2) |
| Fulfillment | Shipped | `info` | Was untoned grey |
| Fulfillment | Delivered | `success` | |
| Fulfillment | Cancelled | `neutral` | Was red |
| Refund | Pending | `warning` | May need admin/gateway action to settle |
| Refund | Settled | `success` | |
| Refund | Failed | `critical` | Was untoned grey — fell through the map (ruling 7) |
| Job queue | PENDING | `neutral` | Was amber — queued, system-resolved |
| Job queue | RUNNING | `progress` | Was grey + ad-hoc spinner; the dot is the spinner now |
| Job queue | RETRYING | `warning` | Something went wrong; recovering |
| Job queue | COMPLETED | `success` | |
| Job queue | FAILED | `critical` | |
| Job queue | CANCELLED | `neutral` | Was red |
| Customer account | guest | `neutral` | |
| Customer account | registered | `info` | |
| Customer account | verified | `success` | |
| Boolean | enabled / true | `success` | Also isActive, isPublic, published, visible |
| Boolean | disabled / false | `neutral` | Also inactive, private, hidden |

### Enterprise plugins (vendure-ee-plugins)

| Domain | State | Tone | Note |
| --- | --- | --- | --- |
| Workflow engine | PENDING / pending | `neutral` | |
| Workflow engine | RUNNING / running | `progress` | Was brand default |
| Workflow engine | COMPLETED / completed | `success` | Was grey — the headline EE conflict (ruling 4) |
| Workflow engine | FAILED / failed | `critical` | |
| Workflow engine | CANCELLED | `neutral` | |
| Approval requests | PENDING | `warning` | Human-blocking: a reviewer must decide (ruling 2) |
| Approval requests | IN_PROGRESS | `progress` | |
| Approval requests | APPROVED · AUTO_APPROVED | `success` | |
| Approval requests | REJECTED · AUTO_REJECTED | `critical` | |
| Approval requests | CHANGES_REQUESTED | `warning` | Ball is back in the requester's court |
| Approval requests | DELEGATED | `info` | |
| Approval requests | CANCELLED · EXPIRED | `neutral` | |
| Quotes | DRAFT | `neutral` | |
| Quotes | IN_REVIEW · QUOTED | `info` | QUOTED = sent, awaiting the buyer — their move, not yours |
| Quotes | AWAITING_APPROVAL · CHANGES_REQUESTED | `warning` | Blocked on an internal decision |
| Quotes | ACCEPTED | `success` | |
| Quotes | REJECTED | `critical` | |
| Quotes | CANCELLED · EXPIRED | `neutral` | Expired quote has no consequence (ruling 5) |
| Tax ID validation | Pending | `progress` | Was brand default — the system is validating right now |
| Tax ID validation | Valid | `success` | |
| Tax ID validation | Invalid · Error | `critical` | Error was grey |
| Tax ID validation | Expired | `warning` | Was grey — customer must supply a new ID (ruling 5) |
| Org hierarchy | Pending (company) | `warning` | Awaiting approval by an admin |
| Org hierarchy | Active | `success` | Ends the 4-way split (success/default/secondary/outline) |
| Org hierarchy | Invited | `info` | |
| Org hierarchy | Suspended | `warning` | Ruling 6 |
| Org hierarchy | Denied | `critical` | |
| Org hierarchy | Closed · Removed | `neutral` | |
| Store credit | Pending | `neutral` | Settles asynchronously — system-resolved |
| Store credit | Settled | `success` | Was undifferentiated grey |
| Store credit | Cancelled | `neutral` | |
| Stock | IN_STOCK | `success` | |
| Stock | LOW_STOCK | `warning` | |
| Stock | OUT_OF_STOCK | `critical` | Retires raw red/amber/green Tailwind |
| Price-rule schedules | active | `success` | |
| Price-rule schedules | upcoming | `info` | |
| Price-rule schedules | always · expired | `neutral` | |
| Punchout | active · completed (session) · success (cXML) | `success` | Punchout gains tones for the first time |
| Punchout | transferred | `info` | |
| Punchout | expired | `neutral` | |
| Punchout | duplicate | `warning` | |
| Punchout | error · auth_failed | `critical` | |
| Content versioning | active ("Current") | `success` | Was brand default |
| Content versioning | draft | `neutral` | |
| Configurator | ORDERED | `success` | Also deletes the phantom `warning` variant |

### Cloud (vendure-cloud)

| Domain | State | Tone | Note |
| --- | --- | --- | --- |
| Deployment | PENDING | `neutral` | Matches Cloud's muted today |
| Deployment | QUEUED · BUILDING · BUILT · DEPLOYING | `progress` | Exactly Cloud's blue set; same states drive polling |
| Deployment | RUNNING · SUCCEEDED | `success` | RUNNING = the service is up (principle 1: contrast job RUNNING) |
| Deployment | DEGRADED | `warning` | |
| Deployment | FAILED | `critical` | |
| Deployment | CANCELLED | `neutral` | |
| Runtime health / project rollup | HEALTHY / healthy | `success` | |
| Runtime health / project rollup | deploying | `progress` | |
| Runtime health / project rollup | DEGRADED / degraded | `warning` | |
| Runtime health / project rollup | failed | `critical` | |
| Runtime health / project rollup | UNKNOWN / unknown ("Not deployed") | `neutral` | |
| Teardown | QUEUED · RUNNING | `progress` | |
| Teardown | SUCCEEDED | `success` | |
| Teardown | FAILED · TIMED_OUT | `critical` | |
| Domains & source control | PENDING (domain) | `progress` | DNS/cert provisioning in motion |
| Domains & source control | READY | `success` | |
| Domains & source control | ACTIVE (repo link · branch mapping) · SUCCESS (trigger) | `success` | |
| Domains & source control | QUEUED (trigger) | `progress` | |
| Domains & source control | INACTIVE | `neutral` | |
| Domains & source control | DISCONNECTED · FAILED | `critical` | |
| Domains & source control | PENDING (VCS link session) | `warning` | Waits on the user finishing the GitHub flow |
| Domains & source control | COMPLETED (VCS link) | `success` | |
| Domains & source control | EXPIRED (VCS link) | `neutral` | |
| Database backups | completed | `success` | |
| Database backups | failed · aborted · error | `critical` | |

### Portals & ops (vendure-io)

| Domain | State | Tone | Note |
| --- | --- | --- | --- |
| Partner activities | PENDING | `warning` | Ops must review — human-blocking |
| Partner activities | APPROVED · AUTO_APPROVED | `success` | ops-admin: was brand blue / outline |
| Partner activities | REJECTED | `critical` | |
| Partner activities | CANCELLED · OUTDATED | `neutral` | |
| Marketplace plugins | draft · hidden | `neutral` | |
| Marketplace plugins | pending_review | `warning` | Retires the raw amber-100 recipe |
| Marketplace plugins | approved | `success` | ops-admin: was brand blue |
| Marketplace plugins | suspended | `warning` | Was raw orange (portal) / red (ops) — ruling 6 |
| Marketplace plugins | rejected | `critical` | |
| Licenses | ACTIVE | `success` | Resolves the headline green-vs-brand-blue conflict |
| Licenses | EXPIRED · REVOKED | `critical` | Service-affecting (ruling 5); enterprise-portal had it right |
| Licenses | REPLACED | `neutral` | |
| Seats & bindings | ACTIVE (binding) · fresh ("Live") | `success` | |
| Seats & bindings | stale | `warning` | |
| Seats & bindings | dead ("Offline") · SPLIT_LOCKED | `critical` | |
| Break-glass | active | `warning` | Deliberate: elevated privilege ≠ success (ruling 8) |
| Break-glass | revoked | `critical` | |
| Break-glass | expired | `neutral` | |
| Ops customers & users | ACTIVE / active | `success` | Was brand blue |
| Ops customers & users | SUSPENDED | `warning` | Was grey |
| Ops customers & users | CHURNED · disabled | `neutral` | disabled was red — leaving is not an error |
| Team invitations | pending | `info` | Waits on the invitee, not the viewer — info, not warning |
| Team invitations | accepted | `success` | |
| Team invitations | expired · revoked | `neutral` | |
| Partner tier | PARTNER_PENDING | `warning` | The only tier value that is a state |
| Partner tier | PARTNER · FRIEND · NONE | `neutral` | Identity, not state — base Badge; brand chip allowed for PARTNER as a deliberate identity moment |

**Not states — excluded from the dictionary.** License kind (`PRODUCTION/POC/EVAL/DEMO`), environment type (`PRODUCTION/STAGING/DEVELOPMENT`), deployment trigger (`USER/WEBHOOK/…`), transaction type (`CREDIT/DEBIT`), audit operations (`create/update/delete`), punchout direction/doc types, roles, and category tags are classifications, not conditions. They stay on the base `Badge` in neutral variants and never receive tones. If it can't "go wrong," it isn't a state.

## Consequences

- **`@vendure-io/design-tokens`**: no new work. The subtle slot tier — `{tone}-subtle`, `{tone}-subtle-foreground`, `{tone}-border` for success / warning / destructive / info / neutral, light + dark — already shipped ([#21](https://github.com/vendurehq/design/pull/21)); `StatusBadge` consumes it, with `critical` rendering via the `destructive` slots and `progress` via the `info` slots.
- **`@vendure-io/ui`**: ship `StatusBadge` (`components/molecules/`) and the `state-dictionary` module (`lib/`) with the universal map, per wildcard export rules (no barrels). Storybook gains a guidance page documenting the tone definitions, the principles/rulings, and this reference table — decisions, not props. Tracked in OSS-627.
- **Consumers**: each declares its own domain maps via `defineStateEntries` and migrates off its bespoke recipe. Suggested order: Cloud (already architecture-aligned) → OSS dashboard (fixes refund-`Failed` and cancelled-red) → ops-admin (biggest visual delta: ~10 brand-blue states turn green) → EE plugins → partner/enterprise portals. Migrations are separate issues in the owning repos, not part of this ADR or OSS-627.
- **Enforcement**: a lint rule banning raw Tailwind palette classes for state semantics (~100 sites) lands with the migration so retired recipes can't regrow.
- **CONTEXT.md**: no new terms — **Tone**, **Subtle**, and **State dictionary** already exist and now point at this contract.

## Deliverables

- This ADR (the reviewed state→tone table + tone vocabulary + rulings + presentation and distribution decisions).
- The spike spec artifact it distills (state→tone dictionary + `<StatusBadge>` API sketch), linked on OSS-603.
