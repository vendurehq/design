'use client';

import {
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
} from '@shikijs/transformers';
import { Button } from '@vendure-io/ui/components/atoms/button';
import { ScrollArea, ScrollBar } from '@vendure-io/ui/components/atoms/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@vendure-io/ui/components/atoms/tooltip';
import { useCopy } from '@vendure-io/ui/hooks/use-copy';
import { cn } from '@vendure-io/ui/lib/utils';
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CodeIcon,
  CopyIcon,
  FileIcon,
  TerminalIcon,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  type ComponentProps,
  type PropsWithChildren,
  type ReactNode,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createHighlighterCore } from 'shiki/core';
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript';

// =============================================================================
// Types
// =============================================================================

type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

type CodeBlockProps = PropsWithChildren<ComponentProps<'div'>> & {
  /** Programming language for syntax highlighting */
  language?: string;
  /**
   * Filename shown in the header (overrides a `// filename:` first-line directive).
   * Takes precedence over the package-manager tabs. A block with a filename never
   * shows the switcher, even when `packageManagerSwitcher` is set.
   */
  filename?: string;
  /** Hide the header bar completely */
  hideHeader?: boolean;
  /** Enable npm→pnpm/yarn/bun tab switching for shell blocks containing npm/npx commands. @default false */
  packageManagerSwitcher?: boolean;
  /** Extra toolbar actions rendered before the built-in copy button. Compose with CodeBlockAction. */
  actions?: ReactNode;
  /** Called after a successful copy. Wire your toast here. The DS never toasts. */
  onCopied?: () => void;
  /** Called when the clipboard write fails. */
  onCopyError?: (error: Error) => void;
};

interface CodeBlockActionProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const PACKAGE_MANAGERS: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun'];
const STORAGE_KEY = 'vendure-ui-package-manager';
const STORAGE_EVENT = 'vendure-ui-package-manager-change';

// Expand/collapse constants
const COLLAPSE_THRESHOLD = 40; // Lines needed to trigger collapse
const COLLAPSED_HEIGHT = 300; // px height when collapsed (roughly 15-20 lines)

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
 * Get the stored package manager preference from localStorage
 */
function getStoredPackageManager(): PackageManager {
  if (typeof window === 'undefined') return 'npm';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && PACKAGE_MANAGERS.includes(stored as PackageManager)) {
      return stored as PackageManager;
    }
  } catch {
    // localStorage might not be available
  }
  return 'npm';
}

/**
 * Store the package manager preference in localStorage
 */
function setStoredPackageManager(pm: PackageManager): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, pm);
    // Dispatch a custom event so other CodeBlock instances can update
    window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: pm }));
  } catch {
    // localStorage might not be available
  }
}

/**
 * Custom hook to manage package manager state with localStorage persistence
 */
