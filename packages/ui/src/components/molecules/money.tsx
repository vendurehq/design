'use client';

import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
import { SkeletonLine } from '@vendure-io/ui/components/molecules/state-views/skeleton-parts';
import { cn } from '@vendure-io/ui/lib/utils';
import type { ComponentProps, ReactNode } from 'react';
import { isDevelopment } from '../../lib/env.ts';
import { useMessages } from '../../lib/format-messages.ts';

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

// Dev-warn once per session, not once per render — a table of currency-less
// cells would otherwise flood the console.
let warnedMissingCurrency = false;

interface MoneyProps extends ComponentProps<'span'> {
  /**
   * Amount in integer minor units (Vendure convention), e.g. `2500` = $25.00.
   * `undefined` means not loaded yet and renders a one-line skeleton; `null`
   * means there is no amount and renders `fallback`. `0` is a real amount.
   */
  value: number | null | undefined;
  /** Rendered when `value` is `null`. @default "—" */
  fallback?: ReactNode;
  /** Screen-reader text while `value` is `undefined`. @default `messages.money.loading`, "Loading amount" */
  loadingLabel?: string;
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

/**
 * SSR note: output depends on locale, so server and client renders can disagree
 * when it falls back to the runtime default. SSR consumers should pin `locale`
 * via `FormatProvider` (or the prop) to avoid hydration mismatches.
 */
function Money({
  value,
  fallback = '—',
  loadingLabel,
  currency,
  locale,
  precision,
  currencyDisplay,
  className,
  ...props
}: MoneyProps) {
  const settings = useFormatSettings();
  const t = useMessages('money', { loading: loadingLabel });

  // The skeleton is a typical amount wide ("$1,234.56" in tabular digits) and
  // one line box tall, so the line does not move when the amount arrives.
  if (value === undefined) {
    return (
      <span
        data-slot="money"
        aria-busy="true"
        className={cn('inline-flex w-[9ch] max-w-full tabular-nums', className)}
        {...props}
      >
        {/* A zero-width space gives the skeleton a text baseline, so a
            baseline-aligned row does not grow when it loads. */}
        <span aria-hidden="true">{'\u200b'}</span>
        <SkeletonLine />
        <span className="sr-only">{t.loading}</span>
      </span>
    );
  }

  if (value === null) {
    return (
      <span data-slot="money" className={cn('tabular-nums', className)} {...props}>
        {fallback}
      </span>
    );
  }

  const resolvedCurrency = currency ?? settings.currency;
  const resolvedLocale = locale ?? settings.locale;
  const resolvedPrecision =
    precision ?? settings.currencyPrecision ?? currencyFractionDigits(resolvedCurrency);

  if (!resolvedCurrency && !warnedMissingCurrency && isDevelopment) {
    warnedMissingCurrency = true;
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
