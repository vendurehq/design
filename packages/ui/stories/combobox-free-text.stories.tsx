import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import {
  ComboboxFreeText,
  type ComboboxFreeTextItem,
} from '../src/components/molecules/combobox-free-text.tsx';

const meta = {
  title: 'Molecules/ComboboxFreeText',
  component: ComboboxFreeText,
  tags: ['autodocs'],
  // baseline args to satisfy required props; all stories use render()
  args: { value: '', onValueChange: () => {}, items: [] },
} satisfies Meta<typeof ComboboxFreeText>;

export default meta;
type Story = StoryObj<typeof meta>;

const people = [
  { name: 'Ada Lovelace', email: 'ada@example.com' },
  { name: 'Alan Turing', email: 'alan@example.com' },
  { name: 'Grace Hopper', email: 'grace@example.com' },
  { name: 'Katherine Johnson', email: 'katherine@example.com' },
  { name: 'Margaret Hamilton', email: 'margaret@example.com' },
];

// Simulates a debounced server search: matches the query against name/email
// after a short delay, toggling `isLoading` the way a real async source would.
function useMockUserSearch(query: string) {
  const [items, setItems] = React.useState<ComboboxFreeTextItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const id = setTimeout(() => {
      setItems(
        people
          .filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
          .map((p) => ({ value: p.email, label: p.name, description: p.email })),
      );
      setLoading(false);
    }, 500);
    return () => clearTimeout(id);
  }, [query]);

  return { items, loading };
}

// Connected to a real, keyless, CORS-enabled public API (DummyJSON). Debounces
// the query and aborts the in-flight request when a newer keystroke arrives, so
// a stale response can't overwrite a fresh one. Maps each user to { value: email }.
function useDummyUserSearch(query: string) {
  const [items, setItems] = React.useState<ComboboxFreeTextItem[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const q = query.trim();
    if (!q) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://dummyjson.com/users/search?q=${encodeURIComponent(q)}&limit=5&select=firstName,lastName,email`,
          { signal: controller.signal },
        );
        const data = (await res.json()) as {
          users: { firstName: string; lastName: string; email: string }[];
        };
        setItems(
          data.users.map((u) => ({
            value: u.email,
            label: `${u.firstName} ${u.lastName}`,
            description: u.email,
          })),
        );
        setLoading(false);
      } catch {
        // Ignore aborted requests; a newer keystroke already owns the state.
        if (!controller.signal.aborted) {
          setItems([]);
          setLoading(false);
        }
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  return { items, loading };
}

export const Default: Story = {
  render: function ComboboxFreeTextDefault() {
    const [value, setValue] = React.useState('');
    const { items, loading } = useMockUserSearch(value);
    return (
      <div className="w-[320px]">
        <ComboboxFreeText
          value={value}
          onValueChange={setValue}
          items={items}
          isLoading={loading}
          placeholder="owner@example.com"
        />
        <p className="text-muted-foreground mt-2 text-xs">
          Value: <span className="font-mono">{value || '—'}</span>
        </p>
      </div>
    );
  },
};

