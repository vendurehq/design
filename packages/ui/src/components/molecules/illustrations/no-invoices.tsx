import type { IllustrationProps } from '@vendure-io/ui/components/molecules/illustrations/illustration-types';
import { cn } from '@vendure-io/ui/lib/utils';

/**
 * A receipt with a torn, zigzag bottom edge and dashed line items, with only
 * the total marked. For a billing page with no invoices or receipts yet. Not
 * for licenses or certificates (use `NoDocumentsIllustration`) or an invoice
 * whose payment failed (use `PaymentFailedIllustration`).
 */
function NoInvoicesIllustration({ className, size = 160 }: IllustrationProps) {
  return (
    <svg
      viewBox="0 0 160 120"
      width={size}
      height={(size * 120) / 160}
      fill="none"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={cn('shrink-0', className)}
    >
      <ellipse cx="80" cy="104" rx="26" ry="5" className="fill-muted" />

      {/* receipt, torn bottom edge */}
      <path
        d="M58,22 L102,22 L102,90 L97.6,86 L93.2,90 L88.8,86 L84.4,90 L80,86 L75.6,90 L71.2,86 L66.8,90 L62.4,86 L58,90 Z"
        className="fill-surface stroke-muted-foreground"
      />
      <line x1="66" y1="32" x2="86" y2="32" className="stroke-muted-foreground" />

      {/* line items, none yet */}
      <line x1="66" y1="44" x2="94" y2="44" className="stroke-border" strokeDasharray="3 4" />
      <line x1="66" y1="52" x2="88" y2="52" className="stroke-border" strokeDasharray="3 4" />
      <line x1="66" y1="60" x2="94" y2="60" className="stroke-border" strokeDasharray="3 4" />
      <line x1="66" y1="69" x2="94" y2="69" className="stroke-border" />

      {/* total — the one brand accent */}
      <rect x="80" y="74" width="14" height="5" rx="2.5" className="fill-brand" />
    </svg>
  );
}

export { NoInvoicesIllustration };
