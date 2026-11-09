import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTag, slotTokens, tagTokens } from '../../test/slot-tokens.ts';
import { ArrowLink } from './arrow-link.tsx';
import {
  PageHeader,
  PageHeaderActions,
  PageHeaderBack,
  PageHeaderBackRow,
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
  const link = slotTokens(html, 'page-header-back');
  expect(link).toEqual(
    expect.arrayContaining([
      'text-sm',
      'font-medium',
      'text-muted-foreground',
      'hover:text-foreground',
    ]),
  );
  expect(link).not.toContain('text-foreground-secondary');
  expect(slotTokens(html, 'page-header-back-chevron')).toEqual(
    expect.arrayContaining([
      'size-3.75',
      'opacity-45',
      'group-hover/arrow-link:opacity-100',
      'group-hover/arrow-link:-translate-x-0.5',
      'group-focus-visible/arrow-link:-translate-x-0.5',
      'rtl:group-hover/arrow-link:translate-x-0.5',
      'motion-reduce:translate-none!',
    ]),
  );
});

test('PageHeaderBack and ArrowLink share one look; only the tone and direction differ', () => {
  const back = renderToStaticMarkup(<PageHeaderBack href="/">Deployments</PageHeaderBack>);
  const forward = renderToStaticMarkup(<ArrowLink href="/">All deployments</ArrowLink>);
  const tone = /^text-(muted-foreground|foreground-secondary)$/;
  expect(slotTokens(back, 'page-header-back').filter((t) => !tone.test(t))).toEqual(
    slotTokens(forward, 'arrow-link').filter((t) => !tone.test(t)),
  );
  const move = /translate-x|^lucide-/;
  expect(slotTokens(back, 'page-header-back-chevron').filter((t) => !move.test(t))).toEqual(
    slotTokens(forward, 'arrow-link-arrow').filter((t) => !move.test(t)),
  );
});

test('PageHeaderBackRow is the row above the header, not a link', () => {
  const html = renderToStaticMarkup(
    <PageHeaderBackRow>
      <PageHeaderBack href="/">Deployments</PageHeaderBack>
    </PageHeaderBackRow>,
  );
  expect(html).toStartWith('<div');
  expect(html).toContain('data-slot="page-header-back-row"');
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
