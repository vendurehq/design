import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { StatusBadge } from './status-badge.tsx';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('StatusBadge', () => {
  test('the default chip shows its tone icon at 13px', () => {
    const markup = html(<StatusBadge tone="success">Active</StatusBadge>);

    expect(markup).toContain('Active');
    expect(markup).toContain('h-6');
    expect(markup).toContain('data-slot="status-badge-marker"');
    expect(markup).toContain('lucide-circle-check');
    expect(markup).toContain('[&amp;_svg]:size-3.25');
  });

  test('each tone has its own default icon', () => {
    const icons = {
      neutral: 'lucide-circle-dashed',
      info: 'lucide-circle-dot',
      warning: 'lucide-triangle-alert',
      critical: 'lucide-circle-x',
      progress: 'lucide-loader',
    } as const;

    for (const [tone, icon] of Object.entries(icons)) {
      expect(html(<StatusBadge tone={tone as keyof typeof icons}>State</StatusBadge>)).toContain(
        icon,
      );
    }
  });

  test('icon={false} and icon={null} leave the chip without a marker', () => {
    for (const icon of [false, null]) {
      const markup = html(
        <StatusBadge tone="success" icon={icon}>
          Active
        </StatusBadge>,
      );

      expect(markup).not.toContain('data-slot="status-badge-marker"');
    }
  });

  test('an icon that is not an element renders no empty marker', () => {
    for (const icon of ['', 0]) {
      const markup = html(
        <StatusBadge tone="success" icon={icon}>
          Active
        </StatusBadge>,
      );

      expect(markup).not.toContain('data-slot="status-badge-marker"');
    }
  });

  test('progress keeps its spinner with icon={false} or icon={null}', () => {
    for (const icon of [false, null]) {
      const markup = html(
        <StatusBadge tone="progress" icon={icon}>
          Deploying
        </StatusBadge>,
      );

      expect(markup).toContain('lucide-loader');
      expect(markup).toContain('animate-spin-slow');
    }
  });

  test('progress keeps its spinner with dot', () => {
    const markup = html(
      <StatusBadge tone="progress" dot>
        Deploying
      </StatusBadge>,
    );

    expect(markup).toContain('lucide-loader');
    expect(markup).not.toContain('rounded-full');
  });

  test('icon={false} with dot shows the dot', () => {
    const markup = html(
      <StatusBadge tone="success" dot icon={false}>
        Active
      </StatusBadge>,
    );

    expect(markup).toContain('data-slot="status-badge-marker"');
    expect(markup).toContain('rounded-full');
    expect(markup).not.toContain('lucide-circle-check');
  });

  test('the warning marker takes warning-text, not warning-indicator', () => {
    const markup = html(<StatusBadge tone="warning">Degraded</StatusBadge>);

    expect(markup).toContain('lucide-triangle-alert');
    expect(markup).toMatch(/data-slot="status-badge-marker" class="[^"]*text-warning-text/);
  });

  test('the chip mixes its fill, outline and label from the tone', () => {
    const markup = html(<StatusBadge tone="success">Active</StatusBadge>);

    expect(markup).toContain('[--status-tone:var(--success-text)]');
    expect(markup).toContain('bg-[color-mix(in_oklab,var(--status-tone)_5%,var(--muted))]');
    expect(markup).toContain('inset-ring-[color-mix(in_oklab,var(--status-tone)_34%,transparent)]');
    expect(markup).not.toContain('border');
  });

  test('the label eases with the fill and the outline', () => {
    expect(html(<StatusBadge tone="success">Active</StatusBadge>)).toContain(
      'transition-[box-shadow,background-color,color]',
    );
  });

  test('a transparent inset outline keeps the chip box in forced colours', () => {
    const markup = html(<StatusBadge tone="success">Active</StatusBadge>);

    expect(markup).toContain('outline-1');
    expect(markup).toContain('outline-transparent');
    expect(markup).toContain('-outline-offset-1');
  });

  test('warning draws its outline in warning-indicator and its label from warning-text', () => {
    const markup = html(<StatusBadge tone="warning">Degraded</StatusBadge>);

    expect(markup).toContain('[--status-tone:var(--warning-indicator)]');
    expect(markup).toContain('[--status-label-tone:var(--warning-text)]');
    expect(markup).toContain('[--status-label-mix:70%]');
  });

  test('progress takes the info tone', () => {
    expect(html(<StatusBadge tone="progress">Building</StatusBadge>)).toContain(
      '[--status-tone:var(--info-text)]',
    );
  });

  test('dot shows a tone-coloured dot', () => {
    const markup = html(
      <StatusBadge tone="success" dot>
        Active
      </StatusBadge>,
    );

    expect(markup).toContain('data-slot="status-badge-marker"');
    expect(markup).toContain('text-success-text');
    expect(markup).not.toContain('lucide-circle-check');
  });

  test('progress shows a spinner that stops under reduced motion', () => {
    const markup = html(<StatusBadge tone="progress">Deploying</StatusBadge>);

    expect(markup).toContain('lucide-loader');
    expect(markup).toContain('motion-reduce:animate-none');
  });

  test('icon replaces the dot and the spinner', () => {
    const markup = html(
      <StatusBadge tone="progress" dot icon={<svg data-testid="custom-icon" />}>
        Deploying
      </StatusBadge>,
    );

    expect(markup).toContain('data-testid="custom-icon"');
    expect(markup).not.toContain('lucide-loader');
  });

  test('size="lg" renders the 28px chip with a 14px icon', () => {
    const markup = html(<StatusBadge size="lg">Draft</StatusBadge>);

    expect(markup).toContain('h-7');
    expect(markup).toContain('[&amp;_svg]:size-3.5');
    expect(markup).not.toContain('[&amp;_svg]:size-3.25');
  });

  test('appearance="text" renders the word in the tone text colour', () => {
    const markup = html(
      <StatusBadge tone="critical" appearance="text">
        Failed
      </StatusBadge>,
    );

    expect(markup).toContain('text-destructive-text');
    // Only the word: no chip fill, no outline and no marker.
    expect(markup).not.toContain('bg-[color-mix');
    expect(markup).not.toContain('inset-ring');
    expect(markup).not.toContain('data-slot="status-badge-marker"');
  });

  test('appearance="text" puts the progress spinner after the word', () => {
    const markup = html(
      <StatusBadge tone="progress" appearance="text">
        Building
      </StatusBadge>,
    );

    expect(markup.indexOf('Building')).toBeLessThan(markup.indexOf('lucide-loader'));
  });

  test('appearance="dot" keeps the label as screen-reader text', () => {
    const markup = html(
      <StatusBadge tone="warning" appearance="dot">
        Degraded
      </StatusBadge>,
    );

    expect(markup).toContain('<span class="sr-only">Degraded</span>');
    expect(markup).toContain('size-2');
  });
});

