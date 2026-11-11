import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTag } from '../../test/slot-tokens.ts';
import { IdChip } from './id-chip.tsx';
import { RelativeTime } from './relative-time.tsx';
import { StatusBadge } from './status-badge.tsx';

const WHEN = new Date('2026-10-01T12:00:00Z');

describe('RelativeTime', () => {
  const render = (node: React.ReactElement) => renderToStaticMarkup(node);

  // The text and the description need the reader's clock, so the server
  // renders the fallback and an empty description. The browser renders are
  // checked in the RelativeTime "Server and browser" story.
  test('renders one root <time> with a hidden child description, empty on the server', () => {
    for (const html of [
      render(<RelativeTime value={WHEN} locale="en-US" />),
      render(<RelativeTime value={WHEN} locale="en-US" tooltip={false} />),
      render(<RelativeTime value={WHEN} locale="en-US" focusable />),
    ]) {
      expect(html.startsWith('<time')).toBe(true);
      expect(html.endsWith('</time>')).toBe(true);
      const id = slotTag(html, 'relative-time').match(/aria-describedby="([^"]+)"/)?.[1];
      expect(id).toBeTruthy();
      expect(html).toContain(`<span id="${id}" hidden=""></span>`);
      expect(html).toContain('>—<span');
      expect(html).not.toContain('suppressHydrationWarning');
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
    const time = slotTag(render(<RelativeTime value={WHEN} />), 'relative-time');
    expect(time).toContain('data-base-ui-tooltip-trigger');
    expect(time).not.toContain('tabindex');
  });

  test('tooltip={false} renders a plain <time>', () => {
    const time = slotTag(render(<RelativeTime value={WHEN} tooltip={false} />), 'relative-time');
    expect(time).not.toContain('data-base-ui-tooltip-trigger');
    expect(time).not.toContain('tabindex');
  });

  test('focusable adds the tab stop and the focus ring', () => {
    const time = slotTag(render(<RelativeTime value={WHEN} focusable />), 'relative-time');
    expect(time).toContain('tabindex="0"');
    expect(time).toContain('focus-visible:outline-2');
    expect(time).toContain('focus-visible:outline-offset-2');
    expect(time).toContain('focus-visible:outline-ring');
  });

  test('keeps a consumer aria-describedby alongside its own', () => {
    const time = slotTag(
      render(<RelativeTime value={WHEN} aria-describedby="note" />),
      'relative-time',
    );
    expect(time).toMatch(/aria-describedby="note [^"]+"/);
  });
});

describe('IdChip full value', () => {
  test('a shortened chip has no native title and adds no tab stop', () => {
    const chip = slotTag(
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

describe('RelativeTime display, start and tooltip content on the server', () => {
  const render = (node: React.ReactElement) => renderToStaticMarkup(node);

  test('the server renders the fallback for every display', () => {
    for (const html of [
      render(<RelativeTime value={WHEN} display="duration" />),
      render(<RelativeTime value={WHEN} start={WHEN.getTime() - 42_000} />),
      render(<RelativeTime value={WHEN} tooltip="Deployed by Ana" />),
      render(<RelativeTime value={WHEN} fallback="soon" />),
    ]) {
      expect(slotTag(html, 'relative-time')).toContain(`dateTime="${WHEN.toISOString()}"`);
      expect(html).not.toContain('ago');
      expect(html).not.toContain('Deployed by Ana');
    }
    expect(render(<RelativeTime value={WHEN} fallback="soon" />)).toContain('>soon<span');
  });

  test('under a status label it is a tab stop by default', () => {
    const inDetail = (time: React.ReactElement) =>
      slotTag(
        render(
          <StatusBadge appearance="icon" detail={time}>
            Ready
          </StatusBadge>,
        ),
        'relative-time',
      );
    expect(inDetail(<RelativeTime value={WHEN} />)).toContain('tabindex="0"');
    expect(inDetail(<RelativeTime value={WHEN} focusable={false} />)).not.toContain('tabindex');
    expect(inDetail(<RelativeTime value={WHEN} tooltip={false} />)).not.toContain('tabindex');
  });
});
