import type { Meta, StoryObj } from '@storybook/react';
import type { ReactNode } from 'react';
import { Button } from '../src/components/atoms/button.tsx';
import { ConfirmDialog } from '../src/components/molecules/confirm-dialog.tsx';

/**
 * Guidance, not props. Which actions earn a confirmation at all (irreversible,
 * bulk, or outward-facing), and how to word the dialog once you show one: the
 * title names the action, the confirm button repeats the verb, and destructive
 * styling is reserved for destructive outcomes. For the API and async/pending
 * behavior, see the ConfirmDialog stories.
 */
const meta = {
  title: 'Molecules/ConfirmDialog/Guidance',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-1 text-lg font-semibold tracking-tight">{title}</h2>
      {intro ? <p className="text-muted-foreground mb-4 max-w-2xl text-sm">{intro}</p> : null}
      {children}
    </section>
  );
}

function Example({
  verdict,
  caption,
  children,
}: {
  verdict: 'do' | 'dont';
  caption: string;
  children: ReactNode;
}) {
  const isDo = verdict === 'do';
  return (
    <div className="rounded-lg border p-4">
      <p
        className={`mb-3 text-xs font-semibold uppercase tracking-wide ${
          isDo ? 'text-success-subtle-foreground' : 'text-destructive-subtle-foreground'
        }`}
      >
        {isDo ? 'Do' : "Don't"}
      </p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
      <p className="text-muted-foreground mt-3 text-sm">{caption}</p>
    </div>
  );
}

// ── data ─────────────────────────────────────────────────────────────────────

const WARRANTS: { n: number; title: string; body: string }[] = [
  {
    n: 1,
    title: 'Irreversible',
    body: 'There is no undo path. Deletes, refunds, revoked keys: once it lands, the data or the money is gone. The confirm is the only chance to catch a slip.',
  },
  {
    n: 2,
    title: 'Bulk',
    body: 'A single gesture with a wide blast radius. Deleting one row may be cheap; deleting the 24 selected rows by accident is not. Confirm when the scope, not the action, is the risk.',
  },
  {
    n: 3,
    title: 'Outward-facing',
    body: 'It leaves your system and reaches a customer or the public. Publishing a product, emailing an invoice, deploying to production: the cost is that you cannot un-send it.',
  },
];

const CONFIRM_WHEN: { action: string; warrant: string | null; why: string }[] = [
  {
    action: 'Delete a product',
    warrant: 'Irreversible',
    why: 'No undo: the record and its history are gone.',
  },
  {
    action: 'Refund a payment',
    warrant: 'Irreversible',
    why: 'Moves real money; it cannot be clicked back.',
  },
  {
    action: 'Revoke an API key',
    warrant: 'Irreversible',
    why: 'Breaks live integrations the instant it lands.',
  },
  {
    action: 'Cancel an order',
    warrant: 'Outward-facing',
    why: 'Touches the customer and releases the payment.',
  },
  {
    action: 'Deploy to production',
    warrant: 'Outward-facing',
    why: 'Ships to live customers immediately.',
  },
  {
    action: 'Delete 24 selected products',
    warrant: 'Bulk',
    why: 'One gesture, wide blast radius; a slip is expensive.',
  },
  {
    action: 'Disable a product',
    warrant: null,
    why: 'Reversible: re-enable it in one click. Let the toggle be undoable.',
  },
  {
    action: 'Archive a customer',
    warrant: null,
    why: 'Low-stakes and reversible; show an undo toast, not a modal.',
  },
  {
    action: 'Rename a collection',
    warrant: null,
    why: 'Editable again immediately; nothing to guard.',
  },
  {
    action: 'Save a draft',
    warrant: null,
    why: 'Trivial and non-destructive.',
  },
];

const WORDING_RULES: { n: number; title: string; body: string }[] = [
  {
    n: 1,
    title: 'The title names the action',
    body: 'Phrase it as a question about the specific action ("Delete product?", "Cancel order?"), never "Are you sure?". The title alone should tell the user what is about to happen.',
  },
  {
    n: 2,
    title: 'The confirm button repeats the verb',
    body: 'Label it "Delete", "Cancel order", "Refund": never "OK", "Yes", or the default "Confirm". A verb-labeled button reads on its own and survives a reflexive click; "OK" forces the user to re-derive what OK does.',
  },
  {
    n: 3,
    title: 'The description states the consequence',
    body: 'Say what happens and to whom (for example, "Customers will no longer see this product"), and name the irreversible part explicitly. Describe the outcome, not the mechanics of the dialog.',
  },
];

// ── 1 · when a confirm is warranted ──────────────────────────────────────────

