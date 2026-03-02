# Getting Started

## Prerequisites

- React 19+
- Tailwind CSS v4

## Install

```bash
npm install @vendure-io/design-tokens @vendure-io/ui
```

## CSS Setup

In your app's main CSS file, add:

```css
@import "@vendure-io/design-tokens/css/theme";
@source "../../node_modules/@vendure-io/ui/src";
```

The `@import` loads all design tokens, Tailwind v4, and the theme configuration.

The `@source` directive tells Tailwind v4 to scan the `@vendure-io/ui` package for class names so it generates the correct utility classes. Without this, components will render unstyled. Adjust the relative path based on your CSS file's location relative to `node_modules`.

## Framework Setup

### Next.js

**1. CSS import** — Add the imports above to `app/globals.css`:

```css
/* app/globals.css */
@import "@vendure-io/design-tokens/css/theme";
@source "../../node_modules/@vendure-io/ui/src";
```

**2. Transpilation** — Both packages ship raw `.tsx`/`.ts` source. Next.js handles this natively since v13.1+ via the `transpilePackages` config, though in most cases it works automatically. If you run into issues, add to `next.config.ts`:

```ts
const nextConfig = {
  transpilePackages: ["@vendure-io/ui", "@vendure-io/design-tokens"],
};
```

**3. Dark mode** — Install `next-themes` (optional peer dependency of `@vendure-io/ui`):

```bash
npm install next-themes
```

Wrap your app with `ThemeProvider` in your root layout:

```tsx
// app/layout.tsx
import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Vite

**1. CSS import** — Add the imports to your `src/index.css` (or `src/main.css`):

```css
/* src/index.css */
@import "@vendure-io/design-tokens/css/theme";
@source "../../node_modules/@vendure-io/ui/src";
```

**2. Tailwind plugin** — Install and register the Tailwind v4 Vite plugin:

```bash
npm install -D @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

**3. Dark mode** — Toggle the `dark` class on the `<html>` element. A simple toggle:

```ts
document.documentElement.classList.toggle("dark");
```

Or use a React state to manage it:

```tsx
function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return <button onClick={() => setDark(!dark)}>Toggle theme</button>;
}
```

## Fonts

The design system uses three font families:

| Role     | Font         | Usage      |
| -------- | ------------ | ---------- |
| Body     | Inter        | Default text, UI elements |
| Headings | Public Sans  | Headings, display text |
| Code     | Geist Mono   | Code blocks, monospace |

Load them via [Google Fonts](https://fonts.google.com/) or [Fontsource](https://fontsource.org/):

```bash
# Fontsource
npm install @fontsource-variable/inter @fontsource-variable/public-sans @fontsource/geist-mono
```

```ts
// Import in your entry file
import "@fontsource-variable/inter";
import "@fontsource-variable/public-sans";
import "@fontsource/geist-mono";
```

Or via Google Fonts in your HTML `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=Public+Sans:wght@400..700&family=Geist+Mono&display=swap"
  rel="stylesheet"
/>
```

The theme already defines `--font-sans`, `--font-heading`, `--font-body`, and `--font-mono` — the fonts just need to be loaded.
