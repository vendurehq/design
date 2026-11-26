import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Skeleton } from '../../atoms/skeleton.tsx';
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

  test('SkeletonCard children replace the body lines and keep the card padding', () => {
    const markup = html(
      <SkeletonCard description action>
        <SkeletonField />
      </SkeletonCard>,
    );

    expect(markup).toContain('data-slot="card-description"');
    expect(markup).toContain('data-slot="card-action"');
    expect(markup).toContain('data-skeleton="field"');
    // The children sit inside one CardContent stack, not against the card edge.
    expect(count(markup, 'data-slot="card-content"')).toBe(1);
    expect(markup).toMatch(
      /data-slot="card-content"[^>]*flex-col gap-4[^>]*>\s*<[^>]*data-skeleton="field"/,
    );
    // Title, description and the field label: the body lines are gone.
    expect(count(markup, 'data-skeleton="line"')).toBe(3);
  });

  test('SkeletonCard children that render nothing show the body lines', () => {
    for (const empty of [false, null, undefined, []]) {
      const markup = html(<SkeletonCard lines={2}>{empty}</SkeletonCard>);

      expect(count(markup, 'data-slot="card-content"')).toBe(1);
      expect(markup).not.toContain('flex-col gap-4');
      // One title line and two body lines.
      expect(count(markup, 'data-skeleton="line"')).toBe(3);
    }
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

  test('a skeleton is phrasing content, so it can stand in for a value inside a paragraph', () => {
    const markup = html(
      <p>
        Total <SkeletonLine className="inline-flex w-16" /> and <Skeleton className="h-4 w-8" />
      </p>,
    );

    // A <div> inside a <p> closes the paragraph when the HTML is parsed, and
    // React warns about it on the client.
    expect(markup).not.toContain('<div');
    expect(markup).toMatch(/^<p>Total <span [^>]*data-skeleton="line"/);
  });

  test('a skeleton bar is a block box, so its width and height apply outside a flex parent', () => {
    expect(html(<Skeleton className="h-4 w-8" />)).toMatch(/^<span [^>]*class="(?:[^"]*\s)?block[\s"]/);
    // A caller's display class still wins.
    expect(html(<Skeleton className="inline-block" />)).not.toMatch(/class="(?:[^"]*\s)?block[\s"]/);
  });

  test('a skeleton takes span props and a span ref', () => {
    const spanRef = (_element: HTMLSpanElement | null) => {};
    const divRef = (_element: HTMLDivElement | null) => {};
    void (<Skeleton ref={spanRef} />);
    void (<SkeletonLine ref={spanRef} />);
    // @ts-expect-error a skeleton is a <span> since 3.0, so a <div> ref no longer fits
    void (<Skeleton ref={divRef} />);
  });
});
