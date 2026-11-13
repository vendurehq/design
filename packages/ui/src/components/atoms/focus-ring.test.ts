import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fieldNames, fieldTokens } from '../../test/fields';

// The v3 focus ring: a 2px solid `ring` outline on focus-visible. An outline
// never changes the box, so the ring never shifts layout. Controls take it
// 2px outside their edge; rows and items inside lists, menus, tables and scroll
// boxes take it 2px inside, where an outside ring would be clipped. Several
// parts render in a portal or need a browser, so most checks read the source;
// the fields render, so the checks read the classes they end up with.

// A menu that takes the shared item recipe is read together with it.
const menuItemRecipe = readFileSync(join(import.meta.dir, '../../lib/menu-item.tsx'), 'utf8');
const source = (file: string) => {
  const code = readFileSync(join(import.meta.dir, '..', file), 'utf8');
  return code.includes('lib/menu-item.tsx') ? `${code}\n${menuItemRecipe}` : code;
};

const OUTSET = ['focus-visible:outline-solid', 'focus-visible:outline-2', 'focus-visible:outline-offset-2'];
const INSET = ['focus-visible:outline-solid', 'focus-visible:outline-2', 'focus-visible:-outline-offset-2'];

const outset = [
  'atoms/button.tsx',
  'atoms/badge.tsx',
  'atoms/checkbox.tsx',
  'atoms/radio-group.tsx',
  'atoms/switch.tsx',
  'atoms/toggle.tsx',
  'atoms/slider.tsx',
  'atoms/resizable.tsx',
  'atoms/navigation-menu.tsx',
  'molecules/direction-link.tsx',
  // RelativeTime and ElapsedTime draw it through their shared tooltip trigger.
  'molecules/time-tooltip.tsx',
  'molecules/skip-link.tsx',
  'molecules/data-table/data-table-filters.tsx',
];

// The v3 field draws its ring inside, over its hairline: see the rendered
// field checks below.
const fieldFiles = ['atoms/input.tsx', 'atoms/textarea.tsx', 'atoms/native-select.tsx', 'atoms/combobox.tsx', 'atoms/input-group.tsx'];

const inset = [
  'atoms/accordion.tsx',
  'atoms/tabs.tsx',
  'atoms/item.tsx',
  'atoms/table.tsx',
  'atoms/scroll-area.tsx',
  'atoms/navigation-menu.tsx',
  'atoms/dropdown-menu.tsx',
  'atoms/context-menu.tsx',
  'atoms/menubar.tsx',
  'atoms/select.tsx',
  'molecules/collapsible-section.tsx',
  'molecules/chip.tsx',
];

// The pre-v3 patterns: a 3px translucent box-shadow halo plus a ring-coloured
// border, which moved the border colour and stacked on other shadows.
const retired = [
  'focus-visible:ring-3',
  'focus-visible:ring-[3px]',
  'focus-visible:ring-2',
  'focus-visible:ring-ring',
  'focus-visible:border-ring',
  'focus-within:ring-3',
  'focus-within:border-ring',
  'peer-focus-visible:ring-3',
  'ring-sidebar-ring',
];

describe('v3 focus ring', () => {
  for (const file of outset) {
    test(`${file} draws the ring 2px outside`, () => {
      const code = source(file);
      for (const token of OUTSET) expect(code).toContain(token);
      expect(code).toContain('focus-visible:outline-ring');
    });
  }

  for (const file of inset) {
    test(`${file} draws the ring 2px inside`, () => {
      const code = source(file);
      for (const token of INSET) expect(code).toContain(token);
      expect(code).toContain('focus-visible:outline-ring');
    });
  }

  // Rendered, so a class that overrides the field recipe's ring fails.
  for (const name of fieldNames) {
    test(`${name} draws the ring 2px inside, over its hairline`, () => {
      const tokens = fieldTokens(name);
      for (const token of [...INSET, 'focus-visible:outline-ring']) expect({ name, token, rendered: tokens.includes(token) }).toEqual({ name, token, rendered: true });
    });
  }

  test('sidebar items, labels and actions take the inset ring in the sidebar ring slot', () => {
    const code = source('atoms/sidebar.tsx');
    for (const token of INSET) expect(code).toContain(token);
    expect(code).toContain('focus-visible:outline-sidebar-ring');
  });

  test('ListRow rings the whole row, inside, when its link has keyboard focus', () => {
    const code = source('molecules/list-row.tsx');
    expect(code).toContain('has-[[data-slot=list-row-link]:focus-visible]:outline-2');
    expect(code).toContain('has-[[data-slot=list-row-link]:focus-visible]:-outline-offset-2');
    expect(code).toContain('has-[[data-slot=list-row-link]:focus-visible]:outline-ring');
  });

  test('InputGroup rings the group, not the bare control inside it', () => {
    const code = source('atoms/input-group.tsx');
    expect(code).toContain('has-[[data-slot=input-group-control]:focus-visible]:outline-2');
    expect(code).toContain('has-[[data-slot=input-group-control]:focus-visible]:-outline-offset-2');
    expect(code).toContain('focus-visible:outline-none');
  });

  test('invalid fields keep the destructive edge and turn the ring destructive', () => {
    for (const file of ['atoms/checkbox.tsx', 'atoms/button.tsx']) {
      const code = source(file);
      expect(code).toContain('aria-invalid:border-destructive');
      expect(code).toContain('aria-invalid:focus-visible:outline-destructive');
    }
    // Fields have no border: their hairline is an inset shadow, so invalid
    // swaps the shadow colour.
    for (const name of ['Input', 'Textarea', 'Select'] as const) {
      const tokens = fieldTokens(name);
      expect(tokens).toContain('aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)]');
      expect(tokens).toContain('aria-invalid:focus-visible:outline-destructive');
    }
  });

  test('the theme gives every other focusable element the 2px ring at a 2px offset', () => {
    const theme = readFileSync(join(import.meta.dir, '../../../../design-tokens/src/css/theme.css'), 'utf8');
    const rule = theme.match(/:focus-visible\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toContain('outline: 2px solid var(--ring)');
    expect(rule).toContain('outline-offset: 2px');
  });

  test('CodeBlock rings its scrolling code inside, where the card would clip an outside ring', () => {
    const code = source('molecules/code-block.tsx');
    expect(code).toContain('[&_pre:focus-visible]:outline-2');
    expect(code).toContain('[&_pre:focus-visible]:-outline-offset-2');
    expect(code).toContain('[&_pre:focus-visible]:outline-ring');
  });

  test('no part keeps the retired halo ring', () => {
    const files = [...new Set([...outset, ...inset, ...fieldFiles, 'atoms/sidebar.tsx', 'atoms/calendar.tsx', 'molecules/file-dropzone.tsx'])];
    for (const file of files) {
      const code = source(file);
      for (const token of retired) expect({ file, token, found: code.includes(token) }).toEqual({ file, token, found: false });
    }
  });
});
