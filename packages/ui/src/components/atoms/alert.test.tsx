import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Alert, AlertAction, AlertDescription } from './alert.tsx';

// An absolutely positioned action covers any sentence that runs under it. The
// layout itself is checked by the play tests in stories/alert.stories.tsx.
describe('AlertAction', () => {
  test('is not absolutely positioned', () => {
    const html = renderToStaticMarkup(
      <Alert>
        <AlertDescription>The deployment list is out of date.</AlertDescription>
        <AlertAction>Retry</AlertAction>
      </Alert>,
    );
    const tag = html.match(/<div[^>]*data-slot="alert-action"[^>]*>/)?.[0];
    expect(tag).toBeDefined();
    expect(tag).not.toContain('absolute');
  });
});

// The modes switch custom properties, so one bg-* or border-* class from the
// consumer replaces the tint in light and dark mode alike.
describe('toned Alert', () => {
  const classes = (html: string) =>
    (html.match(/<div[^>]*data-slot="alert"[^>]*class="([^"]*)"/)?.[1] ??
      html.match(/<div[^>]*class="([^"]*)"[^>]*data-slot="alert"/)?.[1] ??
      ''
    ).split(/\s+/);

  test('has no mode-specific bg or border utility', () => {
    const tokens = classes(renderToStaticMarkup(<Alert variant="warning">Low stock</Alert>));
    expect(tokens).toContain('bg-(color:--alert-fill)');
    expect(tokens).toContain('border-(color:--alert-border)');
    expect(tokens.filter((t) => /^dark:(bg|border)-/.test(t))).toEqual([]);
  });

  test("a consumer's bg and border classes replace the tint", () => {
    const tokens = classes(
      renderToStaticMarkup(
        <Alert variant="destructive" className="bg-card border-border">
          Payment failed
        </Alert>,
      ),
    );
    expect(tokens).toContain('bg-card');
    expect(tokens).toContain('border-border');
    expect(tokens).not.toContain('bg-(color:--alert-fill)');
    expect(tokens).not.toContain('border-(color:--alert-border)');
  });
});

// The v3 look: 12px inline padding, and one entrance on mount. The move is
// motion-safe, so reduced motion keeps only the fade.
describe('Alert entrance', () => {
  const tokens = () =>
    (renderToStaticMarkup(<Alert variant="info">Deploying</Alert>).match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/);

  test('pads 12px inline and 10px block', () => {
    expect(tokens()).toContain('px-3');
    expect(tokens()).toContain('py-2.5');
  });

  test('fades in from 4px above, and only fades with reduced motion', () => {
    const t = tokens();
    expect(t).toContain('starting:opacity-0');
    expect(t).toContain('motion-safe:starting:-translate-y-1');
    expect(t.filter((token) => token.startsWith('starting:') && token.includes('translate'))).toEqual([]);
    expect(t).toContain('duration-[240ms]');
    expect(t).toContain('ease-(--ease-out)');
  });
});
