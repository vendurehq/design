import { supportsNotationComments } from '@vendure-io/ui/lib/highlight';

/**
 * Process code to extract filename directive and strip Shiki notations for unsupported languages.
 * Supports: // filename: path/to/file.ts (must be first line)
 *
 * Note: Line highlighting uses Shiki's native notation:
 * - // [!code highlight] for JS/TS (at end of line)
 * - # [!code highlight] for bash/shell (at end of line)
 * - // [!code ++] and // [!code --] for diff
 * - // [!code focus] for focus mode
 *
 * For languages where the notation would not survive highlighting (see
 * `supportsNotationComments`), these notations are stripped.
 */
function processCode(
  code: string,
  language?: string,
): {
  cleanCode: string;
  extractedFilename?: string;
} {
  const lines = code.split('\n');
  const cleanLines: string[] = [];
  let extractedFilename: string | undefined;

  const shouldStripNotations = !supportsNotationComments(language);

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i] ?? '';
    const trimmedLine = line.trim();

    // Check for filename directive (must be first non-empty line)
    if (i === 0 || (cleanLines.length === 0 && !extractedFilename)) {
      const filenameMatch = trimmedLine.match(/^\/\/\s*filename:\s*(.+)$/);
      if (filenameMatch) {
        extractedFilename = filenameMatch[1]?.trim();
        continue; // Don't include this directive line
      }
    }

    if (shouldStripNotations) {
      line = line.replace(/\s*\/\/\s*\[!code\s+[^\]]+\]\s*$/, '');
      line = line.replace(/\s*#\s*\[!code\s+[^\]]+\]\s*$/, '');
      // Skip lines that are only the notation (e.g., standalone "// [!code highlight]")
      if (trimmedLine.match(/^(\/\/|#)\s*\[!code\s+[^\]]+\]\s*$/)) {
        continue;
      }
    }

    cleanLines.push(line);
  }

  return {
    cleanCode: cleanLines.join('\n'),
    extractedFilename,
  };
}

export { processCode };
