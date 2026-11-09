import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { ArrowLink } from './arrow-link.tsx';

/** Class tokens of the first element carrying the given data-slot, entity-decoded. */
function slotTokens(html: string, slot: string): string[] {
  const tag = html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0];
  if (!tag) throw new Error(`No ${slot} rendered`);
  const classAttr = tag.match(/class="([^"]*)"/)?.[1] ?? '';
  return classAttr
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&#x27;/g, "'")
    .split(/\s+/)
    .filter(Boolean);
}

describe('ArrowLink', () => {
  test('renders an anchor with the label, then a decorative arrow', () => {
    const html = renderToStaticMarkup(<ArrowLink href="/deployments">All deployments</ArrowLink>);
    expect(html).toStartWith('<a');
    expect(html).toContain('href="/deployments"');
    expect(html).toContain('data-slot="arrow-link"');
    expect(html.indexOf('All deployments')).toBeLessThan(
      html.indexOf('data-slot="arrow-link-arrow"'),
    );
    expect(html).toMatch(/<svg[^>]*aria-hidden="true"/);
  });

  test('render swaps the element for a router link and keeps the look', () => {
    const html = renderToStaticMarkup(
      <ArrowLink render={<a href="/logs" data-router="" />}>Open worker logs</ArrowLink>,
    );
    expect(html).toStartWith('<a');
    expect(html).toContain('data-router');
    expect(slotTokens(html, 'arrow-link')).toContain('text-foreground-secondary');
  });

  test('text is foreground-secondary at rest and full on hover and keyboard focus', () => {
    const tokens = slotTokens(
      renderToStaticMarkup(<ArrowLink href="#">View details</ArrowLink>),
      'arrow-link',
    );
    expect(tokens).toEqual(
      expect.arrayContaining([
        'text-sm',
        'font-medium',
        'text-foreground-secondary',
        'hover:text-foreground',
        'focus-visible:text-foreground',
        'group/arrow-link',
      ]),
    );
  });

  test('the arrow is 15px at 45%, and on hover goes full and moves 2px out', () => {
    const tokens = slotTokens(
      renderToStaticMarkup(<ArrowLink href="#">View details</ArrowLink>),
      'arrow-link-arrow',
    );
    expect(tokens).toEqual(
      expect.arrayContaining([
        'size-3.75',
        'opacity-45',
        'group-hover/arrow-link:opacity-100',
        'group-hover/arrow-link:translate-x-0.5',
        'rtl:group-hover/arrow-link:-translate-x-0.5',
        'group-focus-visible/arrow-link:opacity-100',
        'group-focus-visible/arrow-link:translate-x-0.5',
        'motion-reduce:translate-none!',
      ]),
    );
  });

  test('motion runs on tokens', () => {
    const html = renderToStaticMarkup(<ArrowLink href="#">View details</ArrowLink>);
    expect(slotTokens(html, 'arrow-link')).toEqual(
      expect.arrayContaining([
        'duration-(--transition-duration-quick)',
        'ease-(--ease-soft)',
      ]),
    );
    expect(slotTokens(html, 'arrow-link-arrow')).toContain(
      '[transition:opacity_var(--transition-duration-moderate)_var(--ease-soft),translate_var(--transition-duration-normal)_var(--ease-out)]',
    );
  });
});
