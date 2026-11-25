import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import {
  SkeletonCard,
  SkeletonFact,
  SkeletonField,
  SkeletonLine,
  SkeletonListRow,
  SkeletonPageHeader,
} from './skeleton-parts.tsx';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);
const count = (markup: string, needle: string) => markup.split(needle).length - 1;

// Walks the markup with a tag stack and returns every <div> that sits inside a
// <span>: a block element in an inline one, which is invalid HTML.
const divsInsideSpans = (markup: string) => {
  const stack: string[] = [];
  const found: string[] = [];
  for (const { 1: closing = '', 2: tag = '' } of markup.matchAll(
    /<(\/?)([a-z][a-z0-9]*)\b[^>]*>/g,
  )) {
    if (closing) {
      stack.splice(stack.lastIndexOf(tag));
    } else if (!['svg', 'path', 'img', 'input', 'br'].includes(tag)) {
      if (tag === 'div' && stack.includes('span')) found.push(stack.join(' > '));
      stack.push(tag);
    }
  }
  return found;
};

describe('skeleton parts', () => {
  test('every part is hidden from assistive tech', () => {
    for (const part of [
      <SkeletonCard key="card" />,
      <SkeletonFact key="fact" />,
      <SkeletonField key="field" />,
      <SkeletonLine key="line" />,
      <SkeletonListRow key="row" />,
      <SkeletonPageHeader key="header" />,
    ]) {
      expect(html(part)).toMatch(/^<[a-z]+ [^>]*aria-hidden="true"/);
    }
  });

  test('a skeleton line is one line box of the inherited text style', () => {
    const markup = html(<SkeletonLine className="w-24 text-xs" />);

    expect(markup).toContain('h-lh');
    expect(markup).toContain('text-xs');
    expect(markup).toContain('h-[0.8lh]');
  });

  test('a skeleton line marks itself like the other parts, and a caller can still add a data-slot', () => {
    const markup = html(<SkeletonLine />);

    expect(markup).toContain('data-skeleton="line"');
    expect(markup).not.toContain('data-slot="skeleton-line"');
    expect(html(<SkeletonLine data-slot="title" />)).toContain('data-slot="title"');
  });

  test('SkeletonListRow renders the real ListRow with a meta line by default', () => {
    const markup = html(<SkeletonListRow />);

    expect(markup).toContain('data-slot="list-row"');
    expect(markup).toContain('data-slot="list-row-leading"');
    expect(markup).toContain('data-slot="list-row-meta"');
    expect(markup).toContain('data-slot="list-row-trailing"');
  });

  test('SkeletonListRow drops the leading media, meta line and action on request', () => {
    const markup = html(<SkeletonListRow leading="none" meta={false} action={false} />);

    expect(markup).not.toContain('data-slot="list-row-leading"');
    expect(markup).not.toContain('data-slot="list-row-meta"');
    expect(markup).not.toContain('data-slot="list-row-trailing"');
  });

  test('SkeletonListRow puts no <div> inside a <span>', () => {
    expect(divsInsideSpans(html(<SkeletonListRow />))).toEqual([]);
    expect(divsInsideSpans(html(<SkeletonListRow leading="avatar" meta={false} />))).toEqual([]);
  });

  test('SkeletonListRow draws a round avatar', () => {
    expect(html(<SkeletonListRow leading="avatar" />)).toContain('size-8 rounded-full');
  });

  test('SkeletonCard renders the real Card parts with body lines', () => {
    const markup = html(<SkeletonCard lines={4} />);

    expect(markup).toContain('data-slot="card"');
    expect(markup).toContain('data-slot="card-title"');
    expect(markup).toContain('data-slot="card-content"');
    expect(markup).not.toContain('data-slot="card-description"');
    expect(markup).not.toContain('data-slot="card-action"');
    // One title line and four body lines.
    expect(count(markup, 'data-skeleton="line"')).toBe(5);
  });

  test('SkeletonCard children replace the body lines', () => {
    const markup = html(
      <SkeletonCard description action>
        <SkeletonField />
      </SkeletonCard>,
    );

    expect(markup).toContain('data-slot="card-description"');
    expect(markup).toContain('data-slot="card-action"');
    expect(markup).toContain('data-skeleton="field"');
    expect(markup).not.toContain('data-slot="card-content"');
  });

  test('SkeletonPageHeader draws the page-title line and the actions', () => {
    const markup = html(<SkeletonPageHeader actions={2} />);

    expect(markup).toContain('text-style-page-title');
    expect(count(markup, 'h-8.5 w-24')).toBe(2);
    expect(html(<SkeletonPageHeader actions={0} description={false} />)).not.toContain('h-8.5');
  });

  test('no part renders a landmark, a heading or a group', () => {
    const markup = html(
      <>
        <SkeletonPageHeader />
        <SkeletonField />
        <SkeletonFact />
      </>,
    );

    expect(markup).not.toMatch(/<(header|h1|h2|label|dl)\b/);
    expect(markup).not.toContain('role="group"');
  });
});
