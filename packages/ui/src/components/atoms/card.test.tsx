import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Card, CardAction, CardCount, CardHeader, CardRow, CardRows, CardTitle } from './card.tsx';

/** Class tokens of the first element carrying the given data-slot. */
function slotTokens(html: string, slot: string): string[] {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0];
  if (!tag) throw new Error(`No ${slot} rendered`);
  return (tag.match(/class="([^"]*)"/)?.[1] ?? '').replace(/&gt;/g, '>').replace(/&amp;/g, '&').split(/\s+/).filter(Boolean);
}

describe('Card', () => {
  test('is a 2xl panel with a full hairline border on the shadow-control shadow', () => {
    const tokens = slotTokens(renderToStaticMarkup(<Card>Body</Card>), 'card');
    expect(tokens).toContain('rounded-2xl');
    expect(tokens).toContain('border');
    expect(tokens).toContain('border-border');
    expect(tokens.filter((token) => token.startsWith('shadow'))).toEqual(['shadow-control']);
  });

  test('CardCount sits in the title as muted tabular numbers', () => {
    const html = renderToStaticMarkup(
      <Card>
        <CardHeader>
          <CardTitle>
            Deployments <CardCount>12</CardCount>
          </CardTitle>
        </CardHeader>
      </Card>,
    );
    const tokens = slotTokens(html, 'card-count');
    expect(tokens).toContain('text-muted-foreground');
    expect(tokens).toContain('tabular-nums');
    expect(html).toMatch(/data-slot="card-title"[^>]*>Deployments <span[^>]*data-slot="card-count"/);
  });

  test('CardRows runs its rows edge to edge, each row drawing its own top border', () => {
    const html = renderToStaticMarkup(
      <Card>
        <CardRows>
          <CardRow>One</CardRow>
          <CardRow>Two</CardRow>
        </CardRows>
      </Card>,
    );
    const rows = slotTokens(html, 'card-rows');
    expect(rows).toContain('-mb-(--card-gap)');
    expect(rows).toContain('first:-mt-(--card-gap)');
    expect(rows).toContain('*:last:rounded-b-2xl');
    const row = slotTokens(html, 'card-row');
    expect(row).toContain('border-t');
    expect(row).toContain('ps-(--card-ps)');
    expect(row).toContain('pe-(--card-px)');
  });

  test('a one-line CardHeader is one --card-head row without leaving its box', () => {
    const card = slotTokens(renderToStaticMarkup(<Card>Body</Card>), 'card');
    expect(card).toContain('[--card-head:--spacing(12)]');
    expect(card).toContain('data-[size=sm]:[--card-head:--spacing(11)]');

    const header = slotTokens(
      renderToStaticMarkup(
        <Card>
          <CardHeader>
            <CardTitle>Deployments</CardTitle>
            <CardAction>View all</CardAction>
          </CardHeader>
        </Card>,
      ),
      'card-header',
    );
    const oneLine = header.filter((token) => token.startsWith('[&:has(>[data-slot=card-title])'));
    expect(oneLine.some((token) => token.endsWith(':gap-y-0'))).toBe(true);
    expect(oneLine.some((token) => token.includes(':*:my-[calc((var(--card-head)-2*var(--card-gap)-1lh)/2)]'))).toBe(true);
    expect(oneLine.some((token) => token.includes(':[&.border-b]:*:my-'))).toBe(true);
    // The header's own box keeps its place: no negative margin or min-height on it.
    expect(header.filter((token) => /(^|:)-m[tby]-|(^|:)min-h-/.test(token))).toEqual([]);
  });
});
