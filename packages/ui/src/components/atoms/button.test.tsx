import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Button } from './button.tsx';
import { ButtonGroup } from './button-group.tsx';

/** Class tokens of the element carrying the given data-slot, entity-decoded. */
function slotTokens(html: string, slot: string): string[] {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0];
  if (!tag) throw new Error(`No ${slot} rendered`);
  const classAttr = tag.match(/class="([^"]*)"/)?.[1] ?? '';
  return classAttr.replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&#x27;/g, "'").split(/\s+/).filter(Boolean);
}

const buttonTokens = (element: React.ReactElement) => slotTokens(renderToStaticMarkup(element), 'button');

describe('Button press feedback', () => {
  // Base UI's Button never emits data-pressed, so a data-pressed rule is dead.
  test('scales on :active, with a reduced-motion fallback', () => {
    const tokens = buttonTokens(<Button>Save</Button>);
    expect(tokens).toContain('active:scale-[0.97]');
    expect(tokens).toContain('motion-reduce:active:scale-100');
    expect(tokens).toContain('duration-(--transition-duration-moderate)');
    expect(tokens.filter((token) => token.includes('data-pressed'))).toEqual([]);
  });
});

describe('Button v3 look', () => {
  test('uses the xl radius and 13px medium text', () => {
    const tokens = buttonTokens(<Button>Save</Button>);
    expect(tokens).toContain('rounded-xl');
    expect(tokens).toContain('text-sm');
    expect(tokens).toContain('font-medium');
  });

  test('default is 34px and sm is 28px, icon-only sizes are matching squares', () => {
    expect(buttonTokens(<Button>Save</Button>)).toContain('h-8.5');
    expect(buttonTokens(<Button size="sm">Save</Button>)).toContain('h-7');
    expect(buttonTokens(<Button size="icon" aria-label="More" />)).toContain('size-8.5');
    expect(buttonTokens(<Button size="icon-sm" aria-label="More" />)).toContain('size-7');
  });

  test('outline sits on the card fill with the input border', () => {
    const tokens = buttonTokens(<Button variant="outline">Cancel</Button>);
    expect(tokens).toContain('bg-card');
    expect(tokens).toContain('border-input');
  });

  // destructive-foreground on destructive is checked at 4.5:1 in both modes in
  // @vendure-io/design-tokens (src/contrast.test.ts).
  test('destructive is a solid fill with destructive-foreground text', () => {
    const tokens = buttonTokens(<Button variant="destructive">Delete</Button>);
    expect(tokens).toContain('bg-destructive');
    expect(tokens).toContain('text-destructive-foreground');
    expect(tokens.filter((token) => /^(bg-destructive\/|text-destructive-subtle)/.test(token))).toEqual([]);
  });
});

describe('ButtonGroup', () => {
  test('draws one outer edge; children drop their own border', () => {
    const html = renderToStaticMarkup(
      <ButtonGroup>
        <Button variant="outline">Copy</Button>
        <Button variant="outline">Paste</Button>
      </ButtonGroup>,
    );
    const tokens = slotTokens(html, 'button-group');
    expect(tokens).toEqual(expect.arrayContaining(['inset-ring', 'inset-ring-input', 'bg-card', 'rounded-xl']));
    expect(tokens).toContain('*:data-slot:border-transparent');
    expect(tokens).toContain('[&>[data-slot]~[data-slot]]:border-l-border');
  });

  test('variant="primary" puts the segments on one primary fill', () => {
    const html = renderToStaticMarkup(
      <ButtonGroup variant="primary">
        <Button>Deploy</Button>
        <Button size="icon" aria-label="More deploy options" />
      </ButtonGroup>,
    );
    expect(html).toContain('data-variant="primary"');
    const tokens = slotTokens(html, 'button-group');
    expect(tokens).toContain('bg-primary');
    expect(tokens).toContain('[&>[data-slot]~[data-slot]]:border-l-primary-foreground/20');
    expect(tokens).not.toContain('inset-ring');
  });
});
