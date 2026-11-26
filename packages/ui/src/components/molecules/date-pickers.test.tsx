import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { DatePicker } from './date-picker.tsx';
import { DateRangePicker } from './date-range-picker.tsx';
import { DateTimePicker } from './date-time-picker.tsx';

describe('uncontrolled date pickers', () => {
  test('DatePicker shows its defaultValue', () => {
    const html = renderToStaticMarkup(<DatePicker defaultValue="2026-03-10" name="start" />);
    expect(html).toContain('Mar 10, 2026');
    expect(html).toContain('value="2026-03-10"');
  });

  test('DatePicker: value wins, and an explicit undefined value stays controlled and empty', () => {
    expect(
      renderToStaticMarkup(<DatePicker value="2026-04-02" defaultValue="2026-03-10" />),
    ).toContain('Apr 2, 2026');
    const html = renderToStaticMarkup(<DatePicker value={undefined} defaultValue="2026-03-10" />);
    expect(html).toContain('Pick a date');
    expect(html).not.toContain('Mar 10, 2026');
  });

  test('DateTimePicker shows its defaultValue', () => {
    const html = renderToStaticMarkup(<DateTimePicker defaultValue="2026-03-10T12:00:00.000Z" />);
    expect(html).toContain('Mar 10, 2026');
    expect(html).not.toContain('Pick a date and time');
  });

  test('DateRangePicker shows its defaultValue', () => {
    const html = renderToStaticMarkup(
      <DateRangePicker defaultValue={{ from: '2026-03-10', to: '2026-03-17' }} />,
    );
    expect(html).toContain('Mar 10');
    expect(html).not.toContain('Pick a date range');
  });
});

describe('date pickers take size="sm"', () => {
  const cases = [
    ['DatePicker', <DatePicker key="d" size="sm" defaultValue="2026-03-10" />],
    [
      'DateTimePicker',
      <DateTimePicker key="t" size="sm" defaultValue="2026-03-10T12:00:00.000Z" />,
    ],
    [
      'DateRangePicker',
      <DateRangePicker key="r" size="sm" defaultValue={{ from: '2026-03-10', to: '2026-03-17' }} />,
    ],
  ] as const;

  test.each(cases)('%s: a 28px trigger and a 24px clear button', (_, element) => {
    const html = renderToStaticMarkup(element);
    expect(html).toContain('data-size="sm"');
    expect(html).toMatch(/aria-haspopup="dialog"[^>]*class="[^"]*\bh-7\b/);
    expect(html).toContain('size-6');
  });

  test('the default size keeps the 34px trigger', () => {
    const html = renderToStaticMarkup(<DatePicker defaultValue="2026-03-10" />);
    expect(html).toContain('data-size="default"');
    expect(html).not.toMatch(/\bh-7\b/);
  });

  test('DateTimePicker passes the size to its time field', () => {
    const html = renderToStaticMarkup(
      <DateTimePicker size="sm" defaultValue="2026-03-10T12:00:00.000Z" />,
    );
    expect(html).toMatch(
      /<input[^>]*type="time"[^>]*data-size="sm"|<input[^>]*data-size="sm"[^>]*type="time"/,
    );
  });

  test('size accepts only "sm" or "default"', () => {
    // @ts-expect-error A numeric size is not a picker size.
    renderToStaticMarkup(<DatePicker size={3} />);
  });
});
