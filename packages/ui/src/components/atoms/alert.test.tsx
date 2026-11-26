import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { TerminalIcon } from 'lucide-react';

import { toneIcons } from '../../lib/tone-icons.ts';
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
    const tokens = classes(renderToStaticMarkup(<Alert tone="warning">Low stock</Alert>));
    expect(tokens).toContain('bg-(color:--alert-fill)');
    expect(tokens).toContain('border-(color:--alert-border)');
    expect(tokens.filter((t) => /^dark:(bg|border)-/.test(t))).toEqual([]);
  });

  test("a consumer's bg and border classes replace the tint", () => {
    const tokens = classes(
      renderToStaticMarkup(
        <Alert tone="critical" className="bg-card border-border">
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
    (renderToStaticMarkup(<Alert tone="info">Deploying</Alert>).match(/class="([^"]*)"/)?.[1] ?? '').split(/\s+/);

  test('pads 12px inline and 10px block', () => {
    expect(tokens()).toContain('px-3');
    expect(tokens()).toContain('py-2.5');
  });

  test('fades in from 4px above, and only fades with reduced motion', () => {
    const t = tokens();
    expect(t).toContain('starting:opacity-0');
    expect(t).toContain('motion-safe:starting:-translate-y-1');
    expect(t.filter((token) => token.startsWith('starting:') && token.includes('translate'))).toEqual([]);
    expect(t).toContain('duration-alert-enter');
    expect(t).toContain('ease-out');
  });
});

// A toned Alert takes the icon of its tone from the map StatusBadge reads, so
// a tone has one shape in a badge and in an alert.
describe('Alert icon', () => {
  const svgs = (html: string) => html.match(/<svg[^>]*>/g) ?? [];
  const iconOf = (Icon: (typeof toneIcons)['info']) => svgs(renderToStaticMarkup(<Icon />))[0]?.match(/class="([^"]*)"/)?.[1];

  test.each(['neutral', 'info', 'success', 'warning', 'critical', 'progress'] as const)(
    'the %s tone shows its tone icon',
    (tone) => {
      const [icon] = svgs(renderToStaticMarkup(<Alert tone={tone}>Text</Alert>));
      expect(icon).toContain('data-slot="alert-icon"');
      expect(icon).toContain('aria-hidden="true"');
      expect(icon).toContain(`class="${iconOf(toneIcons[tone])}`);
    },
  );

  test('the progress icon spins slowly, and stands still with reduced motion', () => {
    const [icon] = svgs(renderToStaticMarkup(<Alert tone="progress">Deploying</Alert>));
    expect(icon).toContain('animate-spin-slow');
    expect(icon).toContain('motion-reduce:animate-none');
    const [still] = svgs(renderToStaticMarkup(<Alert tone="info">Deploying</Alert>));
    expect(still).not.toContain('animate-spin');
  });

  test('without a tone it shows no icon', () => {
    expect(svgs(renderToStaticMarkup(<Alert>Text</Alert>))).toHaveLength(0);
  });

  test('icon replaces the tone icon, and false shows none', () => {
    const passed = svgs(renderToStaticMarkup(<Alert tone="info" icon={<TerminalIcon />}>Text</Alert>));
    expect(passed).toHaveLength(1);
    expect(passed[0]).toContain('lucide-terminal');
    expect(svgs(renderToStaticMarkup(<Alert tone="info" icon={false}>Text</Alert>))).toHaveLength(0);
  });

  // The 2.x way, an svg child in place of the tone icon, is gone: `icon` is
  // the only way to replace it.
  test('an svg child does not hide the tone icon', () => {
    const html = renderToStaticMarkup(
      <Alert tone="warning">
        <TerminalIcon />
        Text
      </Alert>,
    );
    expect(html).not.toMatch(/data-slot=alert-icon\]\]:hidden/);
    expect(html).toContain('data-slot="alert-icon"');
  });
});

// Alert takes the state dictionary's tone, like StatusBadge, CountBadge and
// Progress. The 2.x variant names are gone.
describe('Alert tone prop', () => {
  test('marks the alert with its tone', () => {
    expect(renderToStaticMarkup(<Alert tone="success">Saved</Alert>)).toContain('data-tone="success"');
    expect(renderToStaticMarkup(<Alert>Notice</Alert>)).not.toContain('data-tone');
  });

  test('has no variant prop', () => {
    // @ts-expect-error variant was replaced by tone
    renderToStaticMarkup(<Alert variant="warning">Low stock</Alert>);
    // @ts-expect-error destructive is the critical tone
    renderToStaticMarkup(<Alert tone="destructive">Payment failed</Alert>);
  });
});
