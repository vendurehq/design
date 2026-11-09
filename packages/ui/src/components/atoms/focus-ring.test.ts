import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// The v3 focus ring: a 2px solid `ring` outline on focus-visible. An outline
// never changes the box, so the ring never shifts layout. Controls take it
// 2px outside their edge; rows and items inside lists, menus, tables and scroll
// boxes take it 2px inside, where an outside ring would be clipped. Several
// parts render in a portal or need a browser, so these checks read the source.

const fieldRecipe = readFileSync(join(import.meta.dir, '../../lib/field-surface.ts'), 'utf8');
// A field that uses the shared field recipe is read together with it.
const source = (file: string) => {
  const code = readFileSync(join(import.meta.dir, '..', file), 'utf8');
  return code.includes('fieldSurface') ? `${code}\n${fieldRecipe}` : code;
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
  'molecules/arrow-link.tsx',
  'molecules/relative-time.tsx',
  'molecules/skip-link.tsx',
  'molecules/data-table/data-table-filters.tsx',
];

const inset = [
  // The v3 field: the ring sits inside the tinted field, over its hairline.
  'atoms/input.tsx',
  'atoms/textarea.tsx',
  'atoms/native-select.tsx',
  'atoms/combobox.tsx',
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
    for (const file of ['atoms/input.tsx', 'atoms/textarea.tsx', 'atoms/select.tsx']) {
      const code = source(file);
      expect(code).toContain('aria-invalid:shadow-[inset_0_0_0_1px_var(--destructive)]');
      expect(code).toContain('aria-invalid:focus-visible:outline-destructive');
    }
  });

  test('no part keeps the retired halo ring', () => {
    const files = [...new Set([...outset, ...inset, 'atoms/sidebar.tsx', 'atoms/calendar.tsx', 'molecules/file-dropzone.tsx'])];
    for (const file of files) {
      const code = source(file);
      for (const token of retired) expect({ file, token, found: code.includes(token) }).toEqual({ file, token, found: false });
    }
  });
});
