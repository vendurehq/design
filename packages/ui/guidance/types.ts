export interface GuidanceRule {
  title: string;
  body: string;
}

export interface GuidanceChoice {
  choice: string;
  when: string;
}

export interface GuidanceEntry {
  id: string;
  title: string;
  summary: string;
  sourceStory: string;
  rules: GuidanceRule[];
  choices?: GuidanceChoice[];
  related?: string[];
}

export interface IllustrationGuidance {
  component: string;
  use: string;
}

export interface ScreenRecipe {
  id: string;
  title: string;
  purpose: string;
  invariants: string[];
  dashboardIntent: string[];
  standaloneSkeleton: string;
}
