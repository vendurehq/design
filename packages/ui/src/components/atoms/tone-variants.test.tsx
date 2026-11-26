import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Alert, AlertDescription, AlertTitle } from './alert.tsx';
import { slotTokens } from '../../test/slot-tokens.ts';

// A toned Alert is a faint tint of its tone (fill and border mixed from one
// tone colour) with its icon in the tone's text slot; title and description
// keep the neutral text slots.

describe('Alert tones', () => {
  const slots = {
    neutral: 'neutral',
    info: 'info',
    success: 'success',
    warning: 'warning',
    critical: 'destructive',
    progress: 'info',
  } as const;
  const tints = {
    neutral: 'neutral-text',
    info: 'info-text',
    success: 'success-text',
    warning: 'warning-indicator',
    critical: 'destructive-text',
    progress: 'info-text',
  } as const;
  for (const [tone, slot] of Object.entries(slots)) {
    test(`${tone} is a faint ${tints[tone as keyof typeof tints]} tint with a ${slot}-text icon`, () => {
      const tokens = slotTokens(
        renderToStaticMarkup(
          <Alert tone={tone as keyof typeof slots}>
            <AlertTitle>Title</AlertTitle>
            <AlertDescription>Description</AlertDescription>
          </Alert>,
        ),
        'alert',
      );
      expect(tokens).toContain(`[--alert-tone:var(--${tints[tone as keyof typeof tints]})]`);
      expect(tokens).toContain('[--alert-fill:color-mix(in_oklab,var(--alert-tone)_7%,var(--card))]');
      expect(tokens).toContain(
        '[--alert-border:color-mix(in_oklab,var(--alert-tone)_14%,var(--border))]',
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

  test('no tone stays on the card pair', () => {
    const tokens = slotTokens(renderToStaticMarkup(<Alert>Notice</Alert>), 'alert');
    expect(tokens).toContain('bg-card');
    expect(tokens).toContain('text-card-foreground');
  });

  test('the description uses foreground-secondary in every tone', () => {
    for (const tone of [undefined, ...Object.keys(slots)] as (keyof typeof slots | undefined)[]) {
      const html = renderToStaticMarkup(
        <Alert tone={tone}>
          <AlertDescription>Description</AlertDescription>
        </Alert>,
      );
      expect(slotTokens(html, 'alert-description')).toContain('text-foreground-secondary');
    }
  });
});
