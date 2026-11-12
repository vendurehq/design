/**
 * Colours CodeBlock swaps in Shiki's github-light theme. github-light's orange
 * (#e36209, used for GraphQL fields, CSS properties and similar) is 3.5:1 on a
 * white card; #a35200 keeps the hue and holds 4.5:1 on every light surface
 * tier. The contrast test in @vendure-io/design-tokens checks it. This file
 * imports nothing, so the token test can load it.
 */
export const githubLightReplacements: Record<string, string> = { '#e36209': '#a35200' };
