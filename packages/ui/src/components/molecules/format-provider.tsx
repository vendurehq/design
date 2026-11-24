'use client';

import { createContext, type ReactNode, useContext, useMemo } from 'react';
import type { Locale } from 'react-day-picker';

// The design system cannot depend on any app's i18n. Formatters resolve their
// locale/currency in a fixed order — explicit prop → this context → `undefined`
// (a valid Intl argument that falls back to the runtime default locale) — so a
// bare `<Money>` or `<DateTime>` works with zero setup, and an app that mounts
// `FormatProvider` (e.g. from its own locale + server config) gets consistent
// output everywhere without threading props.
interface FormatContextValue {
  /** BCP 47 locale tag, e.g. `en-GB`. */
  locale?: string;
  /** IANA time zone, e.g. `Europe/Berlin`. */
  timeZone?: string;
  /** Default ISO 4217 currency code used by `<Money>` when none is passed. */
  currency?: string;
  /**
   * Number of minor-unit digits money integers are stored with (Vendure's
   * `moneyStrategyPrecision`). `undefined` → each currency's own Intl fraction
   * digits (2 for USD, 0 for JPY, 3 for BHD).
   */
  currencyPrecision?: number;
  /**
   * Language of every `Calendar`, including the date pickers' popups: month
   * caption, weekday names, first day of the week and screen-reader labels.
   * Import only the active language, e.g. `react-day-picker/locale/fr`, never
   * the `react-day-picker/locale` barrel (every language, about 1.6 MB).
   * `undefined` → US English. A `Calendar`'s own `locale` prop wins.
   */
  calendarLocale?: Locale;
}

const FormatContext = createContext<FormatContextValue>({});

function FormatProvider({
  children,
  locale,
  timeZone,
  currency,
  currencyPrecision,
  calendarLocale,
}: FormatContextValue & { children: ReactNode }) {
  const value = useMemo(
    () => ({ locale, timeZone, currency, currencyPrecision, calendarLocale }),
    [locale, timeZone, currency, currencyPrecision, calendarLocale],
  );
  return <FormatContext.Provider value={value}>{children}</FormatContext.Provider>;
}

function useFormatSettings(): FormatContextValue {
  return useContext(FormatContext);
}

export { FormatProvider, useFormatSettings, type FormatContextValue };