function usePackageManager(): [PackageManager, (pm: PackageManager) => void] {
  const [packageManager, setPackageManager] = useState<PackageManager>('npm');

  // Initialize from localStorage on mount
  useEffect(() => {
    setPackageManager(getStoredPackageManager());
  }, []);

  // Listen for changes from other CodeBlock instances
  useEffect(() => {
    const handleChange = (e: CustomEvent<PackageManager>) => {
      setPackageManager(e.detail);
    };

    window.addEventListener(STORAGE_EVENT, handleChange as EventListener);
    return () => {
      window.removeEventListener(STORAGE_EVENT, handleChange as EventListener);
    };
  }, []);

  const updatePackageManager = (pm: PackageManager) => {
    setPackageManager(pm);
    setStoredPackageManager(pm);
  };

  return [packageManager, updatePackageManager];
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Detects if a single line is an npm/npx command that can be transformed
 */
function isNpmLine(line: string): boolean {
  const trimmed = line.trim();
  return /^(npm\s+(install|i|add|run|exec|create|init|ci|remove|uninstall|rm)|npx\s+)/.test(
    trimmed,
  );
}

/**
 * Detects if the code contains any package manager commands that can be transformed
 */
function isPackageManagerCommand(code: string): boolean {
  const lines = code.split('\n');
  return lines.some((line) => isNpmLine(line));
}

/**
 * Transforms a single npm/npx command line to the equivalent for other package managers
 */
function transformSingleLine(line: string, targetPm: PackageManager): string {
  const trimmed = line.trim();

  if (targetPm === 'npm') return line;

  // Handle npx commands
  if (trimmed.startsWith('npx ')) {
    const rest = trimmed.slice(4);
    switch (targetPm) {
      case 'pnpm':
        return `pnpm dlx ${rest}`;
      case 'yarn':
        return `yarn dlx ${rest}`;
      case 'bun':
        return `bunx ${rest}`;
    }
  }

  // Handle npm create / npm init
  if (/^npm\s+(create|init)\s+/.test(trimmed)) {
    const match = trimmed.match(/^npm\s+(create|init)\s+(.+)$/);
    if (match) {
      const args = match[2];
      switch (targetPm) {
        case 'pnpm':
          return `pnpm create ${args}`;
        case 'yarn':
          return `yarn create ${args}`;
        case 'bun':
          return `bun create ${args}`;
      }
    }
  }

  // Handle npm install / npm i / npm add (with packages)
  if (/^npm\s+(install|i|add)\s+/.test(trimmed)) {
    const match = trimmed.match(/^npm\s+(install|i|add)\s+(.+)$/);
    if (match) {
      const packages = match[2] ?? '';
      // Handle flags
      const devFlag = packages.includes('-D') || packages.includes('--save-dev');
      const cleanPackages = packages
        .replace(/\s*-D\s*/, ' ')
        .replace(/\s*--save-dev\s*/, ' ')
        .trim();

      switch (targetPm) {
        case 'pnpm':
          return devFlag ? `pnpm add -D ${cleanPackages}` : `pnpm add ${cleanPackages}`;
        case 'yarn':
          return devFlag ? `yarn add -D ${cleanPackages}` : `yarn add ${cleanPackages}`;
        case 'bun':
          return devFlag ? `bun add -d ${cleanPackages}` : `bun add ${cleanPackages}`;
      }
    }
  }

  // Handle npm install (without packages - install from package.json)
  if (/^npm\s+(install|i|ci)$/.test(trimmed)) {
    switch (targetPm) {
      case 'pnpm':
        return 'pnpm install';
      case 'yarn':
        return 'yarn';
      case 'bun':
        return 'bun install';
    }
  }

  // Handle npm run <script>
  if (/^npm\s+run\s+/.test(trimmed)) {
    const match = trimmed.match(/^npm\s+run\s+(.+)$/);
    if (match) {
      const script = match[1];
      switch (targetPm) {
        case 'pnpm':
          return `pnpm run ${script}`;
        case 'yarn':
          return `yarn ${script}`;
        case 'bun':
          return `bun run ${script}`;
      }
    }
  }

  // Handle npm remove / npm uninstall / npm rm
  if (/^npm\s+(remove|uninstall|rm)\s+/.test(trimmed)) {
    const match = trimmed.match(/^npm\s+(remove|uninstall|rm)\s+(.+)$/);
    if (match) {
      const packages = match[2];
      switch (targetPm) {
        case 'pnpm':
          return `pnpm remove ${packages}`;
        case 'yarn':
          return `yarn remove ${packages}`;
        case 'bun':
          return `bun remove ${packages}`;
      }
    }
  }

  // Handle npm exec
  if (/^npm\s+exec\s+/.test(trimmed)) {
    const match = trimmed.match(/^npm\s+exec\s+(.+)$/);
    if (match) {
      const rest = match[1];
      switch (targetPm) {
        case 'pnpm':
          return `pnpm exec ${rest}`;
        case 'yarn':
          return `yarn exec ${rest}`;
        case 'bun':
          return `bun x ${rest}`;
      }
    }
  }

  return line;
}

/**
 * Transforms all npm/npx commands in a code block to the target package manager.
 * Leaves non-npm lines unchanged.
 */
function transformCommand(code: string, targetPm: PackageManager): string {
  if (targetPm === 'npm') return code;

  const lines = code.split('\n');
  const transformedLines = lines.map((line) => {
    if (isNpmLine(line)) {
      return transformSingleLine(line, targetPm);
    }
    return line;
  });

  return transformedLines.join('\n');
}

/**
 * Languages where Shiki transformers work (have // or # comment syntax)
 */
const SHIKI_TRANSFORMER_LANGUAGES = new Set([
  'javascript',
  'js',
  'typescript',
  'ts',
  'tsx',
  'jsx',
  'java',
  'c',
  'cpp',
  'csharp',
  'cs',
  'go',
  'rust',
  'swift',
  'kotlin',
  'scala',
  'php',
  'ruby',
  'python',
  'py',
  'bash',
  'shell',
  'sh',
  'zsh',
  'yaml',
  'yml',
]);

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
 * For languages like 'text' that don't support comments, these notations are stripped.
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

  // Check if we need to strip Shiki notations (for languages without comment support)
  const shouldStripNotations = !SHIKI_TRANSFORMER_LANGUAGES.has(language?.toLowerCase() || '');

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

    // Strip Shiki notations for unsupported languages
    if (shouldStripNotations) {
      // Remove // [!code ...] notations
      line = line.replace(/\s*\/\/\s*\[!code\s+[^\]]+\]\s*$/, '');
      // Remove # [!code ...] notations
      line = line.replace(/\s*#\s*\[!code\s+[^\]]+\]\s*$/, '');
      // Skip lines that are only the notation (e.g., standalone "// [!code highlight]")
      if (trimmedLine.match(/^(\/\/|#)\s*\[!code\s+[^\]]+\]\s*$/)) {
        continue;
      }
    }

    // Add line to clean output
    cleanLines.push(line);
  }

  return {
    cleanCode: cleanLines.join('\n'),
    extractedFilename,
  };
}

// =============================================================================
// Shiki Highlighting
// =============================================================================

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
 * Escape HTML special characters for safe display (fallback)
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// =============================================================================
// File Type Icons
// =============================================================================

/**
 * Brand glyphs for common file extensions, shown next to the filename in the
 * header. Path data is inlined from Simple Icons (CC0) so the package takes no
 * icon dependency; glyphs render monochrome via currentColor and inherit the
 * muted header foreground. Unknown extensions fall back to the generic
 * lucide FileIcon.
 */
interface FileTypeIconDef {
  /** Brand name of the glyph */
  title: string;
  /** SVG path data on a 24x24 viewBox */
  path: string;
}

const typescriptIcon: FileTypeIconDef = {
  title: 'TypeScript',
  path: 'M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z',
};

const reactIcon: FileTypeIconDef = {
  title: 'React',
  path: 'M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z',
};

const javascriptIcon: FileTypeIconDef = {
  title: 'JavaScript',
  path: 'M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z',
};

const jsonIcon: FileTypeIconDef = {
  title: 'JSON',
  path: 'M12.043 23.968c.479-.004.953-.029 1.426-.094a11.805 11.805 0 003.146-.863 12.404 12.404 0 003.793-2.542 11.977 11.977 0 002.44-3.427 11.794 11.794 0 001.02-3.476c.149-1.16.135-2.346-.045-3.499a11.96 11.96 0 00-.793-2.788 11.197 11.197 0 00-.854-1.617c-1.168-1.837-2.861-3.314-4.81-4.3a12.835 12.835 0 00-2.172-.87h-.005c.119.063.24.132.345.201.12.074.239.146.351.225a8.93 8.93 0 011.559 1.33c1.063 1.145 1.797 2.548 2.218 4.041.284.982.434 1.998.495 3.017.044.743.044 1.491-.047 2.229-.149 1.27-.554 2.51-1.228 3.596a7.475 7.475 0 01-1.903 2.084c-1.244.928-2.877 1.482-4.436 1.114a3.916 3.916 0 01-.748-.258 4.692 4.692 0 01-.779-.45 6.08 6.08 0 01-1.244-1.105 6.507 6.507 0 01-1.049-1.747 7.366 7.366 0 01-.494-2.54c-.03-1.273.225-2.553.854-3.67a6.43 6.43 0 011.663-1.918c.225-.178.464-.333.704-.479l.016-.007a5.121 5.121 0 00-1.441-.12 4.963 4.963 0 00-1.228.24c-.359.12-.704.27-1.019.45a6.146 6.146 0 00-.733.494c-.211.18-.42.36-.615.555-1.123 1.153-1.768 2.682-2.022 4.256-.15.973-.15 1.96-.091 2.95.105 1.395.391 2.787.945 4.062a8.518 8.518 0 001.348 2.173 8.14 8.14 0 003.132 2.23 7.934 7.934 0 002.113.54c.074.015.149.015.209.015zm-2.934-.398a4.102 4.102 0 01-.45-.228 8.5 8.5 0 01-2.038-1.534c-1.094-1.137-1.827-2.566-2.247-4.08a15.184 15.184 0 01-.495-3.172 12.14 12.14 0 01.046-2.082c.135-1.257.495-2.501 1.124-3.58a6.889 6.889 0 011.783-2.053 6.23 6.23 0 011.633-.9 5.363 5.363 0 013.522-.045c.029 0 .029 0 .045.03.015.015.045.015.06.03.045.016.104.045.165.074.239.12.479.271.704.42a6.294 6.294 0 012.097 2.502c.42.914.615 1.934.631 2.938.014 1.079-.18 2.157-.645 3.146a6.42 6.42 0 01-2.638 2.832c.09.03.18.045.271.075.225.044.449.074.688.074 1.468.045 2.892-.66 3.94-1.647.195-.18.375-.375.54-.585.225-.27.435-.54.614-.823.239-.375.435-.75.614-1.154a8.112 8.112 0 00.509-1.664c.196-1.004.211-2.022.149-3.026-.135-2.022-.673-4.045-1.842-5.724a9.054 9.054 0 00-.555-.719 9.868 9.868 0 00-1.063-1.034 8.477 8.477 0 00-1.363-.915 9.927 9.927 0 00-1.692-.598l-.3-.06c-.209-.03-.42-.044-.634-.06a8.453 8.453 0 00-1.015.016c-.704.045-1.412.16-2.112.337C5.799 1.227 2.863 3.566 1.3 6.67A11.834 11.834 0 00.238 9.801a11.81 11.81 0 00-.104 3.775c.12 1.02.374 2.023.778 2.977.227.57.511 1.124.825 1.648 1.094 1.783 2.683 3.236 4.51 4.24.688.39 1.408.69 2.157.944.226.074.45.15.689.21z',
};

const htmlIcon: FileTypeIconDef = {
  title: 'HTML5',
  path: 'M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm7.031 9.75l-.232-2.718 10.059.003.23-2.622L5.412 4.41l.698 8.01h9.126l-.326 3.426-2.91.804-2.955-.81-.188-2.11H6.248l.33 4.171L12 19.351l5.379-1.443.744-8.157H8.531z',
};

const cssIcon: FileTypeIconDef = {
  title: 'CSS',
  path: 'M0 0v20.16A3.84 3.84 0 0 0 3.84 24h16.32A3.84 3.84 0 0 0 24 20.16V3.84A3.84 3.84 0 0 0 20.16 0Zm14.256 13.08c1.56 0 2.28 1.08 2.304 2.64h-1.608c.024-.288-.048-.6-.144-.84-.096-.192-.288-.264-.552-.264-.456 0-.696.264-.696.84-.024.576.288.888.768 1.08.72.288 1.608.744 1.92 1.296q.432.648.432 1.656c0 1.608-.912 2.592-2.496 2.592-1.656 0-2.4-1.032-2.424-2.688h1.68c0 .792.264 1.176.792 1.176.264 0 .456-.072.552-.24.192-.312.24-1.176-.048-1.512-.312-.408-.912-.6-1.32-.816q-.828-.396-1.224-.936c-.24-.36-.36-.888-.36-1.536 0-1.44.936-2.472 2.424-2.448m5.4 0c1.584 0 2.304 1.08 2.328 2.64h-1.608c0-.288-.048-.6-.168-.84-.096-.192-.264-.264-.528-.264-.48 0-.72.264-.72.84s.288.888.792 1.08c.696.288 1.608.744 1.92 1.296.264.432.408.984.408 1.656.024 1.608-.888 2.592-2.472 2.592-1.68 0-2.424-1.056-2.448-2.688h1.68c0 .744.264 1.176.792 1.176.264 0 .456-.072.552-.24.216-.312.264-1.176-.048-1.512-.288-.408-.888-.6-1.32-.816-.552-.264-.96-.576-1.2-.936s-.36-.888-.36-1.536c-.024-1.44.912-2.472 2.4-2.448m-11.031.018c.711-.006 1.419.198 1.839.63.432.432.672 1.128.648 1.992H9.336c.024-.456-.096-.792-.432-.96-.312-.144-.768-.048-.888.24-.12.264-.192.576-.168.864v3.504c0 .744.264 1.128.768 1.128a.65.65 0 0 0 .552-.264c.168-.24.192-.552.168-.84h1.776c.096 1.632-.984 2.712-2.568 2.688-1.536 0-2.496-.864-2.472-2.472v-4.032c0-.816.24-1.44.696-1.848.432-.408 1.146-.624 1.857-.63',
};

const markdownIcon: FileTypeIconDef = {
  title: 'Markdown',
  path: 'M22.27 19.385H1.73A1.73 1.73 0 010 17.655V6.345a1.73 1.73 0 011.73-1.73h20.54A1.73 1.73 0 0124 6.345v11.308a1.73 1.73 0 01-1.73 1.731zM5.769 15.923v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.078h-2.308l-2.307 2.885-2.308-2.885H3.46v7.847zM21.232 12h-2.309V8.077h-2.307V12h-2.308l3.461 4.039z',
};

const mdxIcon: FileTypeIconDef = {
  title: 'MDX',
  path: 'M.79 7.12h22.42c.436 0 .79.355.79.792v8.176c0 .436-.354.79-.79.79H.79a.79.79 0 0 1-.79-.79V7.912a.79.79 0 0 1 .79-.791V7.12Zm2.507 7.605v-3.122l1.89 1.89L7.12 11.56v3.122h1.055v-5.67l-2.99 2.99L2.24 9.056v5.67h1.055v-.001Zm8.44-1.845-1.474-1.473-.746.746 2.747 2.747 2.745-2.747-.746-.746-1.473 1.473v-4h-1.054v4Zm10.041.987-2.175-2.175 2.22-2.22-.746-.746-2.22 2.22-2.22-2.22-.747.746 2.22 2.22-2.176 2.177.746.746 2.177-2.177 2.176 2.175.745-.746Z',
};

const yamlIcon: FileTypeIconDef = {
  title: 'YAML',
  path: 'm0 .97 4.111 6.453v4.09h2.638v-4.09L11.053.969H8.214L5.58 5.125 2.965.969Zm12.093.024-4.47 10.544h2.114l.97-2.345h4.775l.804 2.345h2.26L14.255.994Zm1.133 2.225 1.463 3.87h-3.096zm3.06 9.475v10.29H24v-2.199h-5.454v-8.091zm-12.175.002v10.335h2.217v-7.129l2.32 4.792h1.746l2.4-4.96v7.295h2.127V12.696h-2.904L9.44 17.37l-2.455-4.674Z',
};

const graphqlIcon: FileTypeIconDef = {
  title: 'GraphQL',
  path: 'M12.002 0a2.138 2.138 0 1 0 0 4.277 2.138 2.138 0 1 0 0-4.277zm8.54 4.931a2.138 2.138 0 1 0 0 4.277 2.138 2.138 0 1 0 0-4.277zm0 9.862a2.138 2.138 0 1 0 0 4.277 2.138 2.138 0 1 0 0-4.277zm-8.54 4.931a2.138 2.138 0 1 0 0 4.276 2.138 2.138 0 1 0 0-4.276zm-8.542-4.93a2.138 2.138 0 1 0 0 4.276 2.138 2.138 0 1 0 0-4.277zm0-9.863a2.138 2.138 0 1 0 0 4.277 2.138 2.138 0 1 0 0-4.277zm8.542-3.378L2.953 6.777v10.448l9.049 5.224 9.047-5.224V6.777zm0 1.601 7.66 13.27H4.34zm-1.387.371L3.97 15.037V7.363zm2.774 0 6.646 3.838v7.674zM5.355 17.44h13.293l-6.646 3.836z',
};

const bashIcon: FileTypeIconDef = {
  title: 'Bash',
  path: 'M21.038,4.9l-7.577-4.498C13.009,0.134,12.505,0,12,0c-0.505,0-1.009,0.134-1.462,0.403L2.961,4.9 C2.057,5.437,1.5,6.429,1.5,7.503v8.995c0,1.073,0.557,2.066,1.462,2.603l7.577,4.497C10.991,23.866,11.495,24,12,24 c0.505,0,1.009-0.134,1.461-0.402l7.577-4.497c0.904-0.537,1.462-1.529,1.462-2.603V7.503C22.5,6.429,21.943,5.437,21.038,4.9z M15.17,18.946l0.013,0.646c0.001,0.078-0.05,0.167-0.111,0.198l-0.383,0.22c-0.061,0.031-0.111-0.007-0.112-0.085L14.57,19.29 c-0.328,0.136-0.66,0.169-0.872,0.084c-0.04-0.016-0.057-0.075-0.041-0.142l0.139-0.584c0.011-0.046,0.036-0.092,0.069-0.121 c0.012-0.011,0.024-0.02,0.036-0.026c0.022-0.011,0.043-0.014,0.062-0.006c0.229,0.077,0.521,0.041,0.802-0.101 c0.357-0.181,0.596-0.545,0.592-0.907c-0.003-0.328-0.181-0.465-0.613-0.468c-0.55,0.001-1.064-0.107-1.072-0.917 c-0.007-0.667,0.34-1.361,0.889-1.8l-0.007-0.652c-0.001-0.08,0.048-0.168,0.111-0.2l0.37-0.236 c0.061-0.031,0.111,0.007,0.112,0.087l0.006,0.653c0.273-0.109,0.511-0.138,0.726-0.088c0.047,0.012,0.067,0.076,0.048,0.151 l-0.144,0.578c-0.011,0.044-0.036,0.088-0.065,0.116c-0.012,0.012-0.025,0.021-0.038,0.028c-0.019,0.01-0.038,0.013-0.057,0.009 c-0.098-0.022-0.332-0.073-0.699,0.113c-0.385,0.195-0.52,0.53-0.517,0.778c0.003,0.297,0.155,0.387,0.681,0.396 c0.7,0.012,1.003,0.318,1.01,1.023C16.105,17.747,15.736,18.491,15.17,18.946z M19.143,17.859c0,0.06-0.008,0.116-0.058,0.145 l-1.916,1.164c-0.05,0.029-0.09,0.004-0.09-0.056v-0.494c0-0.06,0.037-0.093,0.087-0.122l1.887-1.129 c0.05-0.029,0.09-0.004,0.09,0.056V17.859z M20.459,6.797l-7.168,4.427c-0.894,0.523-1.553,1.109-1.553,2.187v8.833 c0,0.645,0.26,1.063,0.66,1.184c-0.131,0.023-0.264,0.039-0.398,0.039c-0.42,0-0.833-0.114-1.197-0.33L3.226,18.64 c-0.741-0.44-1.201-1.261-1.201-2.142V7.503c0-0.881,0.46-1.702,1.201-2.142l7.577-4.498c0.363-0.216,0.777-0.33,1.197-0.33 c0.419,0,0.833,0.114,1.197,0.33l7.577,4.498c0.624,0.371,1.046,1.013,1.164,1.732C21.686,6.557,21.12,6.411,20.459,6.797z',
};

const dockerIcon: FileTypeIconDef = {
  title: 'Docker',
  path: 'M13.983 11.078h2.119a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.119a.185.185 0 00-.185.185v1.888c0 .102.083.185.185.185m-2.954-5.43h2.118a.186.186 0 00.186-.186V3.574a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m0 2.716h2.118a.187.187 0 00.186-.186V6.29a.186.186 0 00-.186-.185h-2.118a.185.185 0 00-.185.185v1.887c0 .102.082.185.185.186m-2.93 0h2.12a.186.186 0 00.184-.186V6.29a.185.185 0 00-.185-.185H8.1a.185.185 0 00-.185.185v1.887c0 .102.083.185.185.186m-2.964 0h2.119a.186.186 0 00.185-.186V6.29a.185.185 0 00-.185-.185H5.136a.186.186 0 00-.186.185v1.887c0 .102.084.185.186.186m5.893 2.715h2.118a.186.186 0 00.186-.185V9.006a.186.186 0 00-.186-.186h-2.118a.185.185 0 00-.185.185v1.888c0 .102.082.185.185.185m-2.93 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.083.185.185.185m-2.964 0h2.119a.185.185 0 00.185-.185V9.006a.185.185 0 00-.184-.186h-2.12a.186.186 0 00-.186.186v1.887c0 .102.084.185.186.185m-2.92 0h2.12a.185.185 0 00.184-.185V9.006a.185.185 0 00-.184-.186h-2.12a.185.185 0 00-.184.185v1.888c0 .102.082.185.185.185M23.763 9.89c-.065-.051-.672-.51-1.954-.51-.338.001-.676.03-1.01.087-.248-1.7-1.653-2.53-1.716-2.566l-.344-.199-.226.327c-.284.438-.49.922-.612 1.43-.23.97-.09 1.882.403 2.661-.595.332-1.55.413-1.744.42H.751a.751.751 0 00-.75.748 11.376 11.376 0 00.692 4.062c.545 1.428 1.355 2.48 2.41 3.124 1.18.723 3.1 1.137 5.275 1.137.983.003 1.963-.086 2.93-.266a12.248 12.248 0 003.823-1.389c.98-.567 1.86-1.288 2.61-2.136 1.252-1.418 1.998-2.997 2.553-4.4h.221c1.372 0 2.215-.549 2.68-1.009.309-.293.55-.65.707-1.046l.098-.288Z',
};

const FILE_TYPE_ICONS: Record<string, FileTypeIconDef> = {
  ts: typescriptIcon,
  mts: typescriptIcon,
  cts: typescriptIcon,
  tsx: reactIcon,
  jsx: reactIcon,
  js: javascriptIcon,
  mjs: javascriptIcon,
  cjs: javascriptIcon,
  json: jsonIcon,
  jsonc: jsonIcon,
  html: htmlIcon,
  css: cssIcon,
  md: markdownIcon,
  mdx: mdxIcon,
  yml: yamlIcon,
  yaml: yamlIcon,
  graphql: graphqlIcon,
  gql: graphqlIcon,
  sh: bashIcon,
  bash: bashIcon,
  zsh: bashIcon,
  dockerfile: dockerIcon,
};

/**
 * Resolve the brand icon for a filename by its extension. Matching uses the
 * basename, so directory names never interfere. `Dockerfile` matches by full
 * basename since it has no extension. Returns undefined for unknown extensions
 * and dotfiles; the header then falls back to the generic file icon.
 */
function matchFileTypeIcon(filename: string): FileTypeIconDef | undefined {
  const basename = filename.split('/').pop()?.toLowerCase() ?? '';
  if (basename === 'dockerfile') return FILE_TYPE_ICONS.dockerfile;
  const dotIndex = basename.lastIndexOf('.');
  if (dotIndex <= 0) return undefined;
  return FILE_TYPE_ICONS[basename.slice(dotIndex + 1)];
}

function FileTypeIcon({ icon }: { icon: FileTypeIconDef }) {
  return (
    <svg viewBox="0 0 24 24" className="size-3.5 shrink-0 fill-current" aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}

// =============================================================================
// Style Constants
// =============================================================================

const darkModeClassNames = cn(
  'dark:[&_.shiki]:!text-[var(--shiki-dark)]',
  'dark:[&_.shiki]:![font-style:var(--shiki-dark-font-style)]',
  'dark:[&_.shiki]:![font-weight:var(--shiki-dark-font-weight)]',
  'dark:[&_.shiki]:![text-decoration:var(--shiki-dark-text-decoration)]',
  'dark:[&_.shiki_span]:!text-[var(--shiki-dark)]',
  'dark:[&_.shiki_span]:![font-style:var(--shiki-dark-font-style)]',
  'dark:[&_.shiki_span]:![font-weight:var(--shiki-dark-font-weight)]',
  'dark:[&_.shiki_span]:![text-decoration:var(--shiki-dark-text-decoration)]',
);

const lineHighlightClassNames = cn(
  '[&_.line.highlighted]:bg-code-highlight',
  '[&_.line.highlighted]:after:bg-code-highlight-accent',
  '[&_.line.highlighted]:after:absolute',
  '[&_.line.highlighted]:after:left-0',
  '[&_.line.highlighted]:after:top-0',
  '[&_.line.highlighted]:after:bottom-0',
  '[&_.line.highlighted]:after:w-0.5',
);

const lineDiffClassNames = cn(
  '[&_.line.diff]:after:absolute',
  '[&_.line.diff]:after:left-0',
  '[&_.line.diff]:after:top-0',
  '[&_.line.diff]:after:bottom-0',
  '[&_.line.diff]:after:w-0.5',
  '[&_.line.diff.add]:bg-code-diff-add',
  '[&_.line.diff.add]:after:bg-code-diff-add-accent',
  '[&_.line.diff.remove]:bg-code-diff-remove',
  '[&_.line.diff.remove]:after:bg-code-diff-remove-accent',
);

const lineFocusedClassNames = cn(
  '[&_code:has(.focused)_.line]:blur-[2px]',
  '[&_code:has(.focused)_.line.focused]:blur-none',
);

const wordHighlightClassNames = cn('[&_.highlighted-word]:bg-code-highlight');

// =============================================================================
// Sub-Components
// =============================================================================

/**
 * Tooltip icon-button used for code-block toolbar actions (and the built-in copy
 * button). Compose these into the `actions` slot of {@link CodeBlock}.
 */
function CodeBlockAction({ icon, label, onClick, disabled }: CodeBlockActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            onClick={onClick}
            aria-label={label}
            disabled={disabled}
            className={cn('h-7 w-7', disabled && 'cursor-not-allowed opacity-50')}
          />
        }
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent side="top">{label}</TooltipContent>
    </Tooltip>
  );
}

