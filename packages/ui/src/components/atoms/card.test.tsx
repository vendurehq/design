import { describe, expect, test } from 'bun:test';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type { Tone } from '../../lib/state-dictionary.ts';
import { Card, CardAction, CardCount, type CardCountTone, CardHeader, CardRow, CardRows, CardTitle } from './card.tsx';
import { slotTokens } from '../../test/slot-tokens.ts';

describe('Card', () => {
  test('is a 2xl panel with a full hairline border on the shadow-control shadow', () => {
    const tokens = slotTokens(renderToStaticMarkup(<Card>Body</Card>), 'card');
    expect(tokens).toContain('rounded-2xl');
    expect(tokens).toContain('border');
    expect(tokens).toContain('border-border');
    expect(tokens.filter((token) => token.startsWith('shadow'))).toEqual(['shadow-control']);
  });

  test('variant="accent" tints the border toward the brand and adds a fading brand wash', () => {
    const tokens = slotTokens(renderToStaticMarkup(<Card variant="accent">Body</Card>), 'card');
    const html = renderToStaticMarkup(<Card variant="accent">Body</Card>);
    expect(html).toContain('data-variant="accent"');
    expect(tokens).toContain(
      'data-[variant=accent]:border-[color:color-mix(in_oklab,var(--brand-500)_38%,var(--border))]',
    );
    expect(tokens).toContain(
      'data-[variant=accent]:bg-[image:linear-gradient(180deg,color-mix(in_oklab,var(--brand-500)_1.5%,transparent),transparent_55%)]',
    );
  });

  test('the default card has no accent', () => {
    expect(renderToStaticMarkup(<Card>Body</Card>)).toContain('data-variant="default"');
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
    // 10px after the title, as in the v3 look.
    expect(tokens).toContain('ms-2.5');
    expect(html).toMatch(/data-slot="card-title"[^>]*>Deployments <span[^>]*data-slot="card-count"/);
  });

  test('CardCount takes the warning or critical tone, and stays muted by default', () => {
    const tone = (node: ReactElement) => slotTokens(renderToStaticMarkup(node), 'card-count');
    expect(tone(<CardCount tone="critical">1 failed</CardCount>)).toContain('text-destructive-text');
    expect(tone(<CardCount tone="critical">1 failed</CardCount>)).not.toContain('text-muted-foreground');
    expect(tone(<CardCount tone="warning">2</CardCount>)).toContain('text-warning-text');
    expect(tone(<CardCount>2</CardCount>)).toContain('text-muted-foreground');
    const tones: CardCountTone[] = ['neutral', 'warning', 'critical'] satisfies Tone[];
    expect(tones.map((t) => renderToStaticMarkup(<CardCount tone={t}>1</CardCount>))).toHaveLength(3);
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
