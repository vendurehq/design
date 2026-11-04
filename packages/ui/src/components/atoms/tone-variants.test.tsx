import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Alert, AlertDescription, AlertTitle } from './alert.tsx';
import { Progress, type ProgressTone } from './progress.tsx';

// A toned Alert sits on the tone's subtle fill and border with its icon in the
// tone's text slot; title and description keep the neutral text slots.
// Progress fills use ramp step 600 in light mode and subtle-foreground in dark
// mode; both reach 3:1 on the track and the page. The solid tone slots are not
// text- or fill-safe.

/** Class tokens of the element carrying the given data-slot, entity-decoded. */
function slotTokens(html: string, slot: string): string[] {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0];
  if (!tag) throw new Error(`No ${slot} rendered`);
  const classAttr = tag.match(/class="([^"]*)"/)?.[1] ?? '';
  return classAttr.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").split(/\s+/).filter(Boolean);
}

describe('Alert tone variants', () => {
  const slots = { destructive: 'destructive', warning: 'warning', info: 'info' } as const;
  for (const [tone, slot] of Object.entries(slots)) {
    test(`${tone} sits on the ${slot} subtle fill and border with a ${slot}-text icon`, () => {
      const tokens = slotTokens(
        renderToStaticMarkup(
          <Alert variant={tone as keyof typeof slots}>
            <AlertTitle>Title</AlertTitle>
            <AlertDescription>Description</AlertDescription>
          </Alert>,
        ),
        'alert',
      );
      expect(tokens).toContain(`bg-${slot}-subtle`);
      expect(tokens).toContain(`border-${slot}-border`);
      expect(tokens).toContain('text-foreground');
      expect(tokens).toContain(`*:[svg]:text-${slot}-text`);
      expect(tokens.filter((token) => new RegExp(`(^|:)(text|bg)-${slot}$`).test(token))).toEqual([]);
    });
  }

  test('default stays on the card pair', () => {
    const tokens = slotTokens(renderToStaticMarkup(<Alert>Notice</Alert>), 'alert');
    expect(tokens).toContain('bg-card');
    expect(tokens).toContain('text-card-foreground');
  });

  test('the description uses foreground-secondary in every variant', () => {
    for (const variant of ['default', 'destructive', 'warning', 'info'] as const) {
      const html = renderToStaticMarkup(
        <Alert variant={variant}>
          <AlertDescription>Description</AlertDescription>
        </Alert>,
      );
      expect(slotTokens(html, 'alert-description')).toContain('text-foreground-secondary');
    }
  });
});

describe('Progress tone', () => {
  test('defaults to the primary indicator on the control-border track', () => {
    const html = renderToStaticMarkup(<Progress value={40} aria-label="Upload" />);
    expect(html).toContain('data-tone="default"');
    expect(slotTokens(html, 'progress-track')).toContain('bg-control-border');
    expect(slotTokens(html, 'progress-indicator')).toContain('[--progress-fill:var(--color-primary)]');
  });

  const slots: Record<Exclude<ProgressTone, 'default'>, string> = {
    success: 'success',
    warning: 'warning',
    critical: 'destructive',
  };

  for (const [tone, slot] of Object.entries(slots) as [ProgressTone, string][]) {
    test(`${tone} pairs the ${slot} subtle track with a 600 fill, subtle-foreground in dark`, () => {
      const html = renderToStaticMarkup(<Progress tone={tone} value={90} aria-label="Usage" />);
      expect(html).toContain(`data-tone="${tone}"`);
      expect(slotTokens(html, 'progress-track')).toContain(`bg-${slot}-subtle`);
      const indicator = slotTokens(html, 'progress-indicator');
      expect(indicator).toContain(`[--progress-fill:var(--color-${slot}-600)]`);
      expect(indicator).toContain(`dark:[--progress-fill:var(--color-${slot}-subtle-foreground)]`);
      expect(indicator).not.toContain('[--progress-fill:var(--color-primary)]');
    });
  }
});

describe('Progress indeterminate', () => {
  test('value={null} marks the indicator indeterminate and sweeps only with motion allowed', () => {
    const html = renderToStaticMarkup(<Progress value={null} aria-label="Deploying" />);
    const tag = html.match(/<[^>]*data-slot="progress-indicator"[^>]*>/)?.[0] ?? '';
    expect(tag).toContain('data-indeterminate=""');
    const indicator = slotTokens(html, 'progress-indicator');
    expect(indicator).toContain('motion-safe:data-indeterminate:animate-shimmer');
    expect(indicator).toContain('data-indeterminate:w-2/5');
    expect(indicator.filter((token) => token.includes('animate-') && !token.startsWith('motion-safe:'))).toEqual([]);
  });

  test('a known value is not indeterminate', () => {
    const html = renderToStaticMarkup(<Progress value={40} aria-label="Upload" />);
    const tag = html.match(/<[^>]*data-slot="progress-indicator"[^>]*>/)?.[0] ?? '';
    expect(tag).not.toContain('data-indeterminate=""');
    expect(tag).toContain('width:40%');
  });
});
