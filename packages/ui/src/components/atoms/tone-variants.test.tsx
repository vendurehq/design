import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Alert, AlertDescription, AlertTitle } from './alert.tsx';
import { Progress, type ProgressTone } from './progress.tsx';

// Tone text uses the tone's subtle-foreground slot, which
// @vendure-io/design-tokens checks at 4.5:1 on every surface and on the tone's
// subtle slot, in both modes. Progress fills use ramp step 600 in light mode and
// subtle-foreground in dark mode; both reach 3:1 on the track and the page.
// The solid tone slots are not text- or fill-safe.

/** Class tokens of the element carrying the given data-slot, entity-decoded. */
function slotTokens(html: string, slot: string): string[] {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0];
  if (!tag) throw new Error(`No ${slot} rendered`);
  const classAttr = tag.match(/class="([^"]*)"/)?.[1] ?? '';
  return classAttr.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").split(/\s+/).filter(Boolean);
}

describe('Alert tone variants', () => {
  for (const tone of ['warning', 'info'] as const) {
    test(`${tone} colors title, description and icon with ${tone}-subtle-foreground on the card surface`, () => {
      const tokens = slotTokens(
        renderToStaticMarkup(
          <Alert variant={tone}>
            <AlertTitle>Title</AlertTitle>
            <AlertDescription>Description</AlertDescription>
          </Alert>,
        ),
        'alert',
      );
      expect(tokens).toContain('bg-card');
      expect(tokens).toContain(`text-${tone}-subtle-foreground`);
      expect(tokens).toContain(`*:data-[slot=alert-description]:text-${tone}-subtle-foreground`);
      expect(tokens).toContain('*:[svg]:text-current');
      expect(tokens.filter((token) => new RegExp(`(^|:)(text|bg)-${tone}$`).test(token))).toEqual([]);
    });
  }

  test('default stays on the card pair', () => {
    const tokens = slotTokens(renderToStaticMarkup(<Alert>Notice</Alert>), 'alert');
    expect(tokens).toContain('bg-card');
    expect(tokens).toContain('text-card-foreground');
  });
});

describe('Progress tone', () => {
  test('defaults to the primary indicator on the control-border track', () => {
    const html = renderToStaticMarkup(<Progress value={40} aria-label="Upload" />);
    expect(html).toContain('data-tone="default"');
    expect(slotTokens(html, 'progress-track')).toContain('bg-control-border');
    expect(slotTokens(html, 'progress-indicator')).toContain('bg-primary');
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
      expect(indicator).toContain(`bg-${slot}-600`);
      expect(indicator).toContain(`dark:bg-${slot}-subtle-foreground`);
      expect(indicator).not.toContain('bg-primary');
    });
  }
});
