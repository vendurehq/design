# @vendure-io/design-tokens

Design tokens and Tailwind v4 CSS theme for the Vendure design system.

## Install

```bash
npm install @vendure-io/design-tokens
```

## Exports

| Export | Description |
|--------|-------------|
| `@vendure-io/design-tokens` | TypeScript token definitions (colors, typography, radii, shadows, motion) |
| `@vendure-io/design-tokens/css/variables` | Raw CSS custom properties |
| `@vendure-io/design-tokens/css/theme` | Full Tailwind v4 theme CSS (recommended for apps) |

## Usage

Import the theme CSS in your app's global stylesheet:

```css
@import "@vendure-io/design-tokens/css/theme";
```

Or use the TypeScript tokens directly:

```ts
import { colors, typography } from "@vendure-io/design-tokens";
```

## License

See [LICENSE.md](../../LICENSE.md) for details.