export const Invalid: Story = {
  render: function ComboboxFreeTextInvalid() {
    const [value, setValue] = React.useState('not-an-email');
    const { items, loading } = useMockUserSearch(value);
    return (
      <div className="w-[320px]">
        <ComboboxFreeText
          value={value}
          onValueChange={setValue}
          items={items}
          isLoading={loading}
          placeholder="owner@example.com"
          invalid
        />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: function ComboboxFreeTextDisabled() {
    return (
      <div className="w-[320px]">
        <ComboboxFreeText
          value="ada@example.com"
          onValueChange={() => {}}
          items={[]}
          placeholder="owner@example.com"
          disabled
        />
      </div>
    );
  },
};

/**
 * The first fetch has not returned: `items` is `undefined`. The field shows
 * its spinner, and the open list shows a loading row one suggestion tall.
 * Here the suggestions arrive 800 ms after the field is focused; one one-line
 * suggestion then takes the loading row's place without the list moving.
 */
export const FirstLoad: Story = {
  render: function ComboboxFreeTextFirstLoad() {
    const [value, setValue] = React.useState('');
    const [items, setItems] = React.useState<ComboboxFreeTextItem[] | undefined>(undefined);
    const started = React.useRef(false);
    return (
      // Starts the fake fetch on the first focus of the field.
      <div
        className="w-[320px]"
        onFocus={() => {
          if (started.current) return;
          started.current = true;
          setTimeout(() => setItems([{ value: 'Medium', label: 'Medium' }]), 800);
        }}
      >
        <ComboboxFreeText
          value={value}
          onValueChange={setValue}
          items={items}
          aria-label="Size"
          placeholder="Pick a size or type a new one…"
        />
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('combobox', { name: 'Size' });
    await expect(canvas.getByRole('status')).toHaveAccessibleName('Loading…');
    await userEvent.click(input);
    const body = within(canvasElement.ownerDocument.body);
    const loadingRow = await waitFor(() => {
      const row = canvasElement.ownerDocument.querySelector('[data-slot=combobox-free-text-loading]');
      if (!row) throw new Error('no loading row yet');
      return row as HTMLElement;
    });
    const list = loadingRow.closest('[data-slot=combobox-list]') as HTMLElement;
    const loadingHeight = list.offsetHeight;
    const option = await body.findByRole('option', { name: 'Medium' }, { timeout: 3000 });
    await expect(option).toBeVisible();
    await expect(canvas.queryByRole('status')).toBeNull();
    // The loading row and the one loaded suggestion are the same height.
    await expect(list.offsetHeight).toBe(loadingHeight);
  },
};

// Items can carry extra fields (here, an `id`). `onSelectItem` hands the whole
// record back when a row is picked, so the consumer captures the id; typing or
// free text clears it, because a brand-new entry has no record behind it.
const team = [
  { id: 'usr_01', name: 'Ada Lovelace', email: 'ada@example.com' },
  { id: 'usr_02', name: 'Alan Turing', email: 'alan@example.com' },
  { id: 'usr_03', name: 'Grace Hopper', email: 'grace@example.com' },
];

export const CapturingTheRecord: Story = {
  render: function ComboboxFreeTextCapturingTheRecord() {
    const [value, setValue] = React.useState('');
    const [selectedId, setSelectedId] = React.useState<string | null>(null);

    const q = value.trim().toLowerCase();
    const items = q
      ? team
          .filter((p) => p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
          .map((p) => ({ value: p.email, label: p.name, description: p.email, id: p.id }))
      : [];

    return (
      <div className="w-[320px]">
        <ComboboxFreeText
          value={value}
          onValueChange={(v) => {
            setValue(v);
            setSelectedId(null);
          }}
          onSelectItem={(item) => setSelectedId(item.id)}
          items={items}
          placeholder="Search team or type an email…"
        />
        <p className="text-muted-foreground mt-2 text-xs">
          Value: <span className="font-mono">{value || '—'}</span>
          {' · '}
          Selected id: <span className="font-mono">{selectedId ?? '—'}</span>
        </p>
      </div>
    );
  },
};

// Mirrors the dashboard's variant option editor: a pick-or-create field over a
// small, known option set. The caller returns the full set for an empty query
// and for a committed value (exact match), so focusing or clicking the field
// always shows the alternatives — no typing needed; a partial query filters.
const sizes = ['Small', 'Medium', 'Large', 'Extra Large'];

export const KnownOptionSet: Story = {
  render: function ComboboxFreeTextKnownOptionSet() {
    const [value, setValue] = React.useState('Medium');
    const q = value.trim().toLowerCase();
    const showAll = !q || sizes.some((s) => s.toLowerCase() === q);
    const items = (showAll ? sizes : sizes.filter((s) => s.toLowerCase().includes(q))).map((s) => ({
      value: s,
      label: s,
    }));
    return (
      <div className="w-[320px]">
        <ComboboxFreeText
          value={value}
          onValueChange={setValue}
          items={items}
          placeholder="Pick a size or type a new one…"
        />
        <p className="text-muted-foreground mt-2 text-xs">
          Value: <span className="font-mono">{value || '—'}</span>
        </p>
      </div>
    );
  },
};

// Live example: suggestions come from the public DummyJSON users API. Type "jo"
// to see real matches, or type any other email — the free text stays as the
// value and the popup closes when nothing matches.
export const LiveUserSearch: Story = {
  // Makes a real network call, so it's excluded from autodocs, the test runner,
  // and Chromatic snapshots — it must not gate the deterministic story surface.
  // Open it manually to see live suggestions.
  tags: ['!autodocs', '!test'],
  parameters: { chromatic: { disableSnapshot: true } },
  render: function ComboboxFreeTextLiveUserSearch() {
    const [value, setValue] = React.useState('');
    const { items, loading } = useDummyUserSearch(value);
    return (
      <div className="w-[320px]">
        <ComboboxFreeText
          value={value}
          onValueChange={setValue}
          items={items}
          isLoading={loading}
          placeholder="Search users or type an email…"
        />
        <p className="text-muted-foreground mt-2 text-xs">
          Value: <span className="font-mono">{value || '—'}</span>
        </p>
      </div>
    );
  },
};
