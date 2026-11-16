import { expect, test } from 'bun:test';
import { dialogPaddingStyle, paddingFromClassName } from './dialog-padding.ts';

test('a p-* or px-* class gives the dialog padding as CSS', () => {
  expect(paddingFromClassName('p-0')).toBe('0px');
  expect(paddingFromClassName('sm:max-w-lg p-4')).toBe('calc(var(--spacing) * 4)');
  expect(paddingFromClassName('px-2.5')).toBe('calc(var(--spacing) * 2.5)');
  expect(paddingFromClassName('p-px')).toBe('1px');
  expect(paddingFromClassName('p-[24px]')).toBe('24px');
  expect(paddingFromClassName('p-[calc(1rem_+_2px)]')).toBe('calc(1rem + 2px)');
  expect(paddingFromClassName('p-(--gap)')).toBe('var(--gap)');
  expect(paddingFromClassName('!p-0')).toBe('0px');
  expect(paddingFromClassName('p-0!')).toBe('0px');
});

test('the last padding class wins, as in tailwind-merge', () => {
  expect(paddingFromClassName('p-6 p-0')).toBe('0px');
});

test('other classes and variants set nothing', () => {
  for (const className of [
    '',
    'py-0',
    'pt-4',
    'sm:p-0',
    'gap-0',
    '[--dialog-padding:0px]',
    'pe-2',
  ]) {
    expect(paddingFromClassName(className)).toBeUndefined();
  }
  expect(paddingFromClassName(undefined)).toBeUndefined();
});

test('dialogPaddingStyle keeps the caller style and adds the variable', () => {
  expect(dialogPaddingStyle('gap-2', { color: 'red' })).toEqual({ color: 'red' });
  expect(dialogPaddingStyle('p-0', { color: 'red' })).toEqual({
    '--dialog-padding': '0px',
    color: 'red',
  } as never);
  const fromState = dialogPaddingStyle('p-0', (state: { open: boolean }) => ({
    opacity: state.open ? 1 : 0,
  }));
  expect(typeof fromState === 'function' && fromState({ open: true })).toEqual({
    '--dialog-padding': '0px',
    opacity: 1,
  } as never);
});
