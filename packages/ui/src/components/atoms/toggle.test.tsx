import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Toggle } from './toggle.tsx';
import { ToggleGroup, ToggleGroupItem } from './toggle-group.tsx';

// Regression pins for the pressed-state contrast fix: the pressed state used bg-muted, the same shade
// as hover, and nearly vanished on dark overlays. The pressed state now uses the
// primary pair; its text contrast is covered by the primary-foreground on
// primary check in @vendure-io/design-tokens (src/contrast.test.ts).

/** Class tokens of the element whose opening tag matches, entity-decoded. */
function classTokens(tag: string): string[] {
  const classAttr = tag.match(/class="([^"]*)"/)?.[1] ?? '';
  return classAttr.replace(/&amp;/g, '&').replace(/&#x27;/g, "'").split(/\s+/).filter(Boolean);
}

function pressedButton(html: string): string {
  const tag = html.match(/<button[^>]*aria-pressed="true"[^>]*>/)?.[0];
  if (!tag) throw new Error('No pressed button rendered');
  return tag;
}

const PRESSED_TOKENS = [
  'aria-pressed:bg-primary',
  'aria-pressed:text-primary-foreground',
  'data-pressed:bg-primary',
  'data-pressed:text-primary-foreground',
];

// Pressed plus hover must stay on the primary pair, not fall back to the hover shade.
const PRESSED_HOVER_TOKENS = [
  'aria-pressed:hover:bg-primary/80',
  'aria-pressed:hover:text-primary-foreground',
  'data-pressed:hover:bg-primary/80',
  'data-pressed:hover:text-primary-foreground',
];

describe('Toggle pressed state', () => {
  test('Base UI emits both aria-pressed and data-pressed', () => {
    const tag = pressedButton(renderToStaticMarkup(<Toggle defaultPressed>B</Toggle>));
    expect(tag).toContain('data-pressed=""');
  });

  test('uses the primary pair, distinct from the bg-muted hover shade', () => {
    const tokens = classTokens(pressedButton(renderToStaticMarkup(<Toggle defaultPressed>B</Toggle>)));
    expect(tokens).toEqual(expect.arrayContaining([...PRESSED_TOKENS, ...PRESSED_HOVER_TOKENS]));
    expect(tokens).toContain('hover:bg-muted');
    expect(tokens).not.toContain('aria-pressed:bg-muted');
  });

  test('outline variant gives the pressed item a primary border', () => {
    const tokens = classTokens(
      pressedButton(renderToStaticMarkup(<Toggle variant="outline" defaultPressed>B</Toggle>)),
    );
    expect(tokens).toEqual(
      expect.arrayContaining(['aria-pressed:border-primary', 'data-pressed:border-primary']),
    );
  });
});

describe('ToggleGroupItem pressed state', () => {
  for (const variant of ['default', 'outline'] as const) {
    test(`${variant} variant uses the primary pair`, () => {
      const html = renderToStaticMarkup(
        <ToggleGroup variant={variant} defaultValue={['90']}>
          <ToggleGroupItem value="30">30 days</ToggleGroupItem>
          <ToggleGroupItem value="90">90 days</ToggleGroupItem>
        </ToggleGroup>,
      );
      const tokens = classTokens(pressedButton(html));
      expect(tokens).toEqual(expect.arrayContaining([...PRESSED_TOKENS, ...PRESSED_HOVER_TOKENS]));
      expect(tokens).not.toContain('aria-pressed:bg-muted');
    });
  }
});
