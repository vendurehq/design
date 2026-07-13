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
   * Takes precedence over the package-manager tabs — a block with a filename never
   * shows the switcher, even when `packageManagerSwitcher` is set.
   */
  filename?: string;
  /** Hide the header bar completely */
  hideHeader?: boolean;
  /** Enable npm→pnpm/yarn/bun tab switching for shell blocks containing npm/npx commands. @default false */
  packageManagerSwitcher?: boolean;
  /** Extra toolbar actions rendered before the built-in copy button. Compose with CodeBlockAction. */
  actions?: ReactNode;
  /** Called after a successful copy. Wire your toast here — the DS never toasts. */
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
    <div className="bg-background border-border inline-flex overflow-hidden rounded-md border text-xs">
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
                className="bg-brand absolute inset-x-0 bottom-0 mx-auto h-0.5 w-full"
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
      return (
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <FileIcon className="size-3.5" />
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
 * never toasts — wire `onCopied`/`onCopyError` to your own feedback.
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

export { CodeBlockAction, transformCommand, processCode };
export type { CodeBlockProps, CodeBlockActionProps, PackageManager };