describe('StatusBadge appearance="bare"', () => {
  test('keeps the icon and the tinted label, without fill, outline or padding', () => {
    const markup = html(
      <StatusBadge tone="success" appearance="bare">
        Live
      </StatusBadge>,
    );
    const cls = markup.match(/class="([^"]*)"/)?.[1] ?? '';

    expect(markup).toContain('lucide-circle-check');
    expect(cls).toContain('[--status-tone:var(--success-text)]');
    expect(cls).toContain('var(--foreground-secondary)');
    expect(cls).toContain('text-xs');
    expect(cls).toContain('gap-1.5');
    expect(cls).not.toMatch(/(^|\s)(bg-|inset-ring|h-6|px-|rounded)/);
  });

  test('progress keeps its spinner, lg steps up the text', () => {
    const markup = html(
      <StatusBadge tone="progress" appearance="bare" size="lg">
        Building
      </StatusBadge>,
    );

    expect(markup).toContain('lucide-loader');
    expect(markup).toContain('text-sm');
    expect(markup).toContain('[&amp;_svg]:size-3.5');
  });
});

describe('StatusBadge content inset', () => {
  // The distance from the box to the first letter, which a DataTable cell pulls
  // the chip back by: padding, plus the marker and its gap.
  test('the chip marks its marker, so the inset counts an icon or a dot', () => {
    expect(html(<StatusBadge tone="success">Live</StatusBadge>)).toContain('data-marker="icon"');
    expect(
      html(
        <StatusBadge tone="success" dot>
          Live
        </StatusBadge>,
      ),
    ).toContain('data-marker="dot"');
    const markup = html(<StatusBadge tone="success">Live</StatusBadge>);
    expect(markup).toContain('[--content-inset:calc(var(--spacing)*2.5)]');
    expect(markup).toContain('has-data-[marker=icon]:[--content-inset:calc(var(--spacing)*6.75)]');
  });

  test('text and dot appearances set no inset', () => {
    expect(html(<StatusBadge appearance="text">Live</StatusBadge>)).not.toContain(
      '--content-inset',
    );
    expect(html(<StatusBadge appearance="dot">Live</StatusBadge>)).not.toContain('--content-inset');
  });
});
