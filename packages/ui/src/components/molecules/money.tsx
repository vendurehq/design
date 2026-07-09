'use client';

import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
import { cn } from '@vendure-io/ui/lib/utils';
import type { ComponentProps } from 'react';

// How many minor-unit digits a currency uses — 2 for USD (cents), 0 for JPY, 3
// for BHD. Derived from Intl rather than a hardcoded `/100`, which is wrong for
// zero- and three-decimal currencies (the enterprise-portal `Price` bug this
// fixes). Falls back to 2 for an unrecognised code so a typo can't throw.
function currencyFractionDigits(currency?: string): number {
  if (!currency) return 2;
  try {
    return (
      new Intl.NumberFormat(undefined, { style: 'currency', currency }).resolvedOptions()
        .maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

interface MoneyProps extends ComponentProps<'span'> {
  /** Amount in integer minor units (Vendure convention), e.g. `2500` = $25.00. */
  value: number;
  /** ISO 4217 code. Falls back to `FormatProvider`'s `currency`. */
  currency?: string;
  /** BCP 47 locale. Falls back to `FormatProvider`, then the runtime default. */
  locale?: string;
  /**
   * Minor-unit digits, used to scale minor→major and to set the displayed
   * fraction digits. Resolution: prop → context `currencyPrecision` → the
   * currency's own Intl fraction digits.
   */
  precision?: number;
  currencyDisplay?: Intl.NumberFormatOptions['currencyDisplay'];
}

function Money({
  value,
  currency,
  locale,
  precision,
  currencyDisplay,
  className,
  ...props
}: MoneyProps) {
  const settings = useFormatSettings();
  const resolvedCurrency = currency ?? settings.currency;
  const resolvedLocale = locale ?? settings.locale;
  const resolvedPrecision =
    precision ?? settings.currencyPrecision ?? currencyFractionDigits(resolvedCurrency);

  if (!resolvedCurrency && process.env.NODE_ENV !== 'production') {
    console.warn(
      '<Money> was rendered without a `currency` prop or a `FormatProvider` currency; ' +
        'the amount is shown as a plain number.',
    );
  }

  const major = value / 10 ** resolvedPrecision;
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: resolvedPrecision,
    maximumFractionDigits: resolvedPrecision,
  };
  if (resolvedCurrency) {
    options.style = 'currency';
    options.currency = resolvedCurrency;
    if (currencyDisplay) options.currencyDisplay = currencyDisplay;
  }

  const formatted = new Intl.NumberFormat(resolvedLocale, options).format(major);

  return (
    <span data-slot="money" className={cn('tabular-nums', className)} {...props}>
      {formatted}
    </span>
  );
}

export { Money, type MoneyProps };
