import { describe, expect, test } from 'bun:test';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import type { Tone } from '../../lib/state-dictionary.ts';
import {
  Card,
  CardAction,
  CardCount,
  type CardCountTone,
  CardDescription,
  CardHeader,
  CardRow,
  CardRows,
  CardTitle,
} from './card.tsx';
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
      'data-[variant=accent]:border-[color:color-mix(in_oklab,var(--brand-500)_30%,var(--border))]',
    );
    expect(tokens).toContain(
      'dark:data-[variant=accent]:border-[color:color-mix(in_oklab,var(--brand-500)_38%,var(--border))]',
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
    // The title lays out as a row with a 10px gap; the Card / With rows story
    // measures the real distance.
    expect(tokens).not.toContain('ms-2.5');
    expect(slotTokens(html, 'card-title')).toEqual(
      expect.arrayContaining(['has-data-[slot=card-count]:flex', 'has-data-[slot=card-count]:gap-2.5']),
    );
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

  test('CardAction leaves the second column and takes its own row when the header is narrow', () => {
    const html = renderToStaticMarkup(
      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
          <CardDescription>Orders and revenue.</CardDescription>
          <CardAction>Last 30 days</CardAction>
        </CardHeader>
      </Card>,
    );
    // The header is the query container, so the action reacts to the card width, not the viewport.
    expect(slotTokens(html, 'card-header')).toContain('@container/card-header');
    const action = slotTokens(html, 'card-action');
    // Wide layout is unchanged.
    expect(action).toEqual(
      expect.arrayContaining(['col-start-2', 'row-span-2', 'row-start-1', 'h-lh', 'self-start', 'justify-self-end']),
    );
    // Narrow layout: a row under the title, from the inline start, as tall as its content.
    const narrow = action.filter((token) => token.startsWith('@max-xs/card-header:'));
    expect(narrow).toEqual(
      expect.arrayContaining([
        '@max-xs/card-header:order-last',
        '@max-xs/card-header:col-span-full',
        '@max-xs/card-header:col-start-1',
        '@max-xs/card-header:row-span-1',
        '@max-xs/card-header:row-start-auto',
        '@max-xs/card-header:h-auto',
        '@max-xs/card-header:max-w-full',
        '@max-xs/card-header:justify-self-start',
      ]),
    );
    // The title and description span the header, so they do not share a row with each other.
    expect(slotTokens(html, 'card-title')).toContain('@max-xs/card-header:col-span-full');
    expect(slotTokens(html, 'card-description')).toContain('@max-xs/card-header:col-span-full');
    // Logical alignment only, so the row follows the writing direction.
    expect(action.filter((token) => /(^|:)(left|right|text-left|text-right|ml|mr|pl|pr)-/.test(token))).toEqual([]);
  });

  test('a className on CardAction still wins over the narrow layout', () => {
    const tokens = slotTokens(
      renderToStaticMarkup(
        <Card>
          <CardHeader>
            <CardAction className="@max-xs/card-header:mt-0">More</CardAction>
          </CardHeader>
        </Card>,
      ),
      'card-action',
    );
    expect(tokens).toContain('@max-xs/card-header:mt-0');
    expect(tokens).not.toContain('@max-xs/card-header:mt-2');
  });
});
