import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTag, tagTokens } from '../../test/slot-tokens.ts';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderBack,
  PageHeaderContent,
  PageHeaderFact,
  PageHeaderFacts,
  PageHeaderTitle,
} from './page-header.tsx';

test('PageHeader wraps the actions below the title when the row is too narrow', () => {
  const html = renderToStaticMarkup(
    <PageHeader>
      <PageHeaderContent>
        <PageHeaderTitle>Products</PageHeaderTitle>
      </PageHeaderContent>
      <PageHeaderActions>Actions</PageHeaderActions>
    </PageHeader>,
  );
  const header = html.match(/<header[^>]*>/)?.[0] ?? '';
  expect(header).toContain('flex-wrap');
});

test('PageHeaderBack is a link with a leading chevron, not an arrow', () => {
  const html = renderToStaticMarkup(
    <PageHeaderBack href="/deployments">Deployments</PageHeaderBack>,
  );
  expect(html.startsWith('<a')).toBe(true);
  expect(html).toContain('href="/deployments"');
  expect(html).toContain('lucide-chevron-left');
  expect(html).not.toContain('lucide-arrow');
  expect(html.indexOf('lucide-chevron-left')).toBeLessThan(html.indexOf('Deployments'));
});

test('PageHeaderBack: muted 13px text that reaches foreground; the chevron moves 2px back', () => {
  const html = renderToStaticMarkup(<PageHeaderBack href="/">Deployments</PageHeaderBack>);
  const link = tagTokens(html.match(/<a[^>]*>/)?.[0] ?? '');
  expect(link).toEqual(
    expect.arrayContaining(['text-style-body', 'text-muted-foreground', 'hover:text-foreground']),
  );
  const chevron = tagTokens(slotTag(html, 'page-header-back-chevron'));
  expect(chevron).toEqual(
    expect.arrayContaining([
      'size-3.75',
      'opacity-45',
      'group-hover/page-header-back:-translate-x-0.5',
      'group-hover/page-header-back:opacity-100',
      'motion-reduce:translate-none!',
    ]),
  );
});

test('PageHeaderBack renders a router link through render', () => {
  const html = renderToStaticMarkup(
    <PageHeaderBack render={<button type="button" />}>Deployments</PageHeaderBack>,
  );
  expect(html.startsWith('<button')).toBe(true);
});

test('PageHeaderFacts: 13px secondary text, 18px between facts, icons at 45%', () => {
  const html = renderToStaticMarkup(
    <PageHeaderFacts>
      <PageHeaderFact>
        <svg />
        main
      </PageHeaderFact>
    </PageHeaderFacts>,
  );
  expect(tagTokens(slotTag(html, 'page-header-facts'))).toEqual(
    expect.arrayContaining([
      'flex-wrap',
      'gap-x-4.5',
      'text-style-body',
      'text-foreground-secondary',
    ]),
  );
  expect(tagTokens(slotTag(html, 'page-header-fact'))).toEqual(
    expect.arrayContaining(['gap-1.75', '[&>svg]:opacity-45', '[&>svg]:size-4']),
  );
});
