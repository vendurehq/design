import { describe, expect, test } from 'bun:test';
import type { ReactElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTag, slotTokens, tagTokens } from '../../test/slot-tokens.ts';
import { Collapsible } from '../atoms/collapsible.tsx';
import { CollapsibleSection } from './collapsible-section.tsx';

describe('CollapsibleSection', () => {
  test('closed: the header is a collapsed button in a heading and shows the count', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Pending refunds" count={4}>
        <p>row</p>
      </CollapsibleSection>,
    );
    expect(slotTag(html, 'collapsible-section-heading').startsWith('<h2')).toBe(true);
    expect(slotTag(html, 'collapsible-section-trigger')).toContain('aria-expanded="false"');
    expect(slotTag(html, 'collapsible-section-count')).not.toContain('aria-hidden');
    expect(html).toContain('>4</span>');
    expect(html).not.toContain('<p>row</p>');
  });

  test('open: the rows render and the count stays', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Pending refunds" count={4} defaultOpen>
        <p>row</p>
      </CollapsibleSection>,
    );
    expect(slotTag(html, 'collapsible-section-trigger')).toContain('aria-expanded="true"');
    expect(slotTag(html, 'collapsible-section-count')).not.toContain('aria-hidden');
    expect(html).toContain('>4</span>');
    expect(html).toContain('<p>row</p>');
  });

  test('a controlled open prop wins over defaultOpen', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Pending refunds" open={false} defaultOpen>
        <p>row</p>
      </CollapsibleSection>,
    );
    expect(slotTag(html, 'collapsible-section-trigger')).toContain('aria-expanded="false"');
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
    const count = slotTag(html, 'collapsible-section-count');
    expect(count).toContain('text-muted-foreground');
    expect(count).toContain('text-xs font-semibold tabular-nums');
    expect(count).toContain('shrink-0');
    expect(count).toContain('whitespace-nowrap');
    expect(count).not.toMatch(/\b(border|bg-|rounded)/);
    expect(slotTag(html, 'collapsible-section-title')).toContain('min-w-0');
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
    expect(slotTag(html, 'collapsible-section-count-detail')).toContain('text-destructive-text');
    expect(slotTag(html, 'collapsible-section-count')).toContain('text-muted-foreground');
    expect(slotTag(html, 'collapsible-section-count')).not.toContain('text-destructive-text');
  });

  test('passes its tone to CardCount: one tone class on the count', () => {
    const count = slotTokens(
      renderToStaticMarkup(
        <CollapsibleSection title="Payments to review" count={2} tone="warning" />,
      ),
      'collapsible-section-count',
    );
    expect(count).toContain('text-warning-text');
    expect(
      count.filter((c) => /^text-(muted-foreground|warning-text|destructive-text)$/.test(c)),
    ).toEqual(['text-warning-text']);
  });

  test('without a detail, the tone colours the whole count', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Failed payment captures" count={2} tone="critical" />,
    );
    const count = slotTag(html, 'collapsible-section-count');
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
    expect(slotTag(html, 'collapsible-section-heading').startsWith('<h3')).toBe(true);
  });

  test('reduced motion keeps the fades and drops the height', () => {
    const html = renderToStaticMarkup(<CollapsibleSection title="Notes" count={1} defaultOpen />);
    expect(slotTokens(html, 'collapsible-section-panel')).toContain(
      'motion-safe:transition-[height]',
    );
  });
  test('a disabled header shows no hover fill', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Pending refunds" disabled>
        <p>row</p>
      </CollapsibleSection>,
    );
    const trigger = slotTag(html, 'collapsible-section-trigger');
    expect(trigger).toContain('data-disabled');
    const classes = tagTokens(trigger);
    expect(classes).toContain('not-data-disabled:hover:bg-muted');
    expect(classes).not.toContain('hover:bg-muted');
  });

  test('the header fill and the chevron hover share one duration and ease', () => {
    const html = renderToStaticMarkup(<CollapsibleSection title="Pending refunds" />);
    const trigger = slotTag(html, 'collapsible-section-trigger');
    const chevron = tagTokens(html.match(/<svg[^>]*>/)?.[0] ?? '');
    expect(tagTokens(trigger)).toEqual(
      expect.arrayContaining(['duration-fast', 'ease-default']),
    );
    // One transition list: the turn on the height curve, colour and opacity
    // on the fill's timing.
    expect(chevron).toContain(
      '[transition:rotate_var(--transition-duration-slow)_var(--ease-height),color_var(--transition-duration-fast)_var(--ease-default),opacity_var(--transition-duration-fast)_var(--ease-default)]',
    );
  });

  test('the panel height and the chevron turn run on the height curve', () => {
    const html = renderToStaticMarkup(
      <CollapsibleSection title="Pending refunds" defaultOpen>
        <p>row</p>
      </CollapsibleSection>,
    );
    const chevron = tagTokens(html.match(/<svg[^>]*>/)?.[0] ?? '');
    expect(chevron).toContain(
      '[transition:rotate_var(--transition-duration-slow)_var(--ease-height),color_var(--transition-duration-fast)_var(--ease-default),opacity_var(--transition-duration-fast)_var(--ease-default)]',
    );
    expect(slotTokens(html, 'collapsible-section-panel')).toContain(
      'motion-safe:ease-height',
    );
  });
});
