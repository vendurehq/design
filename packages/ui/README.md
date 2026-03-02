# @vendure-io/ui

React component library for Vendure, built on [shadcn/ui](https://ui.shadcn.com/) and [Tailwind CSS v4](https://tailwindcss.com/).

## Install

```bash
npm install @vendure-io/ui
```

### Peer dependencies

- `react` >= 19
- `react-dom` >= 19

Optional peers: `next`, `next-themes`, `react-hook-form`

## Usage

```tsx
import { Button } from "@vendure-io/ui/components/ui/button";
import { cn } from "@vendure-io/ui/lib/utils";
```

## Exports

| Export | Description |
|--------|-------------|
| `@vendure-io/ui/components/ui/*` | shadcn/ui primitives (button, dialog, input, etc.) |
| `@vendure-io/ui/components/custom/*` | Vendure-specific components |
| `@vendure-io/ui/lib/*` | Utilities (`cn`, etc.) |
| `@vendure-io/ui/hooks/*` | Shared React hooks |

## License

See [LICENSE.md](../../LICENSE.md) for details.
