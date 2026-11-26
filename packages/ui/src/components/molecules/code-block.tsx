'use client';

import { Button } from '@vendure-io/ui/components/atoms/button';
import { DirectionProvider } from '@vendure-io/ui/components/atoms/direction';
import { ScrollArea, ScrollBar } from '@vendure-io/ui/components/atoms/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger } from '@vendure-io/ui/components/atoms/tooltip';
import { useCopyFeedback } from '@vendure-io/ui/components/molecules/copy-feedback-provider';
import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
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
import { motion, useReducedMotion } from 'motion/react';
import { type ComponentProps, type ReactNode, useEffect, useId, useMemo, useState } from 'react';
import { highlightCode, normalizeLanguage, type SupportedLanguage } from '../../lib/highlight.ts';
// Relative imports: `code-block/*` is closed in the package exports, so a
// `@vendure-io/ui/...` self-reference to these modules fails in consumers.
import { useMessages } from '../../lib/format-messages.ts';
import { FileTypeIcon, matchFileTypeIcon } from './code-block/file-type-icons.tsx';
import { processCode } from './code-block/process-code.ts';
import {
  isPackageManagerCommand,
  PACKAGE_MANAGERS,
  type PackageManager,
  transformCommand,
} from './code-block/transform-command.tsx';

/**
 * The texts of a CodeBlock. Each one falls back to `FormatProvider`'s
 * `messages.codeBlock`, then to English.
 */
interface CodeBlockLabels {
  /** Label of the copy button. @default `messages.codeBlock.copyCode`, "Copy code" */
  copyCode?: string;
  /** Label of the copy button after a copy. @default `messages.codeBlock.copied`, "Copied!" */
  copied?: string;
  /** Header of a shell block with no filename and no package-manager tabs. @default `messages.codeBlock.terminal`, "Terminal" */
  terminal?: string;
  /** Header of a block with no filename and no language. @default `messages.codeBlock.code`, "Code" */
  code?: string;
  /** Label of the button that collapses a long block. @default `messages.codeBlock.showLess`, "Show less" */
  showLess?: string;
  /**
   * Label of the button that expands a long block. `{count}` is replaced by the
   * number of hidden lines, formatted with `FormatProvider`'s `locale`.
   * @default `messages.codeBlock.showMore`, "Show {count} more lines"
   */
  showMore?: string;
}

type CodeBlockTexts = Required<CodeBlockLabels>;

type CodeBlockProps = Omit<ComponentProps<'div'>, 'children'> & {
  /**
   * The code to render, as a plain string. Anything else (elements, numbers)
   * would stringify uselessly, so the type rejects it.
   */
  children?: string;
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
  /**
   * Called after a successful copy. Wire your toast here. The DS never toasts.
   * Function props can't cross an RSC boundary — when rendering from a server
   * component, omit this and mount `CopyFeedbackProvider` instead; it is the
   * fallback when no prop is passed.
   */
  onCopied?: () => void;
  /** Called when the clipboard write fails. Falls back to `CopyFeedbackProvider`. */
  onCopyError?: (error: Error) => void;
  /** Translate the texts of the header, the copy button and the expander. Each text also reads `FormatProvider`'s `messages.codeBlock`. */
  labels?: CodeBlockLabels;
};

interface CodeBlockActionProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

const STORAGE_KEY = 'vendure-ui-package-manager';
const STORAGE_EVENT = 'vendure-ui-package-manager-change';

const COLLAPSE_THRESHOLD = 40; // Lines needed to trigger collapse
const COLLAPSED_HEIGHT = 300; // px height when collapsed (roughly 15-20 lines)

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
            size="icon-sm"
            onClick={onClick}
            aria-label={label}
            disabled={disabled}
            className={cn(disabled && 'cursor-not-allowed opacity-50')}
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
  texts: CodeBlockTexts;
}

function CodeBlockToolbar({ onCopy, isCopied, actions, texts }: CodeBlockToolbarProps) {
  return (
    <div className="flex items-center gap-0.5">
      {actions}
      <CodeBlockAction
        icon={
          isCopied ? <CheckIcon className="size-4 text-success" /> : <CopyIcon className="size-4" />
        }
        label={isCopied ? texts.copied : texts.copyCode}
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
  // Under reduced motion the underline jumps to the new tab instead of sliding.
  const reduceMotion = useReducedMotion();
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
                transition={
                  reduceMotion
                    ? { duration: 0 }
                    : {
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }
                }
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
  texts: CodeBlockTexts;
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
  texts,
}: CodeBlockHeaderProps) {
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
          <span>{texts.terminal}</span>
        </div>
      );
    }

    return (
      <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
        <CodeIcon className="size-3.5" />
        <span>{language ? language.charAt(0).toUpperCase() + language.slice(1) : texts.code}</span>
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
        'from-card pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t to-transparent transition-opacity duration-slow',
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
  texts: CodeBlockTexts;
}

