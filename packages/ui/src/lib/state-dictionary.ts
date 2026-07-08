/**
 * The state dictionary — the mechanism that makes the same entity state look
 * the same in every Vendure surface (see CONTEXT.md → "State dictionary").
 *
 * This module ships the *contract*, not the app's states: the tone vocabulary,
 * the typed declaration helper, the severity rollup, and one universal map for
 * states every app shares (`commonStates`). Domain maps — deployment states,
 * quote states, order states — live in their owning repo, declared with
 * `defineStateEntries` and reviewed against the Storybook reference table.
 * The ui package never learns app enums: the app owns what `DEPLOYING` means;
 * the design system owns what `progress` looks like.
 */

/**
 * The semantic meaning a color expresses about a state. Tone ≠ token name:
 * `critical` renders with the `destructive` slots and `progress` shares the
 * `info` slots (distinguished by motion, not hue) — see StatusBadge.
 */
export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'critical' | 'progress';

export interface StateEntry {
  tone: Tone;
  defaultLabel: string;
}

/**
 * A declared, exhaustiveness-checked state map plus lookups that tolerate open
 * unions. `toneFor` / `labelFor` accept any string (states arrive from the wire
 * as bare strings) and fall back to `neutral` / the raw state, warning once per
 * unknown state in development so a typo surfaces without spamming a 200-row
 * table.
 */
export interface StateMap<S extends string> {
  entries: Record<S, StateEntry>;
  toneFor(state: string): Tone;
  labelFor(state: string): string;
}

const isDev = process.env.NODE_ENV !== 'production';

/**
 * Declare a domain's state→tone map. The `Record<S, StateEntry>` argument is
 * exhaustive over `S`, so typing the call as `defineStateEntries<DeploymentStatus>`
 * makes the compiler flag any enum member the map forgets. Lookups are
 * case-insensitive because the same state ships as `RUNNING`, `running`, and
 * `Running` across the estate.
 */
export function defineStateEntries<S extends string>(entries: Record<S, StateEntry>): StateMap<S> {
  // Case-insensitive index built once at declaration, not per lookup.
  const index = new Map<string, StateEntry>();
  for (const [state, entry] of Object.entries(entries) as [S, StateEntry][]) {
    index.set(state.toLowerCase(), entry);
  }

  const warned = new Set<string>();
  function resolve(state: string): StateEntry | undefined {
    const key = state.toLowerCase();
    const entry = index.get(key);
    // Dedup on the lowercased key so casing variants of the same unknown state
    // ("Foo" / "foo") warn once — matching the lookup semantics.
    if (!entry && isDev && !warned.has(key)) {
      warned.add(key);
      console.warn(
        `[state-dictionary] Unmapped state "${state}" — rendering as neutral. ` +
          'Add it to the domain map or check for a typo.',
      );
    }
    return entry;
  }

  return {
    entries,
    toneFor: (state) => resolve(state)?.tone ?? 'neutral',
    labelFor: (state) => resolve(state)?.defaultLabel ?? state,
  };
}

/**
 * The universal map — the only state strings this package ships. Every entry
 * has one unambiguous tone regardless of domain.
 *
 * `pending` and `running` are deliberately absent: they have no single tone
 * (principles 1 & 3 — a pending approval is `warning`, a queued job is
 * `neutral`; a running job is `progress`, a running service is `success`), so
 * every domain must decide them explicitly in its own map.
 */
export const commonStates = defineStateEntries({
  enabled: { tone: 'success', defaultLabel: 'Enabled' },
  disabled: { tone: 'neutral', defaultLabel: 'Disabled' },
  completed: { tone: 'success', defaultLabel: 'Completed' },
  failed: { tone: 'critical', defaultLabel: 'Failed' },
  cancelled: { tone: 'neutral', defaultLabel: 'Cancelled' },
  expired: { tone: 'neutral', defaultLabel: 'Expired' },
  draft: { tone: 'neutral', defaultLabel: 'Draft' },
  suspended: { tone: 'warning', defaultLabel: 'Suspended' },
  approved: { tone: 'success', defaultLabel: 'Approved' },
  rejected: { tone: 'critical', defaultLabel: 'Rejected' },
  error: { tone: 'critical', defaultLabel: 'Error' },
  degraded: { tone: 'warning', defaultLabel: 'Degraded' },
  unknown: { tone: 'neutral', defaultLabel: 'Unknown' },
});

/**
 * Severity ordering, `neutral` (0) → `critical` (5). Used by `maxTone` to roll
 * a set of child states up to a single parent tone (a "worst-of" rollup for
 * parent status rows, e.g. an environment summarizing its deployments).
 */
export const TONE_SEVERITY = {
  neutral: 0,
  success: 1,
  info: 2,
  progress: 3,
  warning: 4,
  critical: 5,
} satisfies Record<Tone, number>;

/**
 * The worst-of rollup: given child tones, return the most severe. An empty call
 * rolls up to `neutral` (nothing to report).
 */
export function maxTone(...tones: Tone[]): Tone {
  let worst: Tone = 'neutral';
  for (const tone of tones) {
    if (TONE_SEVERITY[tone] > TONE_SEVERITY[worst]) {
      worst = tone;
    }
  }
  return worst;
}

/**
 * `progress` states are exactly the "poll me" states — the system is working
 * right now and the value will change on its own. A polling loop keys on this.
 */
export function isProgressTone(tone: Tone): boolean {
  return tone === 'progress';
}