interface CodeBlockToolbarProps {
  onCopy: () => void;
  isCopied: boolean;
  actions?: ReactNode;
}

function CodeBlockToolbar({ onCopy, isCopied, actions }: CodeBlockToolbarProps) {
  return (
    <div className="flex items-center gap-0.5">
      {actions}
      <CodeBlockAction
        icon={
          isCopied ? <CheckIcon className="size-4 text-success" /> : <CopyIcon className="size-4" />
        }
        label={isCopied ? 'Copied!' : 'Copy code'}
        onClick={onCopy}
      />
    </div>
  );
}

interface PackageManagerTabsProps {
  activeManager: PackageManager;
  onSelect: (pm: PackageManager) => void;
  id: string;
}

function PackageManagerTabs({ activeManager, onSelect, id }: PackageManagerTabsProps) {
  return (
    // clip-path instead of overflow-hidden: overflow clips children at the
    // padding box, so the active-tab underline could never cover the bottom
    // border. Clipping at the border box lets it overlay the border row while
    // the corners stay rounded.
    <div className="bg-background border-border inline-flex rounded-md border text-xs [clip-path:inset(0_round_var(--radius-md))]">
      {PACKAGE_MANAGERS.map((pm, index) => (
        <div key={pm} className="flex items-center">
          {index > 0 && <div className="bg-border h-4 w-px" aria-hidden="true" />}
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'relative h-auto rounded-none px-3 py-1.5 text-xs font-medium transition-colors',
              activeManager === pm
                ? 'bg-muted text-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
            )}
            onClick={() => onSelect(pm)}
          >
            {pm}
            {activeManager === pm && (
              <motion.div
                className="bg-brand absolute inset-x-0 -bottom-px mx-auto h-0.5 w-full"
                layoutId={`codeblock-pm-tab-${id}`}
                initial={false}
                transition={{
                  type: 'spring',
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}

interface CodeBlockHeaderProps {
  filename?: string;
  language?: string;
  isCommand?: boolean;
  showPackageManagerTabs?: boolean;
  activeManager?: PackageManager;
  onSelectManager?: (pm: PackageManager) => void;
  toolbar: ReactNode;
  id: string;
}

function CodeBlockHeader({
  filename,
  language,
  isCommand,
  showPackageManagerTabs,
  activeManager,
  onSelectManager,
  toolbar,
  id,
}: CodeBlockHeaderProps) {
  // Determine what label to show
  const getLabel = () => {
    if (filename) {
      const fileTypeIcon = matchFileTypeIcon(filename);
      return (
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
          {fileTypeIcon ? <FileTypeIcon icon={fileTypeIcon} /> : <FileIcon className="size-3.5" />}
          <span>{filename}</span>
        </div>
      );
    }

    if (showPackageManagerTabs && activeManager && onSelectManager) {
      return (
        <PackageManagerTabs activeManager={activeManager} onSelect={onSelectManager} id={id} />
      );
    }

    if (isCommand) {
      return (
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <TerminalIcon className="size-3.5" />
          <span>Terminal</span>
        </div>
      );
    }

    // Default: show language or "Code"
    return (
      <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
        <CodeIcon className="size-3.5" />
        <span>{language ? language.charAt(0).toUpperCase() + language.slice(1) : 'Code'}</span>
      </div>
    );
  };

  return (
    <div className="bg-muted/50 border-border flex items-center justify-between border-b px-3 py-2">
      <div className="flex items-center gap-2">{getLabel()}</div>
      {toolbar}
    </div>
  );
}

interface FadeOverlayProps {
  visible: boolean;
}

function FadeOverlay({ visible }: FadeOverlayProps) {
  return (
    <div
      className={cn(
        'from-card pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent transition-opacity duration-300',
        visible ? 'opacity-100' : 'opacity-0',
      )}
      aria-hidden="true"
    />
  );
}

interface ExpandButtonProps {
  isExpanded: boolean;
  hiddenLineCount: number;
  onToggle: () => void;
}

function ExpandButton({ isExpanded, hiddenLineCount, onToggle }: ExpandButtonProps) {
  return (
    <div className="border-border bg-muted/30 flex items-center justify-center border-t py-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="text-muted-foreground hover:text-foreground gap-1.5 text-xs"
      >
        {isExpanded ? (
          <>
            <ChevronUpIcon className="size-3.5" />
            Show less
          </>
        ) : (
          <>
            <ChevronDownIcon className="size-3.5" />
            Show {hiddenLineCount} more lines
          </>
        )}
      </Button>
    </div>
  );
}

const codeBlockContentClassName = cn(
  'bg-transparent text-sm',
  '[&_pre]:py-4',
  '[&_.shiki]:!bg-transparent',
  '[&_code]:w-full',
  '[&_code]:grid',
  '[&_code]:overflow-x-auto',
  '[&_code]:bg-transparent',
  '[&_.line]:px-4',
  '[&_.line]:w-full',
  '[&_.line]:relative',
);

// =============================================================================
// Syntax Highlighted Content Component
// =============================================================================

interface SyntaxHighlightedContentProps {
  code: string;
  language: SupportedLanguage;
}

function SyntaxHighlightedContent({ code, language }: SyntaxHighlightedContentProps) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    highlightCode(code, language)
      .then(setHtml)
      .catch((error) => {
        console.error('Shiki highlighting failed:', error);
        // Fallback to escaped plain text
        setHtml(`<pre class="shiki"><code>${escapeHtml(code)}</code></pre>`);
      });
  }, [code, language]);

  if (!html) {
    // Show fallback while loading
    return (
      <pre className="shiki py-4">
        <code className="grid w-full overflow-x-auto bg-transparent">
          {code.split('\n').map((line, i) => (
            <span key={i} className="line relative w-full px-4">
              {line}
            </span>
          ))}
        </code>
      </pre>
    );
  }

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// =============================================================================
// Main Component
// =============================================================================

/**
 * Shiki-highlighted code block with a header, copy button, collapse/expand for
 * long snippets, and an optional npm→pnpm/yarn/bun package-manager switcher.
 * Highlighting is lazy (a shared highlighter singleton + per-snippet cache), and
 * line/diff/focus/word decorations use Shiki's `[!code ...]` notations. The DS
 * never toasts. Wire `onCopied`/`onCopyError` to your own feedback.
 */
export function CodeBlock({
  className,
  language,
  filename,
  children,
  hideHeader = false,
  packageManagerSwitcher = false,
  actions,
  onCopied,
  onCopyError,
  ...props
}: CodeBlockProps) {
  const { copied, copy } = useCopy();
  const [activePackageManager, setActivePackageManager] = usePackageManager();
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceId = useId();

  // Process the raw code
  const rawCode = useMemo(() => {
    return typeof children === 'string'
      ? children
      : Array.isArray(children)
        ? children.join('')
        : String(children || '');
  }, [children]);

  // Process code directives (filename extraction, strip notations for unsupported languages)
  const { cleanCode, extractedFilename } = useMemo(
    () => processCode(rawCode, language),
    [rawCode, language],
  );

  // Use provided filename or extracted one
  const displayFilename = filename || extractedFilename;

  // Detect if this is a package manager command (only when the switcher is enabled)
  const isShellLanguage =
    language?.toLowerCase() === 'bash' ||
    language?.toLowerCase() === 'shell' ||
    language?.toLowerCase() === 'sh';
  const isCommand = packageManagerSwitcher && isShellLanguage && isPackageManagerCommand(cleanCode);

  // Get the display code (transformed for selected package manager if applicable)
  const displayCode = useMemo(() => {
    if (isCommand) {
      return transformCommand(cleanCode, activePackageManager);
    }
    return cleanCode;
  }, [cleanCode, isCommand, activePackageManager]);

  // Calculate if the code block is collapsible
  const lineCount = useMemo(() => displayCode.split('\n').length, [displayCode]);
  const isCollapsible = lineCount > COLLAPSE_THRESHOLD;
  const hiddenLineCount = lineCount - Math.floor(COLLAPSED_HEIGHT / 24); // Approximate visible lines based on line height

  const handleCopy = async () => {
    const ok = await copy(displayCode);
    if (ok) onCopied?.();
    else onCopyError?.(new Error('Failed to copy to the clipboard'));
  };

  const toolbar = <CodeBlockToolbar onCopy={handleCopy} isCopied={copied} actions={actions} />;

  const showCollapsed = isCollapsible && !isExpanded;

  return (
    <div
      data-slot="code-block"
      {...props}
      className={cn(
        'bg-card not-prose border-border relative mb-4 w-full contain-inline-size overflow-hidden rounded-md border text-sm lg:text-base',
        className,
      )}
      ref={containerRef}
    >
      {!hideHeader && (
        <CodeBlockHeader
          filename={displayFilename}
          language={language}
          isCommand={isCommand}
          showPackageManagerTabs={isCommand}
          activeManager={activePackageManager}
          onSelectManager={setActivePackageManager}
          toolbar={toolbar}
          id={instanceId}
        />
      )}

      <div className="relative">
        <motion.div
          className="overflow-hidden"
          initial={false}
          animate={{
            height: showCollapsed ? COLLAPSED_HEIGHT : 'auto',
          }}
          transition={{
            duration: 0.3,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <ScrollArea className="w-full whitespace-nowrap">
            <div
              className={cn(
                codeBlockContentClassName,
                lineHighlightClassNames,
                lineDiffClassNames,
                lineFocusedClassNames,
                wordHighlightClassNames,
                darkModeClassNames,
              )}
            >
              <SyntaxHighlightedContent
                code={displayCode}
                language={normalizeLanguage(isCommand ? 'bash' : language)}
              />
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </motion.div>
        <FadeOverlay visible={showCollapsed} />
      </div>

      {isCollapsible && (
        <ExpandButton
          isExpanded={isExpanded}
          hiddenLineCount={hiddenLineCount}
          onToggle={() => setIsExpanded(!isExpanded)}
        />
      )}
    </div>
  );
}

export { CodeBlockAction, transformCommand, processCode, matchFileTypeIcon };
export type { CodeBlockProps, CodeBlockActionProps, PackageManager };
