import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { CollapsibleSection } from './collapsible-section.tsx';

const openTag = (html: string, slot: string) =>
  html.match(new RegExp(`<[a-z0-9]+[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? '';

describe('CollapsibleSection', () => {
  test('closed: the header is a collapsed button in a heading and shows the count', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Pending refunds" count={4}>
        <p>row</p>
      </CollapsibleSection>,
    );
    expect(openTag(html, 'collapsible-section-heading').startsWith('<h2')).toBe(true);
    expect(openTag(html, 'collapsible-section-trigger')).toContain('aria-expanded="false"');
    expect(openTag(html, 'collapsible-section-count')).not.toContain('aria-hidden');
    expect(html).toContain('>4</span>');
    expect(html).not.toContain('<p>row</p>');
  });

  test('open: the rows render and the count stays', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Pending refunds" count={4} defaultOpen>
        <p>row</p>
      </CollapsibleSection>,
    );
    expect(openTag(html, 'collapsible-section-trigger')).toContain('aria-expanded="true"');
    expect(openTag(html, 'collapsible-section-count')).not.toContain('aria-hidden');
    expect(html).toContain('>4</span>');
    expect(html).toContain('<p>row</p>');
  });

  test('a controlled open prop wins over defaultOpen', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Pending refunds" open={false} defaultOpen>
        <p>row</p>
      </CollapsibleSection>,
    );
    expect(openTag(html, 'collapsible-section-trigger')).toContain('aria-expanded="false"');
  });

  test('the count is plain text, not a pill, and takes text', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Pushes not deployed" count="2 · 1 failed" />,
    );
    const count = openTag(html, 'collapsible-section-count');
    expect(count).toContain('text-muted-foreground');
    expect(count).not.toMatch(/\b(border|bg-|rounded)/);
    expect(html).toContain('>2 · 1 failed</span>');
  });

  test('the attention tone colors the count text only', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Failed payments" count={2} tone="attention" />,
    );
    expect(openTag(html, 'collapsible-section-count')).toContain('text-warning-text');
    expect(openTag(html, 'collapsible-section')).not.toContain('warning');
    expect(openTag(html, 'collapsible-section-trigger')).not.toContain('warning');
  });

  test('no count, no count element', () => {
    const html = renderToStaticMarkup(<CollapsibleSection title="Notes" />);
    expect(html).not.toContain('collapsible-section-count');
  });

  test('headingLevel sets the heading element', () => {
    const html = renderToStaticMarkup(<CollapsibleSection title="Notes" headingLevel={3} />);
    expect(openTag(html, 'collapsible-section-heading').startsWith('<h3')).toBe(true);
  });

  test('reduced motion keeps the fades and drops the height', () => {
    const html = renderToStaticMarkup(<CollapsibleSection title="Notes" count={1} defaultOpen />);
    expect(openTag(html, 'collapsible-section-panel')).toContain('motion-safe:transition-[height]');
  });
});
