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

  test('icon={false} leaves the chip without a marker', () => {
    const markup = html(
      <StatusBadge tone="success" icon={false}>
        Active
      </StatusBadge>,
    );

    expect(markup).not.toContain('data-slot="status-badge-marker"');
  });

  test('the chip mixes its fill, outline and label from the tone', () => {
    const markup = html(<StatusBadge tone="success">Active</StatusBadge>);

    expect(markup).toContain('[--status-tone:var(--success-text)]');
    expect(markup).toContain('bg-[color-mix(in_oklab,var(--status-tone)_5%,var(--muted))]');
    expect(markup).toContain('inset-ring-[color-mix(in_oklab,var(--status-tone)_34%,transparent)]');
    expect(markup).not.toContain('border');
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

  test('size="lg" renders the 28px chip', () => {
    expect(html(<StatusBadge size="lg">Draft</StatusBadge>)).toContain('h-7');
  });

  test('appearance="text" renders the word in the tone text colour', () => {
    const markup = html(
      <StatusBadge tone="critical" appearance="text">
        Failed
      </StatusBadge>,
    );

    expect(markup).toContain('text-destructive-text');
    expect(markup).not.toContain('bg-muted');
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
