# Vendure Design System

The shared visual language for all Vendure surfaces: `@vendure-io/design-tokens` (color, type, radius, motion) and `@vendure-io/ui` (the component library), consumed by the OSS/Platform dashboard, Cloud, and the ecosystem apps.

## Language

### Color & tokens

**Ramp**:
A graded 50–950 scale of a single hue (brand, neutral, success…). Raw material — components never reference ramps directly.
_Avoid_: scale, palette

**Slot**:
A named semantic variable (`border`, `muted`, `primary`) that points into a ramp. Slots are what components consume.
_Avoid_: semantic token, theme variable

**Brand**:
The Vendure blue (hue 231) — an identity signature, not a general-purpose color. Lives only in the `primary` and `ring` slots.
_Avoid_: accent, Vendure blue, primary (when meaning the color rather than the slot)

**Tone**:
The semantic meaning a color expresses about state: `neutral`, `info`, `success`, `warning`, `critical`, `progress`.
_Avoid_: intent, status color, semantic color, variant (when meaning color)

**Subtle**:
The soft rendering of a tone — tinted background, readable foreground, matching border. The default treatment for status.
_Avoid_: soft, light, pastel

**Surface**:
A background level in the elevation ramp. Contrast between surfaces, not borders, is what separates content.
_Avoid_: elevation, layer

**Accent rationing**:
The color principle: neutral by default, tone for state, brand for the one primary action per view.

### Components & process

**Atom**:
A shadcn-CLI-managed primitive in the component library. Kept updatable from upstream, modified minimally.
_Avoid_: primitive, base component

**Molecule**:
A hand-written composed component the design system ships (StatusBadge, EmptyState, PageHeader…).
_Avoid_: custom component, shared component, widget

**State dictionary**:
The versioned, canonical mapping of entity states (pending, active, failed…) to tones. The contract that makes the same state look the same in every consumer.
_Avoid_: state map, badge mapping, status config

**Consumer**:
An app or plugin that imports the design system (dashboard, Cloud, portals, EE plugins).
_Avoid_: downstream app, client

**Graduate**:
To move a component from a consumer into the design system once a second consumer needs it.
_Avoid_: promote, upstream, extract

**Donor**:
The existing consumer implementation chosen as the basis for a graduating component.
_Avoid_: reference implementation
