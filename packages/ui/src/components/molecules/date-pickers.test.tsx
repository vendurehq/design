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
