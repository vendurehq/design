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
    expect(t).toContain('duration-alert-enter');
    expect(t).toContain('ease-out');
  });
});

// A toned Alert takes the icon of its tone from the map StatusBadge reads, so
// a tone has one shape in a badge and in an alert.
describe('Alert icon', () => {
  const svgs = (html: string) => html.match(/<svg[^>]*>/g) ?? [];
  const iconOf = (Icon: (typeof toneIcons)['info']) => svgs(renderToStaticMarkup(<Icon />))[0]?.match(/class="([^"]*)"/)?.[1];

  test.each([
    ['destructive', 'critical'],
    ['warning', 'warning'],
    ['info', 'info'],
  ] as const)('the %s variant shows the %s tone icon', (variant, tone) => {
    const [icon] = svgs(renderToStaticMarkup(<Alert variant={variant}>Text</Alert>));
    expect(icon).toContain('data-slot="alert-icon"');
    expect(icon).toContain('aria-hidden="true"');
    expect(icon).toContain(`class="${iconOf(toneIcons[tone])}`);
  });

  test('the default variant shows no icon', () => {
    expect(svgs(renderToStaticMarkup(<Alert>Text</Alert>))).toHaveLength(0);
  });

  test('icon replaces the tone icon, and false shows none', () => {
    const passed = svgs(renderToStaticMarkup(<Alert variant="info" icon={<TerminalIcon />}>Text</Alert>));
    expect(passed).toHaveLength(1);
    expect(passed[0]).toContain('lucide-terminal');
    expect(svgs(renderToStaticMarkup(<Alert variant="info" icon={false}>Text</Alert>))).toHaveLength(0);
  });

  test('an svg child hides the tone icon', () => {
    const html = renderToStaticMarkup(
      <Alert variant="warning">
        <TerminalIcon />
        Text
      </Alert>,
    );
    expect(html).toContain('[&amp;:has(&gt;svg:not([data-slot=alert-icon]))&gt;[data-slot=alert-icon]]:hidden');
  });
});
