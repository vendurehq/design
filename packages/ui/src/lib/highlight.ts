import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers';
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

/**
 * The design system's Shiki setup: a lazy shared highlighter with the DS themes
 * (github-light / github-dark-default), a fixed grammar set, and the `[!code ...]`
 * notation transformers. Exported so consumers rendering highlighted HTML outside
 * of `CodeBlock` (e.g. custom docs pipelines) reuse the exact same setup instead
 * of duplicating it — and get the lazy per-language chunks instead of the full
 * Shiki bundle.
 */

const languageLoaders = {
  bash: () => import('@shikijs/langs/bash').then((module) => module.default),
  css: () => import('@shikijs/langs/css').then((module) => module.default),
  dotenv: () => import('@shikijs/langs/dotenv').then((module) => module.default),
  graphql: () => import('@shikijs/langs/graphql').then((module) => module.default),
  html: () => import('@shikijs/langs/html').then((module) => module.default),
  ini: () => import('@shikijs/langs/ini').then((module) => module.default),
  javascript: () => import('@shikijs/langs/javascript').then((module) => module.default),
  json: () => import('@shikijs/langs/json').then((module) => module.default),
  jsonc: () => import('@shikijs/langs/jsonc').then((module) => module.default),
  jsx: () => import('@shikijs/langs/jsx').then((module) => module.default),
  markdown: () => import('@shikijs/langs/markdown').then((module) => module.default),
  mdx: () => import('@shikijs/langs/mdx').then((module) => module.default),
  python: () => import('@shikijs/langs/python').then((module) => module.default),
  shellscript: () => import('@shikijs/langs/shellscript').then((module) => module.default),
  sql: () => import('@shikijs/langs/sql').then((module) => module.default),
  tsx: () => import('@shikijs/langs/tsx').then((module) => module.default),
  typescript: () => import('@shikijs/langs/typescript').then((module) => module.default),
  yaml: () => import('@shikijs/langs/yaml').then((module) => module.default),
} as const;

type SupportedLanguage = keyof typeof languageLoaders;

const themeLoaders = [
  () => import('@shikijs/themes/github-light').then((module) => module.default),
  () => import('@shikijs/themes/github-dark-default').then((module) => module.default),
] as const;

let highlighterPromise: ReturnType<typeof createHighlighterCore> | null = null;

function getHighlighter(): ReturnType<typeof createHighlighterCore> {
  highlighterPromise ??= Promise.all([
    Promise.all(themeLoaders.map((loadTheme) => loadTheme())),
    Promise.all(Object.values(languageLoaders).map((loadLanguage) => loadLanguage())),
  ]).then(([themes, languages]) =>
    createHighlighterCore({
      themes,
      langs: languages.flat(),
      engine: createJavaScriptRegexEngine(),
    }),
  );

  return highlighterPromise;
}

const highlightedCodeCache = new Map<string, Promise<string>>();

/**
 * Highlight code using Shiki with all transformers.
 * Uses Shiki's native notation for highlighting:
 * - // [!code highlight] - highlight a line (use language-appropriate comment)
 * - // [!code ++] / // [!code --] - diff highlighting
 * - // [!code focus] - focus mode (blur other lines)
 * - // [!code word:myVar] - highlight specific word
 * - // [!code error] / // [!code warning] - error levels
 */
async function highlightCode(code: string, language: SupportedLanguage): Promise<string> {
  const cacheKey = `${language}:${code}`;
  const cached = highlightedCodeCache.get(cacheKey);
  if (cached) return cached;

  const highlighted = getHighlighter().then((highlighter) =>
    highlighter.codeToHtml(code, {
      lang: language,
      themes: {
        light: 'github-light',
        dark: 'github-dark-default',
      },
      transformers: [
        transformerNotationDiff({ matchAlgorithm: 'v3' }),
        transformerNotationHighlight({ matchAlgorithm: 'v3' }),
        transformerNotationWordHighlight({ matchAlgorithm: 'v3' }),
        transformerNotationFocus({ matchAlgorithm: 'v3' }),
        transformerNotationErrorLevel({ matchAlgorithm: 'v3' }),
      ],
    }),
  );
  highlightedCodeCache.set(cacheKey, highlighted);
  return highlighted;
}

/**
 * Language aliases that map to Shiki's bundled language names
 */
const LANGUAGE_ALIASES: Record<string, SupportedLanguage> = {
  env: 'dotenv',
  js: 'javascript',
  ts: 'typescript',
  sh: 'bash',
  shell: 'bash',
  yml: 'yaml',
  py: 'python',
  md: 'markdown',
  plaintext: 'ini',
  text: 'ini',
  chroma: 'ini',
};

/**
 * Normalize language identifier for Shiki/BundledLanguage.
 * Falls back to 'ini' for unsupported languages (minimal highlighting).
 */
function normalizeLanguage(lang?: string): SupportedLanguage {
  const normalized = lang?.toLowerCase() || 'ini';

  // Check for aliases first
  const alias = LANGUAGE_ALIASES[normalized];
  if (alias) {
    return alias;
  }

  // Check if the language is one of the explicitly bundled grammars.
  if (normalized in languageLoaders) {
    return normalized as SupportedLanguage;
  }

  // Fallback to 'ini' for unsupported languages (has minimal highlighting)
  return 'ini';
}

/**
 * Bundled grammars whose `//` / `#` comment syntax lets the `[!code ...]`
 * notation transformers match. Only languages with a loader above can qualify:
 * anything else falls back to the `ini` grammar, which renders the notation
 * comment as literal text instead of consuming it.
 */
const NOTATION_TRANSFORMER_LANGUAGES = new Set<SupportedLanguage>([
  'javascript',
  'typescript',
  'jsx',
  'tsx',
  'python',
  'bash',
  'shellscript',
  'yaml',
]);

/**
 * Whether `[!code ...]` notations in `lang` survive highlighting. Alias-aware:
 * the check runs on the normalized language, so `ts`, `py`, `sh`, … qualify
 * through their canonical grammar. Callers should strip notations when this
 * returns false, or they render as literal text.
 */
function supportsNotationComments(lang?: string): boolean {
  return NOTATION_TRANSFORMER_LANGUAGES.has(normalizeLanguage(lang));
}

export {
  NOTATION_TRANSFORMER_LANGUAGES,
  getHighlighter,
  highlightCode,
  normalizeLanguage,
  supportsNotationComments,
};
export type { SupportedLanguage };
