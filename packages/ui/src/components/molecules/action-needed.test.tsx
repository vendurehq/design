import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import { slotTag } from '../../test/slot-tokens.ts';
import {
  ActionNeeded,
  type ActionNeededItem,
  actionNeededCounts,
  type FoldMemoryStorage,
  opensOnLoad,
  readFoldMemory,
  storeFoldMemory,
} from './action-needed.tsx';

function memoryStorage(): FoldMemoryStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
  };
}

const ITEMS: ActionNeededItem[] = [
  { key: 'password', tone: 'warning', title: 'Default superadmin password' },
  { key: 'shipping', tone: 'critical', title: 'No shipping method' },
  { key: 'index', tone: 'warning', title: 'Search index out of date' },
];

describe('fold memory', () => {
  test('opens for a new key, and keeps the stored choice otherwise', () => {
    const storage = memoryStorage();
    expect(readFoldMemory(storage, 'channel-1')).toBeNull();
    storeFoldMemory(storage, 'channel-1', { open: false, keys: ['a', 'b'] });
    const memory = readFoldMemory(storage, 'channel-1');
    expect(memory).toEqual({ open: false, keys: ['a', 'b'] });
    if (!memory) return;
    expect(opensOnLoad(memory, ['a'])).toBe(false);
    expect(opensOnLoad(memory, ['a', 'c'])).toBe(true);
    expect(opensOnLoad({ open: true, keys: ['a'] }, ['a'])).toBe(true);
  });

  test('keeps one memory per key, under the vendure-ui key scheme', () => {
    const storage = memoryStorage();
    storeFoldMemory(storage, 'channel-1', { open: false, keys: [] });
    expect(readFoldMemory(storage, 'channel-2')).toBeNull();
    expect([...storage.values.keys()]).toEqual(['vendure-ui:action-needed:fold:channel-1']);
  });

  test('treats a damaged or old value as nothing stored', () => {
    const storage = memoryStorage();
    for (const value of ['{not json', '{"a":1}', '["a"]', '{"open":"yes","keys":[]}', 'null']) {
      storage.setItem('vendure-ui:action-needed:fold:c', value);
      expect(readFoldMemory(storage, 'c')).toBeNull();
    }
    storage.setItem('vendure-ui:action-needed:fold:c', '{"open":false,"keys":["a",1]}');
    expect(readFoldMemory(storage, 'c')).toEqual({ open: false, keys: ['a'] });
  });

  test('a storage that throws loses the memory and nothing else', () => {
    const broken: FoldMemoryStorage = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('full');
      },
    };
    expect(readFoldMemory(broken, 'c')).toBeNull();
    expect(() => storeFoldMemory(broken, 'c', { open: true, keys: [] })).not.toThrow();
  });
});

describe('actionNeededCounts', () => {
  test('counts each tone once, worst first, without empty tones', () => {
    expect(actionNeededCounts(ITEMS)).toEqual([
      { tone: 'critical', count: 1 },
      { tone: 'warning', count: 2 },
    ]);
  });
});

const TITLE = 'Store setup';

describe('ActionNeeded', () => {
  test('renders nothing without findings', () => {
    expect(renderToStaticMarkup(<ActionNeeded items={[]} title={TITLE} />)).toBe('');
  });

  test('open: the header is one expanded button, the badges are hidden, the rows not inert', () => {
    const html = renderToStaticMarkup(
      <ActionNeeded
        description="Fix these before this channel can take orders."
        items={ITEMS}
        storage={null}
        title={TITLE}
      />,
    );
    expect(slotTag(html, 'action-needed-trigger')).toContain('aria-expanded="true"');
    expect(slotTag(html, 'action-needed-counts')).toContain('aria-hidden="true"');
    expect(slotTag(html, 'action-needed')).toContain('data-open');
    expect(html).not.toContain('inert');
    const button = html.slice(html.indexOf('<button'), html.indexOf('</button>'));
    for (const text of [TITLE, 'Fix these before this channel can take orders.']) {
      expect(button).toContain(text);
    }
    expect(html).not.toContain('Action needed');
  });

  test('folded: the badges are readable and the rows stay in the page, inert', () => {
    const html = renderToStaticMarkup(<ActionNeeded items={ITEMS} open={false} title={TITLE} />);
    expect(slotTag(html, 'action-needed-trigger')).toContain('aria-expanded="false"');
    expect(slotTag(html, 'action-needed-counts')).not.toContain('aria-hidden');
    expect(slotTag(html, 'action-needed')).not.toContain('data-open');
    expect(html.match(/inert=""/g)?.length).toBe(3);
    expect(html).toContain('1 error');
    expect(html).toContain('2 warnings');
  });

  test('shows the findings in the order given, as a list', () => {
    const html = renderToStaticMarkup(<ActionNeeded items={ITEMS} storage={null} title={TITLE} />);
    const positions = ITEMS.map((item) => html.indexOf(String(item.title)));
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(slotTag(html, 'action-needed-list')).toContain('role="list"');
    expect(html.match(/role="listitem"/g)?.length).toBe(3);
  });

  test('a row shows the tone on its icon, the description and the action', () => {
    const html = renderToStaticMarkup(
      <ActionNeeded
        items={[
          {
            key: 'a',
            tone: 'critical',
            title: 'No shipping method',
            description: 'Customers cannot check out.',
            action: <button type="button">Set up shipping</button>,
          },
        ]}
        storage={null}
        title={TITLE}
      />,
    );
    expect(slotTag(html, 'action-needed-icon')).toContain('text-destructive-text');
    expect(html).toContain('Customers cannot check out.');
    expect(slotTag(html, 'action-needed-action')).toBeTruthy();
    expect(html).toContain('Set up shipping');
  });

  test('countLabel translates the badges', () => {
    const html = renderToStaticMarkup(
      <ActionNeeded
        countLabel={(count, tone) =>
          tone === 'critical'
            ? `${count} Fehler`
            : `${count} ${count === 1 ? 'Warnung' : 'Warnungen'}`
        }
        items={ITEMS}
        open={false}
        title="Handlungsbedarf"
      />,
    );
    expect(html).toContain('Handlungsbedarf');
    expect(html).toContain('1 Fehler');
    expect(html).toContain('2 Warnungen');
  });

  test('renderItem replaces the default row', () => {
    const html = renderToStaticMarkup(
      <ActionNeeded
        items={ITEMS}
        renderItem={(item) => <p>custom {item.key}</p>}
        storage={null}
        title={TITLE}
      />,
    );
    expect(html).toContain('<p>custom shipping</p>');
    expect(html).not.toContain('data-slot="action-needed-row"');
  });
});
