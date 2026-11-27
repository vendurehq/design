'use client';

import { Button } from '@vendure-io/ui/components/atoms/button';
import { useFormatSettings } from '@vendure-io/ui/components/molecules/format-provider';
import { cn } from '@vendure-io/ui/lib/utils';
import { FileIcon, UploadCloudIcon, XIcon } from 'lucide-react';
import * as React from 'react';
import { defaultMessages, useMessages } from '../../lib/format-messages.ts';

type FileValidationResult = string | readonly string[] | null | undefined;
type FileValidator = (file: File) => FileValidationResult | Promise<FileValidationResult>;

interface FileRejection {
  file: File;
  messages: string[];
}

/**
 * The texts of a FileDropzone. Each one is optional and wins over
 * `FormatProvider`'s `messages.fileDropzone`, which wins over English.
 * Texts with a value in them are functions here (and `{name}`, `{size}`,
 * `{max}` placeholders in `messages`).
 */
interface FileDropzoneLabels {
  /** @default `messages.fileDropzone.typeNotAccepted`, "This file type is not accepted." */
  typeNotAccepted?: string;
  /** Receives the largest allowed size, already formatted. @default `messages.fileDropzone.fileTooLarge`, "File size must be {size} or smaller." */
  fileTooLarge?: (size: string) => string;
  /** Receives the file limit. @default `messages.fileDropzone.tooManyFiles` ("You can select up to {max} files.") and `tooManyFilesOne` for a limit of one */
  tooManyFiles?: (max: number) => string;
  /** Shown when `validateFile` throws. @default `messages.fileDropzone.validationFailed`, "This file could not be validated." */
  validationFailed?: string;
  /** Replaces the drop prompt while `validateFile` runs. @default `messages.fileDropzone.checking`, "Checking files…" */
  checking?: string;
  /** Placed before the `accept` list. @default `messages.fileDropzone.accepted`, "Accepted:" */
  accepted?: string;
  /** Accessible name of a file's remove button. Receives the file name. @default `messages.fileDropzone.remove`, "Remove {name}" */
  remove?: (name: string) => string;
  /** @default `messages.fileDropzone.byte`, "B" */
  byte?: string;
  /** @default `messages.fileDropzone.kilobyte`, "KB" */
  kilobyte?: string;
  /** @default `messages.fileDropzone.megabyte`, "MB" */
  megabyte?: string;
}

