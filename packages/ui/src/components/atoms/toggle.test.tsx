import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Toggle } from './toggle.tsx';
import { ToggleGroup, ToggleGroupItem } from './toggle-group.tsx';

// Pins for the pressed state: the accent tint with foreground text, as in the
// v3 look. Hover is the muted fill, so pressed and hovered stay apart, and the
// outline border keeps its colour when pressed. The Storybook story
// ToggleGroup/PressedTint checks the rendered colours in a browser.

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
  'aria-pressed:bg-accent',
  'aria-pressed:text-foreground',
  'data-pressed:bg-accent',
  'data-pressed:text-foreground',
];

// Pressed plus hover keeps the tint, not the muted hover fill.
const PRESSED_HOVER_TOKENS = ['aria-pressed:hover:bg-accent', 'data-pressed:hover:bg-accent'];

describe('Toggle pressed state', () => {
  test('Base UI emits both aria-pressed and data-pressed', () => {
    const tag = pressedButton(renderToStaticMarkup(<Toggle defaultPressed>B</Toggle>));
    expect(tag).toContain('data-pressed=""');
  });

  test('uses the accent tint, distinct from the bg-muted hover shade', () => {
    const tokens = classTokens(pressedButton(renderToStaticMarkup(<Toggle defaultPressed>B</Toggle>)));
    expect(tokens).toEqual(expect.arrayContaining([...PRESSED_TOKENS, ...PRESSED_HOVER_TOKENS]));
    expect(tokens).toContain('hover:bg-muted');
    expect(tokens).not.toContain('aria-pressed:bg-muted');
  });

  test('outline variant keeps the input border when pressed', () => {
    const tokens = classTokens(
      pressedButton(renderToStaticMarkup(<Toggle variant="outline" defaultPressed>B</Toggle>)),
    );
    expect(tokens).toContain('border-input');
    expect(tokens.filter((token) => /pressed:border-/.test(token))).toEqual([]);
  });
});

describe('ToggleGroupItem pressed state', () => {
  for (const variant of ['default', 'outline'] as const) {
    test(`${variant} variant uses the accent tint`, () => {
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
