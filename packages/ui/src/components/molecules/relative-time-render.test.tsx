import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { IdChip } from './id-chip.tsx';
import { RelativeTime } from './relative-time.tsx';

const WHEN = new Date('2026-10-01T12:00:00Z');

function tag(html: string, slot: string): string {
  return html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? '';
}

describe('RelativeTime', () => {
  const render = (node: React.ReactElement) => renderToStaticMarkup(node);

  test('renders one root <time> with the absolute time as a hidden child description', () => {
    for (const html of [
      render(<RelativeTime value={WHEN} locale="en-US" />),
      render(<RelativeTime value={WHEN} locale="en-US" tooltip={false} />),
      render(<RelativeTime value={WHEN} locale="en-US" focusable />),
    ]) {
      expect(html.startsWith('<time')).toBe(true);
      expect(html.endsWith('</time>')).toBe(true);
      const id = tag(html, 'relative-time').match(/aria-describedby="([^"]+)"/)?.[1];
      expect(id).toBeTruthy();
      const description = html.match(new RegExp(`<span id="${id}" hidden="">([^<]*)</span>`));
      expect(description?.[1]).toContain('2026');
    }
  });

  test('never sets a native title', () => {
    for (const html of [
      render(<RelativeTime value={WHEN} />),
      render(<RelativeTime value={WHEN} tooltip={false} />),
      render(<RelativeTime value={WHEN} focusable />),
    ]) {
      expect(html).not.toContain('title=');
    }
  });

  test('is a tooltip trigger by default, with no tab stop', () => {
    const time = tag(render(<RelativeTime value={WHEN} />), 'relative-time');
    expect(time).toContain('data-base-ui-tooltip-trigger');
    expect(time).not.toContain('tabindex');
  });

  test('tooltip={false} renders a plain <time>', () => {
    const time = tag(render(<RelativeTime value={WHEN} tooltip={false} />), 'relative-time');
    expect(time).not.toContain('data-base-ui-tooltip-trigger');
    expect(time).not.toContain('tabindex');
  });

  test('focusable adds the tab stop and the focus ring', () => {
    const time = tag(render(<RelativeTime value={WHEN} focusable />), 'relative-time');
    expect(time).toContain('tabindex="0"');
    expect(time).toContain('focus-visible:ring-3');
  });

  test('keeps a consumer aria-describedby alongside its own', () => {
    const time = tag(
      render(<RelativeTime value={WHEN} aria-describedby="note" />),
      'relative-time',
    );
    expect(time).toMatch(/aria-describedby="note [^"]+"/);
  });
});

describe('IdChip full value', () => {
  test('a shortened chip has no native title and adds no tab stop', () => {
    const chip = tag(
      renderToStaticMarkup(<IdChip value="5c1f8b7e-2f3a-4c9d-9e21-8a7b6c5d4e3f" />),
      'id-chip',
    );
    expect(chip).not.toContain('title=');
    expect(chip).not.toContain('tabindex');
  });

  test('a chip showing the whole value renders no tooltip trigger', () => {
    const html = renderToStaticMarkup(<IdChip value="SB-2043" />);
    expect(html).not.toContain('title=');
    expect(html).not.toContain('data-slot="tooltip-trigger"');
  });
});
