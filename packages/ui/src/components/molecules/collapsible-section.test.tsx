import { describe, expect, test } from 'bun:test';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Collapsible } from '../atoms/collapsible.tsx';
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

  test('open and onOpenChange reach the Collapsible', () => {
    const onOpenChange = () => {};
    const element = CollapsibleSection({
      title: 'Pending refunds',
      open: true,
      onOpenChange,
    }) as ReactElement<{ open?: boolean; onOpenChange?: unknown }>;
    expect(element.type).toBe(Collapsible);
    expect(element.props.open).toBe(true);
    expect(element.props.onOpenChange).toBe(onOpenChange);
  });

  test('the count is a CardCount: plain text, not a pill, and it does not wrap or shrink', () => {
    const html = renderToStaticMarkup(<CollapsibleSection title="Pending refunds" count={4} />);
    const count = openTag(html, 'collapsible-section-count');
    expect(count).toContain('text-muted-foreground');
    expect(count).toContain('text-xs font-semibold tabular-nums');
    expect(count).toContain('shrink-0');
    expect(count).toContain('whitespace-nowrap');
    expect(count).not.toMatch(/\b(border|bg-|rounded)/);
    expect(openTag(html, 'collapsible-section-title')).toContain('min-w-0');
  });

  test('a detail follows the count after a dot that screen readers skip', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Pushes not deployed" count={2} detail="1 failed" />,
    );
    expect(html).toContain('<span aria-hidden="true">·</span>');
    expect(html).toContain('<span class="sr-only">, </span>');
    expect(html).toMatch(/data-slot="collapsible-section-count-detail"[^>]*>1 failed<\/span>/);
  });

  test('with a detail, the tone colours the detail only', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection
        title="Pushes not deployed"
        count={2}
        detail="1 failed"
        tone="critical"
      />,
    );
    expect(openTag(html, 'collapsible-section-count-detail')).toContain('text-destructive-text');
    expect(openTag(html, 'collapsible-section-count')).toContain('text-muted-foreground');
    expect(openTag(html, 'collapsible-section-count')).not.toContain('text-destructive-text');
  });

  test('without a detail, the tone colours the whole count', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Failed payment captures" count={2} tone="critical" />,
    );
    const count = openTag(html, 'collapsible-section-count');
    expect(count).toContain('text-destructive-text');
    expect(count).not.toContain('text-muted-foreground');
    expect(html).not.toContain('collapsible-section-count-detail');
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