interface FileDropzoneProps extends Omit<React.ComponentProps<'div'>, 'defaultValue' | 'onChange'> {
  /** Selected files. Pass `value` to control the dropzone. Leave the prop out and it keeps its own state. */
  value?: readonly File[];
  /** Initial files when `value` is not passed. */
  defaultValue?: readonly File[];
  onValueChange?: (files: File[]) => void;
  onRejected?: (rejections: FileRejection[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSize?: number;
  validateFile?: FileValidator;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  label?: React.ReactNode;
  description?: React.ReactNode;
  emptyLabel?: React.ReactNode;
  dragLabel?: React.ReactNode;
  renderFile?: (file: File, remove: () => void) => React.ReactNode;
  /** The component's own texts: rejection messages, status text, remove button and size units. */
  labels?: FileDropzoneLabels;
}

function fileMatchesAccept(file: File, accept: string | undefined): boolean {
  if (!accept?.trim()) return true;
  const fileName = file.name.toLowerCase();
  const mime = file.type.toLowerCase();
  return accept.split(',').some((rawRule) => {
    const rule = rawRule.trim().toLowerCase();
    if (!rule) return false;
    if (rule.startsWith('.')) return fileName.endsWith(rule);
    if (rule.endsWith('/*')) return mime.startsWith(rule.slice(0, -1));
    return mime === rule;
  });
}

interface FormatFileSizeOptions {
  /** BCP 47 locale of the number. Default: the runtime locale. */
  locale?: string;
  /** Unit texts. Default: `B`, `KB` and `MB`. */
  units?: { byte?: string; kilobyte?: string; megabyte?: string };
}

/**
 * Whole bytes below 1 KB, whole KB below 1 MB, MB with one decimal above. The
 * number follows `locale`; the unit texts are English unless `units` is passed.
 */
function formatFileSize(bytes: number, { locale, units }: FormatFileSizeOptions = {}): string {
  const defaults = defaultMessages.fileDropzone;
  const format = (value: number, fractionDigits: number) =>
    new Intl.NumberFormat(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
      useGrouping: false,
    }).format(value);
  if (bytes < 1024) return `${format(bytes, 0)} ${units?.byte ?? defaults.byte}`;
  if (bytes < 1024 ** 2)
    return `${format(bytes / 1024, 0)} ${units?.kilobyte ?? defaults.kilobyte}`;
  return `${format(bytes / 1024 ** 2, 1)} ${units?.megabyte ?? defaults.megabyte}`;
}

/** Replaces each `{key}` in a message with its value. */
function fillMessage(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

function normalizeValidationResult(result: FileValidationResult): string[] {
  if (!result) return [];
  return typeof result === 'string' ? [result] : [...result];
}

const NO_FILES: readonly File[] = [];

/**
 * Transport-agnostic file input, controlled with `value` or uncontrolled with
 * `defaultValue`. It owns accessible picking,
 * drag-and-drop, limits, validation, errors, and removal; consumers own upload
 * persistence and can replace the selected-file rendering with `renderFile`.
 */
function FileDropzone(allProps: FileDropzoneProps) {
  const {
    value: valueProp,
    defaultValue,
    onValueChange,
    onRejected,
    accept,
    multiple = false,
    maxFiles = multiple ? Number.POSITIVE_INFINITY : 1,
    maxSize,
    validateFile,
    disabled,
    required,
    name,
    id: providedId,
    label = 'Upload files',
    description,
    emptyLabel = 'Drag and drop files here, or choose files',
    dragLabel = 'Drop files to add them',
    renderFile,
    labels,
    className,
    ...props
  } = allProps;
  // Controlled when the `value` prop is passed, even as `undefined` (no value).
  const controlled = 'value' in allProps;
  const [own, setOwn] = React.useState(defaultValue ?? NO_FILES);
  const value = controlled ? (valueProp ?? NO_FILES) : own;
  function commit(files: File[]) {
    if (!controlled) setOwn(files);
    onValueChange?.(files);
  }
  const { locale } = useFormatSettings();
  const t = useMessages('fileDropzone', {
    typeNotAccepted: labels?.typeNotAccepted,
    validationFailed: labels?.validationFailed,
    checking: labels?.checking,
    accepted: labels?.accepted,
    byte: labels?.byte,
    kilobyte: labels?.kilobyte,
    megabyte: labels?.megabyte,
  });
  const sizeOptions = {
    locale,
    units: { byte: t.byte, kilobyte: t.kilobyte, megabyte: t.megabyte },
  };
  const generatedId = React.useId();
  const id = providedId ?? generatedId;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
  const [dragging, setDragging] = React.useState(false);
  const [validating, setValidating] = React.useState(false);
  const [rejections, setRejections] = React.useState<FileRejection[]>([]);
  const dragDepth = React.useRef(0);
  // Synchronous mirror of `validating`: a drop while an async validateFile is
  // in flight would otherwise start a second addFiles against a stale `value`.
  const busy = React.useRef(false);

  async function addFiles(incoming: readonly File[]) {
    if (disabled || busy.current || incoming.length === 0) return;
    busy.current = true;
    setValidating(true);
    const accepted: File[] = [];
    const rejected: FileRejection[] = [];
    const remaining = Math.max(0, maxFiles - (multiple ? value.length : 0));

    for (const file of incoming.slice(0, remaining)) {
      const messages: string[] = [];
      if (!fileMatchesAccept(file, accept)) messages.push(t.typeNotAccepted);
      if (maxSize !== undefined && file.size > maxSize) {
        const size = formatFileSize(maxSize, sizeOptions);
        messages.push(labels?.fileTooLarge?.(size) ?? fillMessage(t.fileTooLarge, { size }));
      }
      if (validateFile) {
        try {
          messages.push(...normalizeValidationResult(await validateFile(file)));
        } catch {
          messages.push(t.validationFailed);
        }
      }
      if (messages.length > 0) rejected.push({ file, messages });
      else accepted.push(file);
    }

    if (incoming.length > remaining) {
      for (const file of incoming.slice(remaining)) {
        rejected.push({
          file,
          messages: [
            labels?.tooManyFiles?.(maxFiles) ??
              fillMessage(maxFiles === 1 ? t.tooManyFilesOne : t.tooManyFiles, { max: maxFiles }),
          ],
        });
      }
    }

    setRejections(rejected);
    busy.current = false;
    setValidating(false);
    if (rejected.length > 0) onRejected?.(rejected);
    if (accepted.length > 0) {
      commit(multiple ? [...value, ...accepted] : accepted.slice(0, 1));
    }
  }

  function removeFile(index: number) {
    commit(value.filter((_, fileIndex) => fileIndex !== index));
    setRejections([]);
  }

  return (
    <div data-slot="file-dropzone" className={cn('flex flex-col gap-3', className)} {...props}>
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {required ? <span className="text-destructive-text"> *</span> : null}
        </label>
        {description ? (
          <p id={descriptionId} className="text-muted-foreground mt-1 text-sm">
            {description}
          </p>
        ) : null}
      </div>

      <input
        id={id}
        name={name}
        type="file"
        accept={accept}
        multiple={multiple}
        required={required && value.length === 0}
        disabled={disabled || validating}
        aria-describedby={
          cn(description && descriptionId, rejections.length > 0 && errorId) || undefined
        }
        className="peer sr-only"
        onChange={(event) => {
          const files = Array.from(event.currentTarget.files ?? []);
          event.currentTarget.value = '';
          void addFiles(files);
        }}
      />

      <label
        htmlFor={id}
        data-slot="file-dropzone-target"
        data-dragging={dragging || undefined}
        data-disabled={disabled || validating || undefined}
        onDragEnter={(event) => {
          event.preventDefault();
          if (disabled) return;
          dragDepth.current += 1;
          setDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          void addFiles(Array.from(event.dataTransfer.files));
        }}
        className={cn(
          'border-border text-muted-foreground hover:border-foreground/40 flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-[border-color,background-color,color] duration-fast ease-out',
          'peer-focus-visible:outline-solid peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring',
          'data-dragging:border-foreground data-dragging:bg-accent data-dragging:text-accent-foreground',
          'data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50',
        )}
      >
        <UploadCloudIcon className="size-7" />
        <span className="text-foreground text-sm font-medium">
          {validating ? t.checking : dragging ? dragLabel : emptyLabel}
        </span>
        {accept ? <span className="text-xs">{`${t.accepted} ${accept}`}</span> : null}
      </label>

      {value.length > 0 ? (
        <ul data-slot="file-dropzone-files" className="flex flex-col gap-2">
          {value.map((file, index) => (
            // Metadata alone can collide (two distinct files with identical
            // name, size and mtime), so the index disambiguates the key.
            <li key={`${file.name}-${file.size}-${file.lastModified}-${index}`}>
              {renderFile ? (
                renderFile(file, () => removeFile(index))
              ) : (
                <div className="bg-muted/60 flex min-w-0 items-center gap-3 rounded-lg border px-3 py-2">
                  <FileIcon className="text-muted-foreground size-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatFileSize(file.size, sizeOptions)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={disabled}
                    aria-label={
                      labels?.remove?.(file.name) ?? fillMessage(t.remove, { name: file.name })
                    }
                    onClick={() => removeFile(index)}
                  >
                    <XIcon />
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {rejections.length > 0 ? (
        <div id={errorId} role="alert" className="text-destructive-text text-sm">
          {rejections.map(({ file, messages }, index) => (
            <p key={`${file.name}-${file.size}-${index}`}>
              <span className="font-medium">{file.name}:</span> {messages.join(' ')}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export {
  FileDropzone,
  fileMatchesAccept,
  formatFileSize,
  type FileDropzoneLabels,
  type FileDropzoneProps,
  type FileRejection,
  type FormatFileSizeOptions,
  type FileValidator,
};
