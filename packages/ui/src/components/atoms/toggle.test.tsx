import { describe, expect, test } from 'bun:test';
import type * as React from 'react';
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

  test('outline variant keeps the outline edge when pressed', () => {
    const tokens = classTokens(
      pressedButton(renderToStaticMarkup(<Toggle variant="outline" defaultPressed>B</Toggle>)),
    );
    expect(tokens).toContain('border-border');
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

describe('Toggle aria-disabled', () => {
  // The real hover and press are checked in the Toggle DisabledWithReason
  // story (hoverText with keepsLook in the story test runner).
  const tokens = (element: React.ReactElement) =>
    classTokens(renderToStaticMarkup(element).match(/<button[^>]*>/)?.[0] ?? '');

  test('looks like disabled and keeps its pointer events', () => {
    const classes = tokens(<Toggle aria-disabled aria-label="Bold" />);
    expect(classes).toEqual(expect.arrayContaining(['aria-disabled:opacity-50', 'aria-disabled:cursor-not-allowed']));
    expect(classes).not.toContain('aria-disabled:pointer-events-none');
  });

  test('undoes the hover to the rest look, pressed or not', () => {
    const classes = tokens(<Toggle aria-disabled aria-label="Bold" />);
    expect(classes).toEqual(
      expect.arrayContaining([
        'aria-disabled:hover:bg-transparent',
        'aria-disabled:hover:text-current',
        'aria-disabled:aria-pressed:hover:bg-accent',
        'aria-disabled:aria-pressed:hover:text-foreground',
      ]),
    );
  });

  test('a ToggleGroup item takes the same rules', () => {
    const html = renderToStaticMarkup(
      <ToggleGroup>
        <ToggleGroupItem value="bold" aria-disabled aria-label="Bold" />
      </ToggleGroup>,
    );
    expect(classTokens(html.match(/<button[^>]*>/)?.[0] ?? '')).toContain('aria-disabled:hover:bg-transparent');
  });
});

describe('Toggle size and corners match Button', () => {
  const tokens = (element: React.ReactElement) =>
    classTokens(renderToStaticMarkup(element).match(/<button[^>]*>/)?.[0] ?? '');

  test('default is 34px with the xl radius, sm is 28px with 12px text', () => {
    expect(tokens(<Toggle aria-label="Bold" />)).toEqual(expect.arrayContaining(['h-8.5', 'min-w-8.5', 'rounded-xl']));
    expect(tokens(<Toggle size="sm" aria-label="Bold" />)).toEqual(expect.arrayContaining(['h-7', 'min-w-7', 'text-xs']));
  });

  test('a ToggleGroup rounds its outer corners with the xl radius, on logical sides', () => {
    const html = renderToStaticMarkup(
      <ToggleGroup variant="outline">
        <ToggleGroupItem value="a">A</ToggleGroupItem>
        <ToggleGroupItem value="b">B</ToggleGroupItem>
      </ToggleGroup>,
    );
    expect(classTokens(html.match(/<div[^>]*>/)?.[0] ?? '')).toContain('rounded-xl');
    expect(classTokens(html.match(/<button[^>]*>/)?.[0] ?? '')).toEqual(
      expect.arrayContaining([
        'group-data-horizontal/toggle-group:data-[spacing=0]:first:rounded-s-xl',
        'group-data-horizontal/toggle-group:data-[spacing=0]:last:rounded-e-xl',
        'group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-s-0',
        'group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-s',
      ]),
    );
    // A physical side would stay put in right to left; the story
    // Direction joined groups checks the mirrored corners in a browser.
    expect(html).not.toMatch(/(rounded|border)-[lr]-|border-[lr]\b/);
  });
});

describe('Toggle motion', () => {
  test('eases its fill, border and colour in quick on the default curve, like Button', () => {
    const tag = renderToStaticMarkup(<Toggle aria-label="Bold">B</Toggle>).match(/<button[^>]*>/)?.[0] ?? '';
    expect(classTokens(tag)).toEqual(
      expect.arrayContaining([
        'transition-[background-color,border-color,color,box-shadow]',
        'duration-quick',
        'ease-default',
      ]),
    );
  });
});

describe('Outline surface', () => {
  // The v3 look draws a pressed toggle beside buttons on the button surface:
  // the card fill and shadow-control, with the pressed item on the accent tint.
  // The story ToggleGroup/InAToolbar checks it beside a ButtonGroup.
  test('an outline Toggle sits on the card fill with shadow-control, like an outline Button', () => {
    const classes = classTokens(
      renderToStaticMarkup(<Toggle variant="outline" aria-label="Bold" />).match(/<button[^>]*>/)?.[0] ?? '',
    );
    expect(classes).toEqual(expect.arrayContaining(['bg-card', 'shadow-control', 'aria-pressed:bg-accent']));
    expect(classes).not.toContain('bg-transparent');
  });

  test('an aria-disabled outline Toggle keeps the card fill on hover', () => {
    const classes = classTokens(
      renderToStaticMarkup(<Toggle variant="outline" aria-disabled aria-label="Bold" />).match(/<button[^>]*>/)?.[0] ??
        '',
    );
    expect(classes).toContain('aria-disabled:hover:bg-card');
    expect(classes).not.toContain('aria-disabled:hover:bg-transparent');
  });

  test('a joined outline ToggleGroup sits on the card fill with shadow-control, like a ButtonGroup', () => {
    const html = renderToStaticMarkup(
      <ToggleGroup variant="outline" aria-label="View">
        <ToggleGroupItem value="grid">Grid</ToggleGroupItem>
      </ToggleGroup>,
    );
    const group = classTokens(html.match(/<div[^>]*data-slot="toggle-group"[^>]*>/)?.[0] ?? '');
    expect(group).toEqual(
      expect.arrayContaining([
        'data-[variant=outline]:data-[spacing=0]:bg-card',
        'data-[variant=outline]:data-[spacing=0]:shadow-control',
      ]),
    );
  });
});

// The outline Toggle sits on the outline Button's surface, so it takes the
// outline Button's hover too: the same fill and the same edge step. Pressed
// plus hover keeps the accent tint (the pressed hover tokens above).
describe('outline Toggle hover', () => {
  const hoverTokens = (tag: string) => classTokens(tag).filter((token) => /(^|:)hover:(bg|border)-/.test(token));
  const firstButton = (html: string) => html.match(/<button[^>]*>/)?.[0] ?? '';

  test('takes the outline Button hover fill and edge', async () => {
    const { Button } = await import('./button.tsx');
    const button = hoverTokens(firstButton(renderToStaticMarkup(<Button variant="outline">B</Button>)));
    const toggle = hoverTokens(firstButton(renderToStaticMarkup(<Toggle variant="outline">B</Toggle>)));
    expect(button.length).toBeGreaterThan(0);
    for (const token of button) expect(toggle).toContain(token);
    expect(toggle).not.toContain('hover:bg-muted');
  });

  test('a joined ToggleGroup item keeps the group edge on hover', () => {
    const html = renderToStaticMarkup(
      <ToggleGroup variant="outline" spacing={0}>
        <ToggleGroupItem value="a">A</ToggleGroupItem>
      </ToggleGroup>,
    );
    const item = html.match(/<button[^>]*data-slot="toggle-group-item"[^>]*>/)?.[0] ?? '';
    expect(item).toContain('data-spacing="0"');
    // The edge step skips a joined item: the group owns the edge.
    const edge = classTokens(item).find((token) => token.endsWith(':hover:border-input'));
    expect(edge).toContain("[data-slot=toggle-group-item][data-spacing='0']");
  });
});

// A toggle draws its icon as a Button does: 55% at rest, 85% under the
// pointer, a 1.75 stroke, and 14px in the small size.
describe('Toggle icon', () => {
  const tokens = (node: React.ReactElement) => classTokens((renderToStaticMarkup(node).match(/<button[^>]*>/)?.[0] ?? '').replaceAll('&gt;', '>'));
  const icon = "[&>svg:not([role=status]):not([class*='opacity-'])]";

  test('takes the Button icon strength and stroke', async () => {
    const { Button } = await import('./button.tsx');
    const button = tokens(<Button variant="outline">B</Button>);
    for (const variant of ['default', 'outline'] as const) {
      const toggle = tokens(<Toggle variant={variant}>B</Toggle>);
      for (const token of [`${icon}:opacity-55`, `hover:${icon}:opacity-85`, "[&_svg:not([class*='stroke-'])]:stroke-[1.75]"]) {
        expect(button).toContain(token);
        expect(toggle).toContain(token);
      }
    }
  });

  test('is 14px in the small size and 16px otherwise', () => {
    expect(tokens(<Toggle size="sm">B</Toggle>)).toContain("[&_svg:not([class*='size-'])]:size-3.5");
    expect(tokens(<Toggle size="sm">B</Toggle>)).not.toContain("[&_svg:not([class*='size-'])]:size-4");
    expect(tokens(<Toggle>B</Toggle>)).toContain("[&_svg:not([class*='size-'])]:size-4");
  });
});
