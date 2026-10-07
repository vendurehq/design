import { expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import * as statCard from './stat-card.tsx';

const { StatCard } = statCard;

test('the delta variants are internal', () => {
  expect('statCardDeltaVariants' in statCard).toBe(false);
});

test('the delta color follows the outcome, not the direction', () => {
  const refundRateDown = renderToStaticMarkup(
    <StatCard label="Refund rate" value="1.2%" delta={{ value: -0.4, goodWhen: 'down' }} />,
  );
  expect(refundRateDown).toContain('text-success');

  const revenueDown = renderToStaticMarkup(
    <StatCard label="Revenue" value="€12,400" delta={{ value: -3.2 }} />,
  );
  expect(revenueDown).toContain('text-destructive');
});
