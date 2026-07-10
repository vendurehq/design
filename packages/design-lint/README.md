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

The string form works with Biome 2.0 and later. Biome 2.5+ consumers may use the object form with `path` and `includes` to exclude JavaScript or TypeScript theme-definition files while keeping other lint rules active there.

The rule rejects Tailwind ramp utilities, literal colors, and direct ramp CSS variables in JavaScript and TypeScript component code. It does not suggest a replacement because choosing the correct semantic slot requires domain context.
