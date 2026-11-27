export interface GuidanceRule {
  title: string;
  body: string;
}

export interface GuidanceChoice {
  choice: string;
  when: string;
}

/** A pattern an agent might build by hand, and the components to use instead. */
export interface HandRolledPattern {
  /** What the hand-built version looks like, in a few words. */
  pattern: string;
  /** Public component exports that replace it. `skills:check` fails on a name it cannot find. */
  use: string[];
}

export interface GuidanceEntry {
  id: string;
  title: string;
  summary: string;
  sourceStory: string;
  /**
   * The public component exports this decision covers. Every public component
   * needs an entry (or a place in `no-guidance.ts`); compound parts such as
   * `FooHeader` or `FooItem` are covered through `Foo`.
   */
  components: string[];
  /** Hand-built patterns this decision replaces. Generates the "Do not hand-roll" section. */
  replaces?: HandRolledPattern[];
  rules: GuidanceRule[];
  choices?: GuidanceChoice[];
  related?: string[];
}

export interface IllustrationGuidance {
  component: string;
  use: string;
  /** The closest wrong choice, and the illustration to use for it instead. */
  notFor: string;
}

export interface ScreenRecipe {
  id: string;
  title: string;
  purpose: string;
  invariants: string[];
  dashboardIntent: string[];
  standaloneSkeleton: string;
}

/** A public component that needs no guidance entry, and why. */
export interface NoGuidance {
  component: string;
  reason: string;
}
