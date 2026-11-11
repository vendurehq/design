import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { slotTag, tagTokens } from '../../test/slot-tokens.ts';
import { ElapsedTime } from './elapsed-time.tsx';

const START = new Date('2026-11-11T16:00:00Z');

describe('ElapsedTime', () => {
  test('a live count renders the fallback on the server, so hydration matches', () => {
    const markup = renderToString(<ElapsedTime since={START} />);
    expect(markup).toContain('—');
    expect(slotTag(markup, 'elapsed-time')).not.toContain('dateTime');
  });

  test('with until, the text is fixed and the same on the server', () => {
    const markup = renderToStaticMarkup(
      <ElapsedTime since={START} until={new Date(START.getTime() + 75_000)} />,
    );
    expect(markup).toContain('1m 15s');
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

  test('takes a custom format', () => {
    const markup = renderToStaticMarkup(
      <ElapsedTime
        since={START}
        until={START.getTime() + 5_000}
        format={(ms) => `${ms / 1000} sec`}
      />,
    );
    expect(markup).toContain('5 sec');
  });
});
