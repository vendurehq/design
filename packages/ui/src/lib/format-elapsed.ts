const SECOND = 1000;

/**
 * Formats a duration in milliseconds as the two largest units: `31s`,
 * `1m 15s`, `9m 07s`, `1h 05m`. The smaller unit is zero-padded, so the text
 * keeps its width while it counts (pair it with `tabular-nums`). A negative
 * or invalid duration reads `0s`.
 */
function formatElapsed(ms: number): string {
  const total = Number.isFinite(ms) ? Math.max(0, Math.floor(ms / SECOND)) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (hours > 0) return `${hours}h ${pad(minutes)}m`;
  if (minutes > 0) return `${minutes}m ${pad(seconds)}s`;
  return `${seconds}s`;
}

/** The ISO 8601 duration of `ms` (`PT1M15S`), for a `<time dateTime>`. */
function isoDuration(ms: number): string {
  const total = Number.isFinite(ms) ? Math.max(0, Math.floor(ms / SECOND)) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return `PT${hours ? `${hours}H` : ''}${minutes ? `${minutes}M` : ''}${seconds || total === 0 ? `${seconds}S` : ''}`;
}

export { formatElapsed, isoDuration };
