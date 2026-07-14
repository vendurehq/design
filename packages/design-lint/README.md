# @vendure-io/design-lint

Mechanical lint rules for consumers of the Vendure design system. The package ships equivalent ESLint and Biome rules that reject raw color usage in component code.

## ESLint

```js
import vendureDesign from '@vendure-io/design-lint/eslint';

export default [
  ...vendureDesign.configs.recommended,
  {
    ignores: ['src/theme/**'],
  },
];
```

## Biome

Add the GritQL plugin to `biome.json`:

```json
{
  "plugins": ["./node_modules/@vendure-io/design-lint/biome/no-raw-colors.grit"]
}
```

The default plugin reports violations as errors. For gradual adoption, use the warning-level variant instead:

```json
{
  "plugins": ["./node_modules/@vendure-io/design-lint/biome/no-raw-colors-warn.grit"]
}
```

Biome does not expose per-plugin diagnostic severity in configuration, so choose the error or warning plugin explicitly. The variants enforce the same rule.

The string form works with Biome 2.0 and later. Biome 2.5+ consumers may use the object form with `path` and `includes` to exclude JavaScript or TypeScript theme-definition files while keeping other lint rules active there.

### Monorepos

Declare the plugin in the root `biome.json`. A nested Biome configuration must extend the root with Biome's root shorthand:

```json
{
  "root": false,
  "extends": ["//"]
}
```

Do not use a relative path such as `"../../biome.json"`: inherited plugin paths are re-resolved from the nested configuration's directory and Biome will fail with `Cannot read file`. Inherited exclusion globs also match relative to the nested workspace, not the repository root, so verify exclusions from each workspace that owns a nested configuration.

The rule rejects generic Tailwind palette utilities, literal colors, and direct generic ramp CSS variables in JavaScript and TypeScript component code. Vendure's published `brand`, `success`, `warning`, `destructive`, and `info` ramps are allowed because they carry semantic meaning. The rule does not suggest a replacement because choosing the correct semantic slot requires domain context.

A `#` followed by a purely decimal 3- or 4-digit run (for example a GitHub issue reference like `(#2608)` in a test title) is not treated as a `#RGB`/`#RGBA` color, so such references are not flagged. This is a deliberate tradeoff: numeric shorthand colors such as `#000` or `#333` are also not flagged, because a decimal 3/4-digit run is far more likely to be an issue reference than a color. Short hex colors that contain at least one `a`-`f` digit (`#abc`, `#f00`) are still rejected, as are 6- and 8-digit hex colors even when fully decimal (`#112233`).
