import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { ComboboxFreeText } from './combobox-free-text.tsx';

const SPINNER = 'aria-label="Loading"';

function render(props: { isLoading?: boolean; loading?: boolean }) {
  return renderToStaticMarkup(
    <ComboboxFreeText value="" onValueChange={() => {}} items={[]} {...props} />,
  );
}

test('isLoading shows the spinner', () => {
  expect(render({ isLoading: true })).toContain(SPINNER);
  expect(render({})).not.toContain(SPINNER);
});

test('the deprecated loading prop still shows the spinner', () => {
  expect(render({ loading: true })).toContain(SPINNER);
});

test('isLoading wins over the deprecated loading prop', () => {
  expect(render({ isLoading: false, loading: true })).not.toContain(SPINNER);
});
