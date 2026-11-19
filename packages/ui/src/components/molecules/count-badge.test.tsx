import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';

import { CountBadge, formatCount } from './count-badge.tsx';

const html = (node: React.ReactElement) => renderToStaticMarkup(node);

describe('CountBadge', () => {
  test('shows the number, neutral and inline by default', () => {
    const markup = html(<CountBadge count={3} />);

    expect(markup).toContain('>3</span>');
    expect(markup).toContain('data-tone="neutral"');
    expect(markup).toContain('bg-primary text-primary-foreground');
    expect(markup).toContain('h-5 min-w-5');
    expect(markup).toContain('tabular-nums');
  });

  test('renders nothing at zero, below zero and for a non-finite count', () => {
    expect(html(<CountBadge count={0} />)).toBe('');
    expect(html(<CountBadge count={-2} />)).toBe('');
    expect(html(<CountBadge count={Number.NaN} />)).toBe('');
    expect(html(<CountBadge count={Number.POSITIVE_INFINITY} />)).toBe('');
  });

  test('caps at max with a plus', () => {
    expect(formatCount(99, 99)).toBe('99');
    expect(formatCount(100, 99)).toBe('99+');
    expect(formatCount(12, 9)).toBe('9+');
    expect(html(<CountBadge count={120} />)).toContain('>99+</span>');
    expect(html(<CountBadge count={12} max={9} />)).toContain('>9+</span>');
  });

  test('a label is read with the real count; the visible number is hidden', () => {
    const markup = html(<CountBadge count={120} label="120 unread" />);

    expect(markup).toContain('<span aria-hidden="true">99+</span>');
    expect(markup).toContain('<span class="sr-only">120 unread</span>');
  });

  test('each tone takes its solid slot pair; critical uses destructive', () => {
    expect(html(<CountBadge count={1} tone="brand" />)).toContain('bg-brand text-brand-foreground');
    expect(html(<CountBadge count={1} tone="warning" />)).toContain(
      'bg-warning text-warning-foreground',
    );
    expect(html(<CountBadge count={1} tone="critical" />)).toContain(
      'bg-destructive text-destructive-foreground',
    );
  });

  test('corner sits on the top end corner, 16px, with a token font size', () => {
    const markup = html(<CountBadge count={4} placement="corner" />);

    expect(markup).toContain('absolute start-1/2 -top-1 h-4 min-w-4');
    expect(markup).toContain('text-2xs');
    expect(markup).toContain('ring-2 ring-background');
    expect(markup).not.toMatch(/text-\[\d/);
  });
});
