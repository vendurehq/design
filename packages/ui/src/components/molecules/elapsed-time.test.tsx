import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { slotTag, tagTokens } from '../../test/slot-tokens.ts';
import { ElapsedTime } from './elapsed-time.tsx';
import { StatusBadge } from './status-badge.tsx';

const START = new Date('2026-11-11T16:00:00Z');

describe('ElapsedTime', () => {
  test('a live count renders the fallback on the server, so hydration matches', () => {
    const markup = renderToString(<ElapsedTime from={START} />);
    expect(markup).toContain('—');
    expect(slotTag(markup, 'elapsed-time')).not.toContain('dateTime');
  });

  // The text depends on the reader's locale even with `until`, so the server
  // renders the fallback; the browser renders are checked in the RelativeTime
  // "Server and browser" story.
  test('with until, the server renders the fallback and the ISO duration', () => {
    const markup = renderToStaticMarkup(
      <ElapsedTime from={START} to={new Date(START.getTime() + 75_000)} />,
    );
    expect(markup).toContain('>—</time>');
    expect(slotTag(markup, 'elapsed-time')).toContain('dateTime="PT1M15S"');
  });

  test('uses tabular numbers', () => {
    const tag = slotTag(renderToStaticMarkup(<ElapsedTime from={START} />), 'elapsed-time');
    expect(tagTokens(tag)).toContain('tabular-nums');
  });

  test('invalid input renders the fallback', () => {
    expect(renderToStaticMarkup(<ElapsedTime from="not a date" fallback="n/a" />)).toContain('n/a');
    expect(renderToStaticMarkup(<ElapsedTime from={null} />)).toContain('—');
  });

  test('has no tooltip by default', () => {
    const tag = slotTag(renderToStaticMarkup(<ElapsedTime from={START} />), 'elapsed-time');
    expect(tag).not.toContain('data-base-ui-tooltip-trigger');
    expect(tag).not.toContain('aria-describedby');
  });

  test('tooltip links a description, empty on the server', () => {
    const markup = renderToString(<ElapsedTime from={START} tooltip locale="en-US" />);
    const tag = slotTag(markup, 'elapsed-time');
    expect(tag).toContain('data-base-ui-tooltip-trigger');
    const id = tag.match(/aria-describedby="([^"]+)"/)?.[1];
    expect(markup).toContain(`<span id="${id}" hidden=""></span>`);
    expect(markup).toContain('—');
  });

  test('under a status label it is a tab stop by default', () => {
    const inDetail = (time: React.ReactElement) =>
      slotTag(
        renderToStaticMarkup(
          <StatusBadge appearance="icon" detail={time}>
            Building
          </StatusBadge>,
        ),
        'elapsed-time',
      );
    expect(inDetail(<ElapsedTime from={START} tooltip />)).toContain('tabindex="0"');
    expect(inDetail(<ElapsedTime from={START} tooltip focusable={false} />)).not.toContain(
      'tabindex',
    );
    // Without a tooltip there is nothing to open.
    expect(inDetail(<ElapsedTime from={START} />)).not.toContain('tabindex');
  });
});

describe('ElapsedTime while the start is not known', () => {
  test('undefined renders a one-line skeleton, also on the server', () => {
    const markup = renderToString(<ElapsedTime from={undefined} />);

    expect(markup).toMatch(/^<span data-slot="elapsed-time" aria-busy="true"/);
    expect(markup).toContain('data-skeleton="line"');
    expect(markup).toContain('<span class="sr-only">Loading duration</span>');
    expect(markup).not.toContain('—');
    // As wide as "1m 15s".
    expect(markup).toContain('width:6ch');
  });

  test('an invalid locale or a throwing format still renders the skeleton', () => {
    const fails = () => {
      throw new Error('format failed');
    };
    for (const node of [
      <ElapsedTime key="locale" from={undefined} locale="not a locale!" />,
      <ElapsedTime key="format" from={undefined} format={fails} />,
    ]) {
      expect(renderToStaticMarkup(node)).toContain('width:6ch');
    }
  });

  test('to={null} and to={undefined} mean a live count, not loading', () => {
    for (const to of [null, undefined]) {
      const markup = renderToStaticMarkup(<ElapsedTime from={START} to={to} />);
      expect(markup).not.toContain('aria-busy');
      expect(markup).toMatch(/^<time data-slot="elapsed-time"/);
    }
  });

  test('null renders the fallback', () => {
    expect(renderToStaticMarkup(<ElapsedTime from={null} />)).toContain('>—</time>');
  });
});