function ExpandButton({ isExpanded, hiddenLineCount, onToggle, texts }: ExpandButtonProps) {
  const { locale } = useFormatSettings();
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
            {texts.showLess}
          </>
        ) : (
          <>
            <ChevronDownIcon className="size-3.5" />
            {texts.showMore.replace(
              '{count}',
              new Intl.NumberFormat(locale).format(hiddenLineCount),
            )}
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
  // Shiki's <pre> takes keyboard focus. The card clips anything outside it,
  // so the ring sits 2px inside the code area.
  '[&_pre:focus-visible]:outline-solid [&_pre:focus-visible]:outline-2 [&_pre:focus-visible]:-outline-offset-2 [&_pre:focus-visible]:outline-ring',
  // The code sizes to its longest line, so the ScrollArea viewport scrolls it.
  // A scrolling <code> inside the viewport could not take keyboard focus.
  '[&_code]:w-max',
  '[&_code]:min-w-full',
  '[&_code]:grid',
  '[&_code]:bg-transparent',
  '[&_.line]:px-4',
  '[&_.line]:w-full',
  '[&_.line]:relative',
);

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
        <code className="grid w-max min-w-full bg-transparent">
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

/**
 * Shiki-highlighted code block with a header, copy button, collapse/expand for
 * long snippets, and an optional npm→pnpm/yarn/bun package-manager switcher.
 * Highlighting is lazy (a shared highlighter singleton + per-snippet cache), and
 * line/diff/focus/word decorations use Shiki's `[!code ...]` notations. The DS
 * never toasts. Wire `onCopied`/`onCopyError` to your own feedback — or, when
 * rendering from server components (where function props can't be passed),
 * mount `CopyFeedbackProvider` once and leave the props off.
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
  labels,
  ...props
}: CodeBlockProps) {
  const texts = useMessages('codeBlock', labels);
  const { copied, copy } = useCopy();
  const copyFeedback = useCopyFeedback();
  const [activePackageManager, setActivePackageManager] = usePackageManager();
  const [isExpanded, setIsExpanded] = useState(false);
  const instanceId = useId();
  // Under reduced motion the code area opens and closes without a height
  // animation; the fade overlay still fades.
  const reduceMotion = useReducedMotion();

  const rawCode = children ?? '';

  const { cleanCode, extractedFilename } = useMemo(
    () => processCode(rawCode, language),
    [rawCode, language],
  );

  const displayFilename = filename || extractedFilename;

  const isShellLanguage =
    language?.toLowerCase() === 'bash' ||
    language?.toLowerCase() === 'shell' ||
    language?.toLowerCase() === 'sh';
  const isCommand = packageManagerSwitcher && isShellLanguage && isPackageManagerCommand(cleanCode);

  const displayCode = useMemo(() => {
    if (isCommand) {
      return transformCommand(cleanCode, activePackageManager);
    }
    return cleanCode;
  }, [cleanCode, isCommand, activePackageManager]);

  const lineCount = useMemo(() => displayCode.split('\n').length, [displayCode]);
  const isCollapsible = lineCount > COLLAPSE_THRESHOLD;
  const hiddenLineCount = lineCount - Math.floor(COLLAPSED_HEIGHT / 24); // Approximate visible lines based on line height

  const handleCopy = async () => {
    const ok = await copy(displayCode);
    if (ok) (onCopied ?? copyFeedback.onCopied)?.();
    else (onCopyError ?? copyFeedback.onCopyError)?.(new Error('Failed to copy to the clipboard'));
  };

  const toolbar = (
    <CodeBlockToolbar onCopy={handleCopy} isCopied={copied} actions={actions} texts={texts} />
  );

  const showCollapsed = isCollapsible && !isExpanded;

  return (
    <div
      data-slot="code-block"
      {...props}
      className={cn(
        'bg-card not-prose border-border relative w-full contain-inline-size overflow-hidden rounded-md border text-sm lg:text-base',
        className,
      )}
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
          texts={texts}
        />
      )}

      <div className="relative">
        <motion.div
          className="overflow-hidden"
          initial={false}
          animate={{
            height: showCollapsed ? COLLAPSED_HEIGHT : 'auto',
          }}
          transition={
            reduceMotion
              ? { duration: 0 }
              : {
                  duration: 0.3,
                  ease: [0.4, 0, 0.2, 1],
                }
          }
        >
          {/* Code reads left to right in every page direction. The header
              mirrors with the page; the code area and its scroll do not. The
              provider tells the ScrollArea, which reads it for its scroll
              position. */}
          <DirectionProvider direction="ltr">
            <ScrollArea dir="ltr" className="w-full whitespace-nowrap">
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
          </DirectionProvider>
        </motion.div>
        <FadeOverlay visible={showCollapsed} />
      </div>

      {isCollapsible && (
        <ExpandButton
          isExpanded={isExpanded}
          hiddenLineCount={hiddenLineCount}
          onToggle={() => setIsExpanded(!isExpanded)}
          texts={texts}
        />
      )}
    </div>
  );
}

export { CodeBlockAction };
export type { CodeBlockProps, CodeBlockActionProps, CodeBlockLabels, PackageManager };