export const WhenToConfirm: Story = {
  name: '1 · When a confirm is warranted',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Confirm only what you cannot take back"
        intro="A confirmation is an interruption: it stops the user to buy back a mistake. Spend it only where a mistake is expensive: an action is worth confirming when it is irreversible, bulk, or outward-facing. If it is none of those, make it undoable instead."
      >
        <div className="mb-6 flex flex-col gap-3">
          {WARRANTS.map(({ n, title, body }) => (
            <div key={n} className="border-l-2 pl-4">
              <h3 className="text-sm font-semibold">
                {n} · {title}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">{body}</p>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="text-muted-foreground border-b text-xs uppercase tracking-wide">
                <th className="p-3 font-medium">Action</th>
                <th className="p-3 font-medium">Confirm?</th>
                <th className="p-3 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {CONFIRM_WHEN.map(({ action, warrant, why }) => (
                <tr key={action} className="border-b align-top last:border-0">
                  <td className="p-3">{action}</td>
                  <td className="p-3 text-xs">
                    {warrant ? (
                      <span className="text-success-subtle-foreground font-medium">{warrant}</span>
                    ) : (
                      <span className="text-muted-foreground">Undo instead</span>
                    )}
                  </td>
                  <td className="text-muted-foreground p-3 text-xs">{why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Undoable actions do not get a dialog"
        intro="A modal on every toggle trains people to click through without reading, which weakens the confirmations that actually matter. When the action is reversible, skip the dialog and offer an undo affordance instead."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="The irreversible delete confirms; the reversible disable is a plain control with an undo path."
          >
            <ConfirmDialog
              title="Delete product?"
              description="This permanently removes the product and its variants. Customers will no longer see it."
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={() => {}}
            >
              <Button variant="destructive">Delete</Button>
            </ConfirmDialog>
            <Button variant="outline">Disable</Button>
          </Example>
          <Example
            verdict="dont"
            caption="A dialog on a reversible toggle interrupts for nothing and dulls the reflex for the confirms that count."
          >
            <ConfirmDialog
              title="Disable product?"
              description="You can re-enable it at any time."
              confirmLabel="Disable"
              onConfirm={() => {}}
            >
              <Button variant="outline">Disable</Button>
            </ConfirmDialog>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 2 · wording the dialog ───────────────────────────────────────────────────

export const Wording: Story = {
  name: '2 · Wording the dialog',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Three rules for the words"
        intro="Once a dialog is warranted, its job is to let the user decide correctly at a glance. Every part of the copy names the specific action, so the user never has to reconstruct what the buttons do."
      >
        <div className="mb-6 flex flex-col gap-3">
          {WORDING_RULES.map(({ n, title, body }) => (
            <div key={n} className="border-l-2 pl-4">
              <h3 className="text-sm font-semibold">
                {n} · {title}
              </h3>
              <p className="text-muted-foreground mt-1 text-sm">{body}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Title names the action, confirm repeats the verb. Read either one alone and you know what happens."
          >
            <ConfirmDialog
              title="Cancel order #1042?"
              description="The customer is notified and the authorized payment is released."
              confirmLabel="Cancel order"
              cancelLabel="Keep order"
              variant="destructive"
              onConfirm={() => {}}
            >
              <Button variant="destructive">Cancel order</Button>
            </ConfirmDialog>
          </Example>
          <Example
            verdict="dont"
            caption='"Are you sure?" plus "OK" carries no information: the user has to remember which button they pressed to get here.'
          >
            <ConfirmDialog
              title="Are you sure?"
              confirmLabel="OK"
              variant="destructive"
              onConfirm={() => {}}
            >
              <Button variant="destructive">Cancel order</Button>
            </ConfirmDialog>
          </Example>
        </div>
      </Section>
    </div>
  ),
};

// ── 3 · destructive styling ──────────────────────────────────────────────────

export const DestructiveStyling: Story = {
  name: '3 · Destructive styling',
  render: () => (
    <div className="text-foreground max-w-4xl p-1">
      <Section
        title="Red marks the destructive outcome, nothing else"
        intro='variant="destructive" tints the confirm button to signal loss. A confirm-worthy action is not automatically a destructive one: publishing to customers or deploying is outward-facing and warrants a dialog, but its outcome is not a loss, so leave it on the default variant. Reserving red keeps it meaningful the one time it matters. (For the emphasis ladder behind the variants, see Button/Guidance.)'
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <Example
            verdict="do"
            caption="Destructive red on the delete; the outward-facing publish confirms too, but on the default variant because nothing is lost."
          >
            <ConfirmDialog
              title="Delete customer?"
              description="This permanently removes the customer and their order history."
              confirmLabel="Delete"
              variant="destructive"
              onConfirm={() => {}}
            >
              <Button variant="destructive">Delete</Button>
            </ConfirmDialog>
            <ConfirmDialog
              title="Publish product?"
              description="This makes the product visible to customers in the storefront."
              confirmLabel="Publish"
              onConfirm={() => {}}
            >
              <Button>Publish</Button>
            </ConfirmDialog>
          </Example>
          <Example
            verdict="dont"
            caption="Red on a safe, reversible publish cries wolf; when everything is red, nothing reads as dangerous."
          >
            <ConfirmDialog
              title="Publish product?"
              description="This makes the product visible to customers in the storefront."
              confirmLabel="Publish"
              variant="destructive"
              onConfirm={() => {}}
            >
              <Button variant="destructive">Publish</Button>
            </ConfirmDialog>
          </Example>
        </div>
      </Section>
    </div>
  ),
};
