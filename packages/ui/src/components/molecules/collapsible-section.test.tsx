import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { CollapsibleSection } from './collapsible-section.tsx';

const openTag = (html: string, slot: string) =>
  html.match(new RegExp(`<[a-z0-9]+[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? '';

describe('CollapsibleSection', () => {
  test('closed: the header is a collapsed button in a heading and the pill shows the count', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Pending refunds" count={4}>
        <p>row</p>
      </CollapsibleSection>,
    );
    expect(openTag(html, 'collapsible-section-heading').startsWith('<h2')).toBe(true);
    expect(openTag(html, 'collapsible-section-trigger')).toContain('aria-expanded="false"');
    const pill = openTag(html, 'collapsible-section-count');
    expect(pill).not.toContain('aria-hidden');
    expect(html).toContain('>4</span>');
    expect(html).not.toContain('<p>row</p>');
  });

  test('open: the rows render and the pill leaves the accessibility tree', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Pending refunds" count={4} defaultOpen>
        <p>row</p>
      </CollapsibleSection>,
    );
    expect(openTag(html, 'collapsible-section-trigger')).toContain('aria-expanded="true"');
    expect(openTag(html, 'collapsible-section-count')).toContain('aria-hidden="true"');
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

  test('the attention tone colors the pill only', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Failed payments" count={2} tone="attention" />,
    );
    expect(openTag(html, 'collapsible-section-count')).toContain('bg-warning-subtle');
    expect(openTag(html, 'collapsible-section')).not.toContain('warning');
    expect(openTag(html, 'collapsible-section-trigger')).not.toContain('warning');
  });

  test('no count, no pill', () => {
    const html = renderToStaticMarkup(<CollapsibleSection title="Notes" />);
    expect(html).not.toContain('collapsible-section-count');
  });

  test('headingLevel sets the heading element', () => {
    const html = renderToStaticMarkup(<CollapsibleSection title="Notes" headingLevel={3} />);
    expect(openTag(html, 'collapsible-section-heading').startsWith('<h3')).toBe(true);
  });

  test('reduced motion keeps the fades and drops the height and the blur', () => {
    const html = renderToStaticMarkup(<CollapsibleSection title="Notes" count={1} defaultOpen />);
    expect(openTag(html, 'collapsible-section-panel')).toContain('motion-safe:transition-[height]');
    expect(openTag(html, 'collapsible-section-count')).toContain(
      'motion-safe:group-data-panel-open/collapsible-section-trigger:blur-xs',
    );
  });
});
