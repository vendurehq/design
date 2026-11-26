import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { Badge } from '@vendure-io/ui/components/atoms/badge';
import { Input } from '@vendure-io/ui/components/atoms/input';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from '@vendure-io/ui/components/atoms/input-group';
import { slotTag, slotTokens } from '../../test/slot-tokens';

// The radius and shadow freeze of design system v3 (OSS-1490): fields and
// buttons share the 8px control corner, and only the three named shadows are
// used.

const source = (file: string) => readFileSync(join(import.meta.dir, file), 'utf8');

describe('Input size', () => {
  test('default is 34px', () => {
    const html = renderToStaticMarkup(<Input aria-label="Name" />);
    expect(slotTag(html, 'input')).toContain('data-size="default"');
    expect(slotTokens(html, 'input')).toEqual(expect.arrayContaining(['h-8.5', 'data-[size=sm]:h-7']));
  });

  test('sm is 28px, the height of a small Button', () => {
    const html = renderToStaticMarkup(<Input aria-label="Search" size="sm" />);
    expect(slotTag(html, 'input')).toContain('data-size="sm"');
    expect(slotTag(html, 'input')).not.toMatch(/\ssize="/);
  });

  test('the native numeric size attribute is not accepted', () => {
    // @ts-expect-error size is "sm" | "default", not the native character count.
    const element = <Input aria-label="Name" size={20} />;
    expect(element).toBeTruthy();
  });
});

describe('InputGroup size', () => {
  const group = (size?: 'sm' | 'default') =>
    renderToStaticMarkup(
      <InputGroup size={size}>
        <InputGroupInput aria-label="Search" />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="xs">Go</InputGroupButton>
        </InputGroupAddon>
      </InputGroup>,
    );

  test('sm sets the group to 28px and the input follows it', () => {
    const html = group('sm');
    expect(slotTag(html, 'input-group')).toContain('data-size="sm"');
    expect(slotTokens(html, 'input-group')).toContain('data-[size=sm]:h-7');
    expect(slotTokens(html, 'input-group-control')).toContain('group-data-[size=sm]/input-group:h-7');
  });

  test('the input inside drops the field hairline: the group draws it', () => {
    const tokens = slotTokens(group(), 'input-group-control');
    expect(tokens).toEqual(expect.arrayContaining(['inset-ring-0', 'aria-invalid:inset-ring-0']));
  });

  test('an invalid control turns the group hairline destructive', () => {
    expect(slotTokens(group(), 'input-group')).toContain('has-[[data-slot][aria-invalid=true]]:inset-ring-destructive');
  });
});

describe('InputGroupButton', () => {
  const button = (size: 'xs' | 'sm' | 'icon-xs' | 'icon-sm') =>
    slotTokens(
      renderToStaticMarkup(
        <InputGroupButton size={size} aria-label="Go">
          Go
        </InputGroupButton>,
      ),
      'button',
    );

  test('xs and sm text is 12px, like a Button of the same size', () => {
    expect(button('xs')).toContain('text-xs');
    expect(button('sm')).toContain('text-xs');
  });

  // The corner is the field's 8px minus the gap to the field edge.
  test.each([
    ['xs', 'rounded-[calc(var(--radius-xl)-5px)]', 'group-data-[size=sm]/input-group:rounded-[calc(var(--radius-xl)-2px)]'],
    ['icon-xs', 'rounded-[calc(var(--radius-xl)-5px)]', 'group-data-[size=sm]/input-group:rounded-[calc(var(--radius-xl)-2px)]'],
    ['sm', 'rounded-[calc(var(--radius-xl)-3px)]', 'group-data-[size=sm]/input-group:rounded-xl'],
    ['icon-sm', 'rounded-[calc(var(--radius-xl)-3px)]', 'group-data-[size=sm]/input-group:rounded-xl'],
  ] as const)('%s nests its corner inside the field', (size, inDefault, inSmall) => {
    const tokens = button(size);
    expect(tokens).toContain(inDefault);
    expect(tokens).toContain(inSmall);
    expect(tokens).not.toContain('rounded-lg');
  });
});

describe('Radii', () => {
  test('a Badge is a pill', () => {
    const tokens = slotTokens(renderToStaticMarkup(<Badge>New</Badge>), 'badge');
    expect(tokens).toContain('rounded-full');
    expect(tokens).not.toContain('rounded-4xl');
  });

  test('the Checkbox and the chart legend keys use radius tokens, not px', () => {
    expect(source('checkbox.tsx')).toContain('rounded-md');
    expect(source('checkbox.tsx')).not.toContain('rounded-[4px]');
    expect(source('chart.tsx')).not.toContain('rounded-[2px]');
  });

  test('a combobox chip nests inside the 8px field', () => {
    expect(source('combobox.tsx')).toContain('rounded-[calc(var(--radius-xl)-5px)]');
  });

  test('the InputOTP ends follow the 8px field corner', () => {
    expect(source('input-otp.tsx')).toContain('first:rounded-s-xl');
    expect(source('input-otp.tsx')).toContain('last:rounded-e-xl');
  });
});

describe('Shadows', () => {
  test('no component uses a Tailwind shadow step', () => {
    for (const file of ['sidebar.tsx', 'navigation-menu.tsx', 'drawer.tsx', 'popover.tsx', 'dropdown-menu.tsx']) {
      expect({ file, match: source(file).match(/(?<![\w-])shadow-(?:2xs|xs|sm|md|lg|xl|2xl)\b/)?.[0] }).toEqual({ file, match: undefined });
    }
  });

  test('a floating sidebar lifts on shadow-control', () => {
    expect(source('sidebar.tsx')).toContain('group-data-[variant=floating]:shadow-control');
  });

});

describe('A small InputGroup with a textarea or a block addon grows', () => {
  test('size sm does not pin a multi-line group to 28px', () => {
    const tokens = slotTokens(renderToStaticMarkup(<InputGroup size="sm" />), 'input-group');
    for (const token of [
      'data-[size=sm]:has-[>textarea]:h-auto',
      'data-[size=sm]:has-[>[data-align=block-end]]:h-auto',
      'data-[size=sm]:has-[>[data-align=block-start]]:h-auto',
    ]) {
      expect(tokens).toContain(token);
    }
  });
});

// Nested corners follow outer - gap (gap = the parent's padding + border).
// An item inside a tight padded parent derives its corner from the parent's
// radius token, so it never hard-codes a role radius.
describe('Nested corners follow outer - gap', () => {
  const lib = (file: string) => readFileSync(join(import.meta.dir, '../../lib', file), 'utf8');
  const derived = (outer: string, gap: number) => `rounded-[calc(var(--radius-${outer})-${gap}px)]`;

  test.each([
    ['the menu item recipe (dropdown, menubar, breadcrumb menus)', () => lib('menu-item.tsx'), derived('2xl', 5)],
    ['context menu items', () => source('context-menu.tsx'), derived('2xl', 5)],
    ['menubar items', () => source('menubar.tsx'), derived('2xl', 5)],
    ['select items', () => source('select.tsx'), derived('2xl', 5)],
    ['combobox items', () => source('combobox.tsx'), derived('2xl', 4)],
    ['navigation menu links', () => source('navigation-menu.tsx'), derived('2xl', 8)],
    ['command palette items', () => source('command.tsx'), `in-data-command-palette:${derived('3xl', 8)}`],
    ['tabs triggers', () => source('tabs.tsx'), derived('lg', 3)],
  ] as const)('%s derive their corner', (_, code, token) => {
    expect(code()).toContain(token);
  });

  test('no menu item hard-codes a role radius', () => {
    const items = [lib('menu-item.tsx'), source('context-menu.tsx'), source('menubar.tsx'), source('select.tsx')]
      .join('\n')
      .split('\n')
      .filter((line) => line.includes('not-data-disabled:focus:bg-muted'));
    expect(items.length).toBeGreaterThan(0);
    for (const line of items) {
      expect(line).not.toMatch(/(?<![\w-])rounded-(?:sm|md|lg|xl|2xl)(?![\w-])/);
    }
  });

  test('the popups the items sit in have the padding the corners assume', () => {
    expect(source('dropdown-menu.tsx')).toMatch(/rounded-2xl p-1\.25/);
    expect(source('context-menu.tsx')).toMatch(/rounded-2xl p-1\.25/);
    expect(source('select.tsx')).toContain('className="p-1.25"');
    expect(source('navigation-menu.tsx')).toContain('p-2 pe-2.5');
    expect(source('tabs.tsx')).toContain('rounded-lg p-[3px]');
  });
});

describe('Every popup is a 12px surface', () => {
  test('the chart tooltip takes the popup radius', () => {
    expect(source('chart.tsx')).toMatch(/rounded-2xl[^"]*shadow-overlay/);
  });
});
