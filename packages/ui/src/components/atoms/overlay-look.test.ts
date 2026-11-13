import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

// Floating content renders in a portal, which server rendering skips, so these
// checks read the atom source. The mounted checks (computed radius, shadow,
// item size, focus, motion) live in stories/overlay-interactions.stories.tsx.
// A popup that takes the shared popup recipe is checked there, on the
// transition it computes, so a class that overrides the recipe fails.

// A menu that takes the shared item recipe is read together with it.
const menuItemRecipe = readFileSync(join(import.meta.dir, '../../lib/menu-item.tsx'), 'utf8');
const source = (file: string) => {
  const code = readFileSync(join(import.meta.dir, file), 'utf8');
  return code.includes('lib/menu-item.tsx') ? `${code}\n${menuItemRecipe}` : code;
};
const recipe = readFileSync(join(import.meta.dir, '../../lib/popup-motion.ts'), 'utf8');
const stories = readFileSync(join(import.meta.dir, '../../../stories/overlay-interactions.stories.tsx'), 'utf8');

const floating = [
  'tooltip.tsx',
  'popover.tsx',
  'hover-card.tsx',
  'dropdown-menu.tsx',
  'context-menu.tsx',
  'select.tsx',
  'combobox.tsx',
  'navigation-menu.tsx',
  'dialog.tsx',
  'alert-dialog.tsx',
];

// Popups that open from a trigger, like the v3-look menu.
const popups = [
  'dropdown-menu.tsx',
  'context-menu.tsx',
  'select.tsx',
  'combobox.tsx',
  'popover.tsx',
  'hover-card.tsx',
  'navigation-menu.tsx',
];

// The popups whose motion the recipe gives.
const recipeUsers = floating.filter((file) => source(file).includes('popupMotion'));

