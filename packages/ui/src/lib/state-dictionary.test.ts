import { afterEach, describe, expect, mock, spyOn, test } from 'bun:test';

import {
  commonStates,
  defineStateEntries,
  isProgressTone,
  maxTone,
  TONE_SEVERITY,
  type Tone,
} from './state-dictionary.ts';

describe('defineStateEntries', () => {
  afterEach(() => {
    mock.restore();
  });

  test('exhaustiveness is enforced at the type level', () => {
    type Status = 'QUEUED' | 'RUNNING';
    const map = defineStateEntries<Status>({
      QUEUED: { tone: 'progress', defaultLabel: 'Queued' },
      RUNNING: { tone: 'success', defaultLabel: 'Running' },
    });
    expect(map.entries.QUEUED.tone).toBe('progress');

    // @ts-expect-error — RUNNING is missing, so the map is not exhaustive over Status.
    defineStateEntries<Status>({
      QUEUED: { tone: 'progress', defaultLabel: 'Queued' },
    });
  });

  test('toneFor / labelFor look up declared states', () => {
    expect(commonStates.toneFor('completed')).toBe('success');
    expect(commonStates.labelFor('completed')).toBe('Completed');
    expect(commonStates.toneFor('failed')).toBe('critical');
  });

  test('lookup is case-insensitive', () => {
    expect(commonStates.toneFor('COMPLETED')).toBe('success');
    expect(commonStates.toneFor('Completed')).toBe('success');
    expect(commonStates.labelFor('DISABLED')).toBe('Disabled');
  });

  test('unmapped state falls back to neutral and its name in words', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    expect(commonStates.toneFor('nonsense')).toBe('neutral');
    expect(commonStates.labelFor('nonsense')).toBe('Nonsense');
    warn.mockRestore();
  });

  test('an unmapped state name turns into sentence case words', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    const cases: [string, string][] = [
      ['ValidatingCustomer', 'Validating customer'],
      ['PaymentSettled', 'Payment settled'],
      ['awaitingReview', 'Awaiting review'],
      ['VALIDATING_CUSTOMER', 'Validating customer'],
      ['validating-customer', 'Validating customer'],
      ['on_hold', 'On hold'],
      ['SSLCheckFailed', 'SSL check failed'],
      ['Step2Done', 'Step 2 done'],
      ['', ''],
    ];
    for (const [state, label] of cases) {
      expect(commonStates.labelFor(state)).toBe(label);
    }
    warn.mockRestore();
  });

  test('the words fallback still warns once in development', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    const map = defineStateEntries({ ok: { tone: 'success', defaultLabel: 'Ok' } });
    expect(map.labelFor('ValidatingCustomer')).toBe('Validating customer');
    map.labelFor('ValidatingCustomer');
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  test('iconFor returns the icon of an entry, and nothing for an entry without one', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    const truck = { type: 'svg', props: {}, key: null };
    const map = defineStateEntries({
      Shipped: { tone: 'neutral', defaultLabel: 'Shipped', icon: truck },
      Delivered: { tone: 'success', defaultLabel: 'Delivered' },
    });
    expect(map.iconFor('Shipped')).toBe(truck);
    expect(map.iconFor('SHIPPED')).toBe(truck);
    expect(map.iconFor('Delivered')).toBeUndefined();
    expect(map.iconFor('Unknown')).toBeUndefined();
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  test('unmapped state warns once per state in development', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    const map = defineStateEntries({ ok: { tone: 'success', defaultLabel: 'Ok' } });

    map.toneFor('mystery');
    map.toneFor('mystery');
    map.labelFor('mystery');
    expect(warn).toHaveBeenCalledTimes(1);

    map.toneFor('another');
    expect(warn).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  test('warn dedup is case-insensitive, like the lookup', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    const map = defineStateEntries({ ok: { tone: 'success', defaultLabel: 'Ok' } });

    map.toneFor('Mystery');
    map.toneFor('MYSTERY');
    map.toneFor('mystery');
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  test('declared states never warn', () => {
    const warn = spyOn(console, 'warn').mockImplementation(() => {});
    commonStates.toneFor('enabled');
    commonStates.labelFor('ENABLED');
    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('commonStates', () => {
  test('omits `running` deliberately (no single tone)', () => {
    expect('running' in commonStates.entries).toBe(false);
  });

  test('rules the lifecycle states consumers used to declare locally', () => {
    expect(commonStates.toneFor('active')).toBe('success');
    expect(commonStates.toneFor('inactive')).toBe('neutral');
    expect(commonStates.toneFor('pending')).toBe('progress');
    expect(commonStates.toneFor('revoked')).toBe('neutral');
    expect(commonStates.labelFor('revoked')).toBe('Revoked');
  });

  test('ships the universal states with their canonical tones', () => {
    expect(commonStates.toneFor('suspended')).toBe('warning');
    expect(commonStates.toneFor('degraded')).toBe('warning');
    expect(commonStates.toneFor('cancelled')).toBe('neutral');
    expect(commonStates.toneFor('expired')).toBe('neutral');
    expect(commonStates.toneFor('unknown')).toBe('neutral');
    expect(commonStates.toneFor('approved')).toBe('success');
    expect(commonStates.toneFor('rejected')).toBe('critical');
    expect(commonStates.toneFor('error')).toBe('critical');
  });
});

describe('maxTone', () => {
  test('returns the most severe tone', () => {
    expect(maxTone('neutral', 'success', 'warning')).toBe('warning');
    expect(maxTone('success', 'critical', 'progress')).toBe('critical');
    expect(maxTone('info', 'progress')).toBe('progress');
  });

  test('rolls an empty call up to neutral', () => {
    expect(maxTone()).toBe('neutral');
  });

  test('handles single and duplicate arguments', () => {
    expect(maxTone('warning')).toBe('warning');
    expect(maxTone('info', 'info', 'info')).toBe('info');
  });

  test('severity ordering runs neutral (0) → critical (5)', () => {
    const ordered: Tone[] = ['neutral', 'success', 'info', 'progress', 'warning', 'critical'];
    const severities = ordered.map((tone) => TONE_SEVERITY[tone]);
    expect(severities).toEqual([0, 1, 2, 3, 4, 5]);
  });
});

describe('isProgressTone', () => {
  test('is true only for progress', () => {
    const all: Tone[] = ['neutral', 'info', 'success', 'warning', 'critical', 'progress'];
    expect(all.filter(isProgressTone)).toEqual(['progress']);
  });
});
