import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { IdChip } from './id-chip.tsx';
import { RelativeTime } from './relative-time.tsx';

const WHEN = new Date('2026-10-01T12:00:00Z');

function tag(html: string, slot: string): string {
  return html.match(new RegExp(`<[^>]*data-slot="${slot}"[^>]*>`))?.[0] ?? '';
}

describe('RelativeTime', () => {
  test('describes the time with the absolute value, not a native title', () => {
    const html = renderToStaticMarkup(<RelativeTime value={WHEN} locale="en-US" />);
    const time = tag(html, 'relative-time');
    expect(time).not.toContain('title=');
    const id = time.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(id).toBeTruthy();
    const description = html.match(new RegExp(`<span id="${id}" hidden="">([^<]*)</span>`));
    expect(description?.[1]).toContain('2026');
  });

  test('adds no tab stop by default', () => {
    expect(tag(renderToStaticMarkup(<RelativeTime value={WHEN} />), 'relative-time')).not.toContain(
      'tabindex',
    );
  });

  test('tooltip makes the time a focusable trigger and keeps the description', () => {
    const time = tag(renderToStaticMarkup(<RelativeTime value={WHEN} tooltip />), 'relative-time');
    expect(time).toContain('tabindex="0"');
    expect(time).toContain('aria-describedby=');
    expect(time).not.toContain('title=');
  });

  test('keeps a consumer aria-describedby alongside its own', () => {
    const time = tag(
      renderToStaticMarkup(<RelativeTime value={WHEN} aria-describedby="note" />),
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
