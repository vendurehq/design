/** Text to copy, or a callback that loads it on demand. */
export type ClipboardSource = string | (() => Promise<string>);

type ClipboardWriter = Pick<Clipboard, 'writeText'> & Partial<Pick<Clipboard, 'write'>>;

/**
 * Writes text to the clipboard. A loader is called once. Where `ClipboardItem`
 * accepts a promise, the write starts synchronously with a promise of the
 * text, so Safari keeps the user gesture across the async load. Elsewhere it
 * falls back to `writeText` once the text has loaded. Rejects when the loader
 * or the clipboard fails.
 */
export async function writeToClipboard(
  source: ClipboardSource,
  clipboard: ClipboardWriter = navigator.clipboard,
): Promise<void> {
  if (typeof source === 'string') {
    await clipboard.writeText(source);
    return;
  }

  const text = source();
  if (clipboard.write && typeof ClipboardItem !== 'undefined') {
    const blob = text.then((value) => new Blob([value], { type: 'text/plain' }));
    // The write below owns this rejection; keep it from surfacing as unhandled
    // when the ClipboardItem path is abandoned for the fallback.
    blob.catch(() => {});
    try {
      await clipboard.write([new ClipboardItem({ 'text/plain': blob })]);
      return;
    } catch {
      // A failed load is the real error. Otherwise the browser rejected the
      // promise-valued item: fall back to writeText.
      await text;
    }
  }
  await clipboard.writeText(await text);
}
