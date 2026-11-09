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
      // The tooltip opens on ease-soft (the CSS `ease`); everything else on the strong ease-out.
      expect(code).toContain(file === 'tooltip.tsx' ? 'ease-soft' : 'ease-(--ease-out)');
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

  // One highlight for every menu-like list, so the same list looks the same
  // whichever component opens it. Destructive items keep their own fill.
  test('every menu highlights items and open submenu triggers with the muted fill', () => {
    const highlight = {
      'dropdown-menu.tsx': 'focus:bg-muted',
      'context-menu.tsx': 'focus:bg-muted',
      'menubar.tsx': 'focus:bg-muted',
      'select.tsx': 'focus:bg-muted',
      'combobox.tsx': 'data-highlighted:bg-muted',
      'command.tsx': 'data-[selected=true]:bg-muted',
    };
    for (const [file, token] of Object.entries(highlight)) {
      const code = source(file);
      expect(code).toContain(token);
      expect(code).not.toMatch(/(?:focus|data-highlighted|data-open|data-popup-open|data-\[selected=true\]):bg-accent\b/);
      expect(code).not.toMatch(/"bg-accent /);
    }
    for (const file of ['dropdown-menu.tsx', 'context-menu.tsx']) {
      expect(source(file)).toContain('data-popup-open:bg-muted');
    }
  });

  test('a dropdown menu is at least 240px wide', () => {
    expect(source('dropdown-menu.tsx')).toContain('min-w-60');
  });

  test('destructive menu items hover with a 10% destructive tint in both themes', () => {
    for (const file of ['dropdown-menu.tsx', 'context-menu.tsx']) {
      const code = source(file);
      expect(code).toContain('data-[variant=destructive]:focus:bg-destructive/10');
      expect(code).not.toContain('dark:data-[variant=destructive]:focus:bg-destructive/20');
    }
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

  test('the toast has one edge: no border between the shadow ring and the hairline', () => {
    const code = source('sonner.tsx');
    expect(code).toContain('"border-0! shadow-[var(--shadow-overlay),inset_0_0_0_1px_var(--border)]!"');
    expect(code).not.toContain('"--normal-border"');
  });

  test('the icon sits 14px in and 10px from the text, 20px from the corner', () => {
    const code = source('sonner.tsx');
    for (const name of ['icon-margin-start', 'icon-margin-end', 'svg-margin-start', 'svg-margin-end']) {
      expect(code).toContain(`"--toast-${name}": "0px"`);
    }
    expect(code).toContain('offset={20}');
    expect(code).toContain('icon: "text-foreground/60"');
  });

  test("the tone icons take the tokens, not Sonner's colours of the same name", () => {
    const code = source('sonner.tsx');
    for (const tone of ['success', 'warning', 'info']) {
      expect(code).toContain(`"--toaster-${tone}-text": "var(--${tone}-text)"`);
      expect(code).toContain(`"--${tone}-text": "var(--toaster-${tone}-text)"`);
    }
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