describe('v3 overlay look', () => {
  for (const file of floating.filter((name) => !recipeUsers.includes(name))) {
    test(`${file} enters with opacity and scale`, () => {
      const code = source(file);
      expect(code).toContain('data-starting-style:opacity-0');
      expect(code).toMatch(/motion-safe:data-starting-style:scale-9[67]/);
      // The tooltip opens on ease-soft (the CSS `ease`); everything else on the strong ease-out.
      expect(code).toContain(file === 'tooltip.tsx' ? 'ease-soft' : 'ease-out');
      // The keyframe entrance and its reduced-motion switch-off are gone:
      // reduced motion keeps the fade and drops only the scale.
      expect(code).not.toContain('animate-in');
      expect(code).not.toContain('motion-reduce:animate-none');
    });
  }

  // Each recipe user has a story that opens it and checks the computed motion.
  for (const file of recipeUsers) {
    test(`${file} has a story that checks its popup motion`, () => {
      const name = file.replace('.tsx', '').replace(/(^|-)(\w)/g, (_, __, letter: string) => letter.toUpperCase());
      const story = stories.match(new RegExp(`export const ${name}Look: Story = \\{[\\s\\S]*?\\n\\};`))?.[0] ?? '';
      expect(story).toContain('expectPopupMotion(');
    });
  }

  for (const file of floating.filter((name) => name !== 'tooltip.tsx')) {
    test(`${file} floats on the overlay shadow, not a ring`, () => {
      const code = source(file);
      expect(code).toContain('shadow-overlay');
      expect(code).not.toContain('ring-foreground/10');
    });
  }

  // Other content that floats above the page: the same surface and edge as a
  // popup, with no motion or radius rule of its own.
  for (const file of ['chart.tsx', 'sheet.tsx']) {
    test(`${file} floats on the overlay shadow, not a border or a ring`, () => {
      const code = source(file);
      const floatingClasses = code.split('\n').find((line) => line.includes('shadow-overlay')) ?? '';
      expect(floatingClasses).not.toBe('');
      expect(floatingClasses).not.toMatch(/(^|[\s"':])(border|ring)(-[trblxy])?(-\d+)?(?=[\s"'])/);
      expect(code).not.toContain('ring-foreground/10');
    });
  }

  for (const file of popups) {
    test(`${file} opens like the v3-look menu`, () => {
      expect(source(file)).toContain('popupMotion');
      expect(source(file)).not.toContain('ring-foreground/10');
    });
  }

  test('the popup recipe: opacity 160ms, scale and translate 200ms from 2px away, closes in 120ms', () => {
    for (const token of [
      'origin-(--transform-origin)',
      'transition-[opacity,scale,translate]',
      '[transition-duration:var(--transition-duration-popup-fade),var(--transition-duration-normal),var(--transition-duration-normal)]',
      'ease-out',
      'data-starting-style:opacity-0',
      'data-ending-style:opacity-0',
      'data-ending-style:duration-quick',
      'motion-safe:data-starting-style:scale-96',
      'motion-safe:data-starting-style:-translate-y-0.5',
      'motion-safe:data-[side=top]:data-starting-style:translate-y-0.5',
    ]) {
      expect(recipe).toContain(token);
    }
  });

  test('a Select list over its trigger grows out of the trigger box, with no slide, scale or fade', () => {
    const code = source('select.tsx');
    // select.tsx itself: the menu-item recipe that `source` appends has a
    // reduced-motion `transition-none` for the menu check.
    expect(readFileSync(join(import.meta.dir, 'select.tsx'), 'utf8')).not.toContain('transition-none');
    // No side, so no 2px slide and no scale, only for side none.
    for (const state of ['starting', 'ending']) {
      expect(code).toContain(`motion-safe:data-[side=none]:data-${state}-style:translate-y-0`);
      expect(code).toContain(`motion-safe:data-[side=none]:data-${state}-style:scale-100`);
      expect(code).toContain(`motion-safe:data-[side=none]:data-${state}-style:opacity-100`);
      expect(code).toContain(`motion-safe:data-[side=none]:data-${state}-style:[clip-path:var(--select-trigger-box)]`);
    }
    expect(code).toContain('data-[side=none]:transition-[opacity,clip-path]');
    expect(code).toContain('growFromTrigger');
  });

  test('menus, popovers and selects use the xl radius; dialogs use 2xl', () => {
    for (const file of ['popover.tsx', 'hover-card.tsx', 'dropdown-menu.tsx', 'context-menu.tsx', 'select.tsx', 'combobox.tsx', 'navigation-menu.tsx']) {
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
      // A combobox chip is a value in the field, not a list item: it takes
      // the accent fill to stand out from the muted field.
      const code = source(file).replace(/function ComboboxChip\([\s\S]*?\n}\n/, '');
      expect(code).toContain(token);
      expect(code).not.toMatch(/(?:focus|data-highlighted|data-open|data-popup-open|data-\[selected=true\]):bg-accent\b/);
      expect(code).not.toMatch(/"bg-accent /);
    }
    for (const file of ['dropdown-menu.tsx', 'context-menu.tsx']) {
      expect(source(file)).toContain('data-popup-open:bg-muted');
    }
  });

  test('combobox items take the menu item radius', () => {
    const code = source('combobox.tsx');
    expect(code).toMatch(/data-highlighted:bg-muted[^"]*rounded-lg/);
    expect(code).not.toMatch(/data-highlighted:bg-muted[^"]*rounded-sm/);
  });

  // Base UI marks an open submenu trigger with data-popup-open, never data-open.
  test('submenu triggers style the open state on data-popup-open only', () => {
    for (const file of ['dropdown-menu.tsx', 'context-menu.tsx', 'menubar.tsx']) {
      expect(source(file)).not.toMatch(/(?<![\w-])data-open:/);
    }
  });

  test('a dropdown menu is at least 240px wide', () => {
    expect(source('dropdown-menu.tsx')).toContain('min-w-60');
  });

  test('destructive menu items hover with a 10% destructive tint in both themes', () => {
    for (const file of ['dropdown-menu.tsx', 'context-menu.tsx']) {
      const code = source(file);
      expect(code).toContain('data-[variant=destructive]:not-data-disabled:focus:bg-destructive/10');
      expect(code).not.toContain('dark:data-[variant=destructive]:focus:bg-destructive/20');
    }
  });

  test('a disabled menu, select or combobox item never takes the fill', () => {
    for (const file of ['dropdown-menu.tsx', 'context-menu.tsx', 'menubar.tsx', 'select.tsx', 'breadcrumb.tsx']) {
      const code = source(file);
      expect(code).not.toMatch(/(?<!not-data-disabled:)focus:bg-/);
      expect(code).toContain('not-data-disabled:focus:bg-muted');
    }
    const combobox = source('combobox.tsx');
    expect(combobox).not.toMatch(/(?<!not-data-disabled:)data-highlighted:bg-/);
    expect(combobox).toContain('not-data-disabled:data-highlighted:bg-muted');
  });

  test('a focused disabled item keeps its text and icon, and its focus ring at full strength', () => {
    for (const file of ['dropdown-menu.tsx', 'context-menu.tsx', 'menubar.tsx', 'select.tsx', 'combobox.tsx', 'breadcrumb.tsx']) {
      const code = source(file);
      // Every focus or highlight rule skips a disabled item.
      expect(code).not.toMatch(/[\s"](focus|data-highlighted):/);
      expect(code).not.toMatch(/not-data-\[variant=destructive\]:(focus|data-highlighted):/);
      // The item dims its content, not itself: an opacity on the item would fade the ring too.
      expect(code).not.toContain('data-disabled:opacity-50');
    }
    // Every item dims its content through the one shared rule, so a child
    // with its own colour (a status dot, a detail) dims too.
    for (const file of ['context-menu.tsx', 'menubar.tsx', 'select.tsx', 'combobox.tsx']) {
      expect(source(file)).toContain('menuItemDisabled,');
    }
    const recipe = readFileSync(join(import.meta.dir, '../../lib/menu-item.tsx'), 'utf8');
    expect(recipe).toMatch(/cn\(\s*menuItemDisabled,/);
    expect(recipe).toContain('data-disabled:*:[filter:opacity(50%)]');
  });

  // BreadcrumbMenu and the DropdownMenu items share one item recipe, and every
  // radio item in a menu marks its checked row as BreadcrumbMenu does:
  // semibold text in the foreground colour and a 14px check that draws in.
  test('BreadcrumbMenu items and menu radio items share the item recipe and the checked look', () => {
    const breadcrumb = readFileSync(join(import.meta.dir, 'breadcrumb.tsx'), 'utf8');
    expect(breadcrumb).toContain('className={cn(menuItem, menuRadioItem)}');
    expect(breadcrumb).toContain('<MenuCheck />');
    expect(readFileSync(join(import.meta.dir, 'dropdown-menu.tsx'), 'utf8')).toMatch(/menuItem, menuRadioItem/);
    for (const file of ['dropdown-menu.tsx', 'context-menu.tsx', 'menubar.tsx']) {
      const code = readFileSync(join(import.meta.dir, file), 'utf8');
      const radio = code.slice(code.search(/function \w+RadioItem\(/));
      const body = radio.slice(0, radio.indexOf('\n}\n'));
      expect(body).toContain('menuRadioItem');
      expect(body).toContain('<MenuCheck />');
      expect(body).not.toContain('RadioItemIndicator');
    }
    expect(menuItemRecipe).toContain('data-checked:text-foreground data-checked:font-semibold');
    expect(menuItemRecipe).toContain('size-3.5');
    expect(menuItemRecipe).toContain('group-data-checked/menu-radio:opacity-90');
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
      expect(code).toContain('ease-drawer');
      expect(code).toContain('bg-scrim');
      expect(code).not.toContain('ease-[cubic-bezier(0.32,0.72,0,1)]');
    }
  });

  test('a dialog is 440px, has no close button by default, and a 10px header gap', () => {
    const code = source('dialog.tsx');
    expect(code).toContain('showCloseButton = false,');
    expect(code).toContain('sm:max-w-110');
    expect(code).toContain('flex flex-col gap-2.5');
  });

  test.each(['dialog.tsx', 'alert-dialog.tsx'])(
    '%s fits the viewport, scrolls inside, and pins its header and footer',
    (file) => {
      const code = source(file);
      expect(code).toContain('max-h-[calc(100dvh-2rem)]');
      expect(code).toContain('overflow-y-auto');
      // One variable sets the padding and the pinned edges' offsets.
      expect(code).toContain('[--dialog-padding:--spacing(5)] p-(--dialog-padding)');
      expect(code).toContain(
        'const pinned = "sticky z-10 -mx-(--dialog-padding) bg-overlay px-(--dialog-padding)"',
      );
      expect(code).toContain('-top-(--dialog-padding) -mt-(--dialog-padding) -mb-4');
      expect(code).toContain('-bottom-(--dialog-padding) -mt-4 -mb-(--dialog-padding)');
    },
  );

  test('a sheet scrolls inside and pins its header and footer', () => {
    const code = source('sheet.tsx');
    expect(code).toContain('overflow-y-auto');
    expect(code).toContain('data-[side=top]:max-h-dvh');
    expect(code).toContain('data-[side=bottom]:max-h-dvh');
    expect(code).toContain('sticky top-0 z-10');
    expect(code).toContain('sticky bottom-0 z-10');
  });

  test.each(['dialog.tsx', 'alert-dialog.tsx', 'sheet.tsx'])(
    '%s scrolls a focused field clear of the pinned header and footer',
    (file) => {
      const code = source(file);
      expect(code).toContain(
        '[scroll-padding-block:calc(var(--pinned-header-height,0px)+--spacing(1))_calc(var(--pinned-footer-height,0px)+--spacing(1))]',
      );
      expect(code).toContain('usePinnedHeight("--pinned-header-height"');
      expect(code).toContain('usePinnedHeight("--pinned-footer-height"');
    },
  );

  test('a dialog title takes an 18px icon, neutral at 60% or in its tone', () => {
    const code = source('dialog.tsx');
    expect(code).toContain('size-4.5');
    expect(code).toContain('neutral: "text-foreground/60"');
    expect(code).toContain('critical: "text-destructive-text"');
  });

  test('the toaster defaults to bottom right on the 2xl radius and the overlay shadow', () => {
    const code = source('sonner.tsx');
    expect(code).toContain('position="bottom-right"');
    expect(code).toContain('var(--radius-2xl)');
    expect(code).toContain('shadow-overlay!');
  });

  test('the toast has one edge: the overlay shadow, no border and no inset hairline', () => {
    const code = source('sonner.tsx');
    expect(code).toContain('"border-0! shadow-overlay!"');
    expect(code).not.toContain('inset_0_0_0_1px_var(--border)');
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

  test('a toast moves on the drawer curve and changes height on the height curve', () => {
    const code = source('sonner.tsx');
    expect(code).toContain(
      '[transition:transform_var(--transition-duration-toast-move)_var(--ease-drawer),opacity_var(--transition-duration-toast-fade)_var(--ease-soft),height_var(--transition-duration-toast-move)_var(--ease-height)]!',
    );
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
    expect(code).toContain('motion-reduce:[transition:opacity_var(--transition-duration-toast-fade)_var(--ease-soft)]!');
  });

  test('the info icon is the brand mark', () => {
    expect(source('sonner.tsx')).toContain('<InfoIcon className="text-brand-indicator');
  });
});
