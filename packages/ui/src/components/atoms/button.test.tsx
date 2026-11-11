import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { Button, ButtonLabelSwap } from './button.tsx';
import { ButtonGroup } from './button-group.tsx';
import { slotTokens } from '../../test/slot-tokens.ts';

const buttonTokens = (element: React.ReactElement) => slotTokens(renderToStaticMarkup(element), 'button');

describe('Button press feedback', () => {
  // Base UI's Button never emits data-pressed, so a data-pressed rule is dead.
  test('scales on :active, with a reduced-motion fallback', () => {
    const tokens = buttonTokens(<Button>Save</Button>);
    expect(tokens).toContain('active:scale-[0.97]');
    expect(tokens).toContain('motion-reduce:active:scale-none');
    expect(tokens).not.toContain('motion-reduce:active:scale-100');
    expect(tokens).toContain(
      '[transition:background-color_var(--transition-duration-quick)_var(--ease-default),border-color_var(--transition-duration-quick)_var(--ease-default),color_var(--transition-duration-quick)_var(--ease-default),opacity_var(--transition-duration-quick)_var(--ease-default),box-shadow_var(--transition-duration-quick)_var(--ease-default),scale_var(--transition-duration-moderate)_var(--ease-press)]',
    );
    expect(tokens).not.toContain('transition-all');
    expect(tokens.filter((token) => token.includes('data-pressed'))).toEqual([]);
  });
});

describe('Button v3 look', () => {
  test('uses the xl radius and 13px medium text', () => {
    const tokens = buttonTokens(<Button>Save</Button>);
    expect(tokens).toContain('rounded-xl');
    expect(tokens).toContain('text-sm');
    expect(tokens).toContain('font-medium');
  });

  test('default is 34px and sm is 28px, icon-only sizes are matching squares', () => {
    expect(buttonTokens(<Button>Save</Button>)).toEqual(expect.arrayContaining(['h-8.5', 'px-3.25', 'gap-1.75']));
    expect(buttonTokens(<Button size="sm">Save</Button>)).toContain('h-7');
    expect(buttonTokens(<Button size="icon" aria-label="More" />)).toContain('size-8.5');
    expect(buttonTokens(<Button size="icon-sm" aria-label="More" />)).toContain('size-7');
  });

  test('outline sits on the card fill with the input border', () => {
    const tokens = buttonTokens(<Button variant="outline">Cancel</Button>);
    expect(tokens).toContain('bg-card');
    expect(tokens).toContain('border-input');
  });

  test('light outline paints its fill under the border, except inside a group', () => {
    // A padding-clipped fill lets shadow-control show through the translucent
    // light border, which darkens the side edges. Dark keeps the clip.
    const tokens = buttonTokens(<Button variant="outline">Cancel</Button>);
    expect(tokens).toContain('not-dark:[&:not([data-slot=button-group]>*)]:bg-clip-border');
  });

  test('primary, brand, outline and destructive sit on shadow-control; disabled drops it', () => {
    for (const variant of ['default', 'brand', 'outline', 'destructive'] as const) {
      expect(buttonTokens(<Button variant={variant}>Save</Button>)).toContain('shadow-control');
    }
    for (const variant of ['ghost', 'link', 'secondary'] as const) {
      expect(buttonTokens(<Button variant={variant}>Save</Button>)).not.toContain('shadow-control');
    }
    expect(buttonTokens(<Button>Save</Button>)).toContain('disabled:shadow-none');
  });

  test('outline hover darkens the border, except inside a group or when invalid', () => {
    const tokens = buttonTokens(<Button variant="outline">Cancel</Button>);
    expect(tokens).toContain(
      '[&:not([data-slot=button-group]>*,[aria-invalid=true])]:hover:border-[color-mix(in_oklab,var(--input),var(--foreground)_12%)]',
    );
  });

  // destructive-foreground on destructive is checked at 4.5:1 in both modes in
  // @vendure-io/design-tokens (src/contrast.test.ts).
  test('destructive is a solid fill with destructive-foreground text', () => {
    const tokens = buttonTokens(<Button variant="destructive">Delete</Button>);
    expect(tokens).toContain('bg-destructive');
    expect(tokens).toContain('text-destructive-foreground');
    expect(tokens.filter((token) => /^(bg-destructive\/|text-destructive-subtle)/.test(token))).toEqual([]);
  });
});

describe('Button data-icon padding', () => {
  test('no size narrows the icon side', () => {
    for (const size of ['default', 'xs', 'sm', 'lg'] as const) {
      const tokens = buttonTokens(<Button size={size}>Save</Button>);
      // Only the content inset reads the icon; no padding does.
      expect(
        tokens.filter((token) => token.includes('data-[icon=') && !token.includes('--content-inset')),
      ).toEqual([]);
    }
  });
});

