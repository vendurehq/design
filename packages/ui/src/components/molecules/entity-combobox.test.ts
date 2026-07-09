import { expect, test } from 'bun:test';
import { itemFilter } from './entity-combobox.tsx';

test('EntityCombobox filters labels and explicit keywords', () => {
  const item = {
    value: 'org_123',
    label: 'Nordic Supply Co',
    keywords: ['nordic.example', 'Vienna'],
  };
  expect(itemFilter(item, 'supply')).toBe(true);
  expect(itemFilter({ ...item, description: 'Primary account' }, 'account')).toBe(true);
  expect(itemFilter(item, 'vienna')).toBe(true);
  expect(itemFilter(item, 'berlin')).toBe(false);
});
