import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { slotTag, tagTokens } from '../../test/slot-tokens.ts';
import { ElapsedTime } from './elapsed-time.tsx';
import { FormatProvider } from './format-provider.tsx';
import { StatusBadge } from './status-badge.tsx';

const START = new Date('2026-11-11T16:00:00Z');

describe('ElapsedTime', () => {
  test('a live count renders the fallback on the server, so hydration matches', () => {
    const markup = renderToString(<ElapsedTime since={START} />);
    expect(markup).toContain('—');
    expect(slotTag(markup, 'elapsed-time')).not.toContain('dateTime');
  });

  // The text depends on the reader's locale even with `until`, so the server
  // renders the fallback; the browser renders are checked in the RelativeTime
  // "Server and browser" story.
  test('with until, the server renders the fallback and the ISO duration', () => {
    const markup = renderToStaticMarkup(
      <ElapsedTime since={START} until={new Date(START.getTime() + 75_000)} />,
    );
    expect(markup).toContain('>—</time>');
    expect(slotTag(markup, 'elapsed-time')).toContain('dateTime="PT1M15S"');
  });

  test('uses tabular numbers', () => {
    const tag = slotTag(renderToStaticMarkup(<ElapsedTime since={START} />), 'elapsed-time');
    expect(tagTokens(tag)).toContain('tabular-nums');
  });

  test('invalid input renders the fallback', () => {
    expect(renderToStaticMarkup(<ElapsedTime since="not a date" fallback="n/a" />)).toContain(
      'n/a',
    );
    expect(renderToStaticMarkup(<ElapsedTime since={null} />)).toContain('—');
  });

  test('has no tooltip by default', () => {
    const tag = slotTag(renderToStaticMarkup(<ElapsedTime since={START} />), 'elapsed-time');
    expect(tag).not.toContain('data-base-ui-tooltip-trigger');
    expect(tag).not.toContain('aria-describedby');
  });

  test('tooltip links a description, empty on the server', () => {
    const markup = renderToString(<ElapsedTime since={START} tooltip locale="en-US" />);
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
    expect(inDetail(<ElapsedTime since={START} tooltip />)).toContain('tabindex="0"');
    expect(inDetail(<ElapsedTime since={START} tooltip focusable={false} />)).not.toContain(
      'tabindex',
    );
    // Without a tooltip there is nothing to open.
    expect(inDetail(<ElapsedTime since={START} />)).not.toContain('tabindex');
  });

  test("counts in the reader's locale, from the FormatProvider", () => {
    const until = START.getTime() + 75_000;
    const english = renderToStaticMarkup(
      <FormatProvider locale="en-US">
        <ElapsedTime since={START} until={until} />
      </FormatProvider>,
    );
    expect(english).toContain('>1m 15s</time>');
    const arabic = renderToStaticMarkup(
      <FormatProvider locale="ar-EG">
        <ElapsedTime since={START} until={until} />
      </FormatProvider>,
    );
    expect(arabic).toContain('١٥');
    expect(
      renderToStaticMarkup(<ElapsedTime since={START} until={until} locale="ar-EG" />),
    ).toContain('١٥');
  });
});