describe('Button content inset', () => {
  // The distance from the box to the first letter: padding + 1px border, plus a
  // leading icon and the gap. A DataTable cell pulls the button back by it.
  test('each text size sets its inset, wider with a leading icon', () => {
    const expected = {
      default: ['3.25+1px', '9+1px'],
      xs: ['2+1px', '6+1px'],
      sm: ['2.5+1px', '8.25+1px'],
      lg: ['4+1px', '10+1px'],
    } as const;
    for (const [size, [plain, withIcon]] of Object.entries(expected)) {
      const tokens = buttonTokens(<Button size={size as keyof typeof expected}>Save</Button>);
      expect(tokens).toContain(`[--content-inset:calc(var(--spacing)*${plain})]`);
      expect(tokens).toContain(
        `has-data-[icon=inline-start]:[--content-inset:calc(var(--spacing)*${withIcon})]`,
      );
    }
  });

  test('icon-only sizes set no inset', () => {
    const tokens = buttonTokens(<Button size="icon" aria-label="More" />);
    expect(tokens.filter((token) => token.includes('[--content-inset:'))).toEqual([]);
  });
});

describe('Button menu chevron', () => {
  test('a ChevronDown turns while its menu is open, at once with reduced motion', () => {
    const tokens = buttonTokens(<Button>Deploy</Button>);
    expect(tokens).toContain('aria-expanded:[&>svg.lucide-chevron-down]:rotate-180');
    expect(tokens).toContain(
      '[&>svg]:[transition:opacity_var(--transition-duration-moderate)_var(--ease-default),rotate_var(--transition-duration-button-icon-turn)_var(--ease-out)]',
    );
    expect(tokens).toContain(
      'motion-reduce:[&>svg]:[transition:opacity_var(--transition-duration-moderate)_var(--ease-default)]',
    );
  });
});

describe('ButtonGroup', () => {
  test('draws one outer edge; children drop their own border', () => {
    const html = renderToStaticMarkup(
      <ButtonGroup>
        <Button variant="outline">Copy</Button>
        <Button variant="outline">Paste</Button>
      </ButtonGroup>,
    );
    const tokens = slotTokens(html, 'button-group');
    expect(tokens).toEqual(expect.arrayContaining(['inset-ring', 'inset-ring-input', 'bg-card', 'rounded-xl']));
    expect(tokens).toContain('*:data-slot:border-transparent');
    expect(tokens).toContain('[&>[data-slot]~[data-slot]]:border-l-border');
  });

  test('the group sits on shadow-control; children and a layout row of groups drop it', () => {
    const html = renderToStaticMarkup(
      <ButtonGroup>
        <Button variant="outline">Copy</Button>
      </ButtonGroup>,
    );
    const tokens = slotTokens(html, 'button-group');
    expect(tokens).toContain('shadow-control');
    expect(tokens).toContain('[&>[data-slot]:not([data-slot=button-group])]:shadow-none');
    expect(tokens).toContain('has-[>[data-slot=button-group]]:shadow-none');
  });

  test('variant="primary" puts the segments on one primary fill', () => {
    const html = renderToStaticMarkup(
      <ButtonGroup variant="primary">
        <Button>Deploy</Button>
        <Button size="icon" aria-label="More deploy options" />
      </ButtonGroup>,
    );
    expect(html).toContain('data-variant="primary"');
    const tokens = slotTokens(html, 'button-group');
    expect(tokens).toContain('bg-primary');
    expect(tokens).toContain('[&>[data-slot]~[data-slot]]:border-l-primary-foreground/20');
    expect(tokens).not.toContain('inset-ring');
  });
});

describe('ButtonLabelSwap', () => {
  const labels = ['Select', 'Selected'];
  const swapHtml = (active: number) =>
    renderToStaticMarkup(
      <Button>
        <ButtonLabelSwap labels={labels} active={active} />
      </Button>,
    );

  test('shows the active label; the others are hidden from the accessible name', () => {
    const html = swapHtml(1);
    expect(html).toContain('<span data-swap="before" aria-hidden="true"');
    expect(html).toContain('<span data-swap="in"');
    expect(html).not.toContain('data-swap="in" aria-hidden');
  });

  test('clips its width on one line, with the button timing', () => {
    const tokens = slotTokens(swapHtml(0), 'button-label-swap');
    expect(tokens).toContain('overflow-x-clip');
    expect(tokens).toContain('whitespace-nowrap');
    expect(tokens).toContain('[--label-swap-shift:calc(var(--spacing)*1)]');
  });
});
