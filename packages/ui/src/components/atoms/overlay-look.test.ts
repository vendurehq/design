import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Floating content renders in a portal, which server rendering skips, so these
// checks read the atom source. The mounted checks (computed radius, shadow,
// item size, focus) live in stories/overlay-interactions.stories.tsx.

const source = (file: string) => readFileSync(join(import.meta.dir, file), 'utf8');

const floating = [
  'tooltip.tsx',
  'popover.tsx',
  'hover-card.tsx',
  'dropdown-menu.tsx',
  'context-menu.tsx',
  'select.tsx',
  'dialog.tsx',
  'alert-dialog.tsx',
];

describe('v3 overlay look', () => {
  for (const file of floating) {
    test(`${file} enters with opacity and scale`, () => {
      const code = source(file);
      expect(code).toContain('data-starting-style:opacity-0');
      expect(code).toMatch(/motion-safe:data-starting-style:scale-9[67]/);
      // The tooltip opens on a plain `ease`; everything else on the strong ease-out.
      expect(code).toContain(file === 'tooltip.tsx' ? 'ease-[ease]' : 'ease-(--ease-out)');
      // The keyframe entrance and its reduced-motion switch-off are gone:
      // reduced motion keeps the fade and drops only the scale.
      expect(code).not.toContain('animate-in');
      expect(code).not.toContain('motion-reduce:animate-none');
    });
  }

  for (const file of floating.filter((name) => name !== 'tooltip.tsx')) {
    test(`${file} floats on the overlay shadow, not a ring`, () => {
      const code = source(file);
      expect(code).toContain('shadow-overlay');
      expect(code).not.toContain('ring-foreground/10');
    });
  }

  test('menus, popovers and selects use the xl radius; dialogs use 2xl', () => {
    for (const file of ['popover.tsx', 'hover-card.tsx', 'dropdown-menu.tsx', 'context-menu.tsx', 'select.tsx']) {
      expect(source(file)).toContain('rounded-xl');
    }
    for (const file of ['dialog.tsx', 'alert-dialog.tsx']) {
      expect(source(file)).toContain('rounded-2xl');
    }
  });

  test('the tooltip has no arrow', () => {
    expect(source('tooltip.tsx')).not.toContain('TooltipPrimitive.Arrow');
  });

  test('destructive menu items read in destructive-text', () => {
    for (const file of ['dropdown-menu.tsx', 'context-menu.tsx']) {
      const code = source(file);
      expect(code).toContain('data-[variant=destructive]:text-destructive-text');
      expect(code).not.toContain('destructive-subtle-foreground');
    }
  });

  test('sheet and drawer slide on the drawer easing', () => {
    for (const file of ['sheet.tsx', 'drawer.tsx']) {
      const code = source(file);
      expect(code).toContain('ease-(--ease-drawer)');
      expect(code).toContain('bg-scrim');
      expect(code).not.toContain('ease-[cubic-bezier(0.32,0.72,0,1)]');
    }
  });

  test('the toaster defaults to bottom right on the 2xl radius, overlay shadow and a hairline', () => {
    const code = source('sonner.tsx');
    expect(code).toContain('position="bottom-right"');
    expect(code).toContain('var(--radius-2xl)');
    expect(code).toContain('shadow-[var(--shadow-overlay),inset_0_0_0_1px_var(--border)]!');
  });

  test('a toast is 44px, 10px 14px, 13px medium, 320px wide on the card surface', () => {
    const code = source('sonner.tsx');
    expect(code).toContain('min-h-11! gap-2.5! px-3.5! py-2.5! text-sm! font-medium!');
    expect(code).toContain('"--width": "320px"');
    expect(code).toContain('"--normal-bg": "var(--card)"');
  });

  test('the stack stays open: 8px gap, older toasts 3% smaller and 20% fainter', () => {
    const code = source('sonner.tsx');
    expect(code).toContain('expand\n');
    expect(code).toContain('gap={8}');
    expect(code).toContain('scale(calc(1-var(--index)*0.03))');
    expect(code).toContain('opacity-[calc(1-var(--index)*0.2)]!');
    expect(code).toContain('motion-reduce:[transition:opacity_220ms_ease]!');
  });

  test('the info icon is the brand mark', () => {
    expect(source('sonner.tsx')).toContain('<InfoIcon className="text-brand-indicator');
  });
});
