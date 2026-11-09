import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Alert, AlertDescription, AlertTitle } from './alert.tsx';

// A toned Alert is a faint tint of its tone (fill and border mixed from one
// tone colour) with its icon in the tone's text slot; title and description
// keep the neutral text slots.

/** Class tokens of the element carrying the given data-slot, entity-decoded. */
function slotTokens(html: string, slot: string): string[] {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0];
  if (!tag) throw new Error(`No ${slot} rendered`);
  const classAttr = tag.match(/class="([^"]*)"/)?.[1] ?? '';
  return classAttr.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").split(/\s+/).filter(Boolean);
}

describe('Alert tone variants', () => {
  const slots = { destructive: 'destructive', warning: 'warning', info: 'info' } as const;
  const tints = {
    destructive: 'destructive-text',
    warning: 'warning-indicator',
    info: 'info-text',
  } as const;
  for (const [tone, slot] of Object.entries(slots)) {
    test(`${tone} is a faint ${tints[tone as keyof typeof tints]} tint with a ${slot}-text icon`, () => {
      const tokens = slotTokens(
        renderToStaticMarkup(
          <Alert variant={tone as keyof typeof slots}>
            <AlertTitle>Title</AlertTitle>
            <AlertDescription>Description</AlertDescription>
          </Alert>,
        ),
        'alert',
      );
      expect(tokens).toContain(`[--alert-tone:var(--${tints[tone as keyof typeof tints]})]`);
      expect(tokens).toContain('[--alert-fill:color-mix(in_oklab,var(--alert-tone)_7%,var(--card))]');
      expect(tokens).toContain(
        '[--alert-border:color-mix(in_oklab,var(--alert-tone)_22%,var(--border))]',
      );
      expect(tokens).toContain(
        'dark:[--alert-fill:color-mix(in_oklab,var(--alert-tone)_10%,transparent)]',
      );
      expect(tokens).toContain(
        'dark:[--alert-border:color-mix(in_oklab,var(--alert-tone)_30%,transparent)]',
      );
      expect(tokens).toContain('bg-(color:--alert-fill)');
      expect(tokens).toContain('border-(color:--alert-border)');
      expect(tokens.filter((token) => /-(subtle|border)$/.test(token))).toEqual([]);
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
