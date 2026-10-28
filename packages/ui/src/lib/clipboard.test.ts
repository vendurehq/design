import { afterEach, describe, expect, mock, test } from 'bun:test';

import { writeToClipboard } from './clipboard.ts';

const OriginalClipboardItem = globalThis.ClipboardItem;

/** Minimal ClipboardItem that records the promise it was given. */
class FakeClipboardItem {
  constructor(readonly items: Record<string, Promise<Blob>>) {}
}

afterEach(() => {
  globalThis.ClipboardItem = OriginalClipboardItem;
});

describe('writeToClipboard', () => {
  test('writes a string with writeText', async () => {
    const writeText = mock(async (_text: string) => {});
    await writeToClipboard('sk_live_123', { writeText });
    expect(writeText).toHaveBeenCalledWith('sk_live_123');
  });

  test('starts the ClipboardItem write before the loader settles', async () => {
    globalThis.ClipboardItem = FakeClipboardItem as unknown as typeof ClipboardItem;
    let resolve = (_value: string) => {};
    const load = mock(() => new Promise<string>((r) => (resolve = r)));
    const writeText = mock(async (_text: string) => {});
    let written: Promise<Blob> | undefined;
    const write = mock(async (items: ClipboardItems) => {
      written = (items[0] as unknown as FakeClipboardItem).items['text/plain'];
      await written;
    });

    const done = writeToClipboard(load, { writeText, write });
    expect(write).toHaveBeenCalledTimes(1);
    resolve('sk_live_123');
    await done;

    expect(load).toHaveBeenCalledTimes(1);
    expect(await (await written)?.text()).toBe('sk_live_123');
    expect(writeText).not.toHaveBeenCalled();
  });

  test('falls back to writeText when the promise-valued item is rejected', async () => {
    globalThis.ClipboardItem = FakeClipboardItem as unknown as typeof ClipboardItem;
    const load = mock(async () => 'sk_live_123');
    const writeText = mock(async (_text: string) => {});
    const write = mock(async () => {
      throw new TypeError('Promise values are not supported');
    });

    await writeToClipboard(load, { writeText, write });

    expect(load).toHaveBeenCalledTimes(1);
    expect(writeText).toHaveBeenCalledWith('sk_live_123');
  });

  test('falls back to writeText when ClipboardItem is missing', async () => {
    // @ts-expect-error simulate a browser without ClipboardItem
    globalThis.ClipboardItem = undefined;
    const writeText = mock(async (_text: string) => {});
    await writeToClipboard(async () => 'sk_live_123', { writeText, write: mock(async () => {}) });
    expect(writeText).toHaveBeenCalledWith('sk_live_123');
  });

  test('rejects with the loader error and writes nothing', async () => {
    globalThis.ClipboardItem = FakeClipboardItem as unknown as typeof ClipboardItem;
    const writeText = mock(async (_text: string) => {});
    const write = mock(async (items: ClipboardItems) => {
      await (items[0] as unknown as FakeClipboardItem).items['text/plain'];
    });

    await expect(
      writeToClipboard(
        async () => {
          throw new Error('Forbidden');
        },
        { writeText, write },
      ),
    ).rejects.toThrow('Forbidden');
    expect(writeText).not.toHaveBeenCalled();
  });
});
