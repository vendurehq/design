import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
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
// after a short delay, toggling `loading` the way a real async source would.
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
          loading={loading}
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
          loading={loading}
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
          loading={loading}
          placeholder="Search users or type an email…"
        />
        <p className="text-muted-foreground mt-2 text-xs">
          Value: <span className="font-mono">{value || '—'}</span>
        </p>
      </div>
    );
  },
};
