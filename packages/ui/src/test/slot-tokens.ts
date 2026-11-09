// Test helper, not shipped: the package `files` list leaves out src/test.

/** Decodes the HTML entities React escapes inside a class attribute. */
function decode(value: string): string {
  return value
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&amp;/g, '&');
}

/**
 * The opening tag of the first element with the given data-slot in
 * server-rendered HTML. Throws when no element has the slot, so a renamed slot
 * fails loudly.
 */
export function slotTag(html: string, slot: string): string {
  const tag = html.match(new RegExp(`<[a-z][^>]*data-slot="${slot}"[^>]*>`))?.[0];
  if (!tag) throw new Error(`No ${slot} rendered`);
  return tag;
}

/** The class tokens of an opening tag, entity-decoded. */
export function tagTokens(tag: string): string[] {
  return decode(tag.match(/class="([^"]*)"/)?.[1] ?? '')
    .split(/\s+/)
    .filter(Boolean);
}

/** The class tokens of the first element with the given data-slot. */
export function slotTokens(html: string, slot: string): string[] {
  return tagTokens(slotTag(html, slot));
}
