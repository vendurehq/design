'use client';

import { Button } from '@vendure-io/ui/components/atoms/button';
import { cn } from '@vendure-io/ui/lib/utils';
import { FileIcon, UploadCloudIcon, XIcon } from 'lucide-react';
import * as React from 'react';

type FileValidationResult = string | readonly string[] | null | undefined;
type FileValidator = (file: File) => FileValidationResult | Promise<FileValidationResult>;

interface FileRejection {
  file: File;
  messages: string[];
}

interface FileDropzoneProps extends Omit<React.ComponentProps<'div'>, 'onChange'> {
  value?: readonly File[];
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

function normalizeValidationResult(result: FileValidationResult): string[] {
  if (!result) return [];
  return typeof result === 'string' ? [result] : [...result];
}

/**
 * Controlled, transport-agnostic file input. It owns accessible picking,
 * drag-and-drop, limits, validation, errors, and removal; consumers own upload
 * persistence and can replace the selected-file rendering with `renderFile`.
 */
function FileDropzone({
  value = [],
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
  className,
  ...props
}: FileDropzoneProps) {
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
      if (!fileMatchesAccept(file, accept)) messages.push('This file type is not accepted.');
      if (maxSize !== undefined && file.size > maxSize) {
        messages.push(`File size must be ${formatFileSize(maxSize)} or smaller.`);
      }
      if (validateFile) {
        try {
          messages.push(...normalizeValidationResult(await validateFile(file)));
        } catch {
          messages.push('This file could not be validated.');
        }
      }
      if (messages.length > 0) rejected.push({ file, messages });
      else accepted.push(file);
    }

    if (incoming.length > remaining) {
      for (const file of incoming.slice(remaining)) {
        rejected.push({
          file,
          messages: [`You can select up to ${maxFiles} ${maxFiles === 1 ? 'file' : 'files'}.`],
        });
      }
    }

    setRejections(rejected);
    busy.current = false;
    setValidating(false);
    if (rejected.length > 0) onRejected?.(rejected);
    if (accepted.length > 0) {
      onValueChange?.(multiple ? [...value, ...accepted] : accepted.slice(0, 1));
    }
  }

  function removeFile(index: number) {
    onValueChange?.(value.filter((_, fileIndex) => fileIndex !== index));
    setRejections([]);
  }

  return (
    <div data-slot="file-dropzone" className={cn('flex flex-col gap-3', className)} {...props}>
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
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
          'border-border text-muted-foreground hover:border-foreground/40 flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-[border-color,background-color,color] duration-(--transition-duration-fast) ease-(--ease-out)',
          'peer-focus-visible:border-ring peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50',
          'data-dragging:border-foreground data-dragging:bg-accent data-dragging:text-accent-foreground',
          'data-disabled:pointer-events-none data-disabled:cursor-not-allowed data-disabled:opacity-50',
        )}
      >
        <UploadCloudIcon className="size-7" />
        <span className="text-foreground text-sm font-medium">
          {validating ? 'Checking files…' : dragging ? dragLabel : emptyLabel}
        </span>
        {accept ? <span className="text-xs">Accepted: {accept}</span> : null}
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
                    <p className="text-muted-foreground text-xs">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    disabled={disabled}
                    aria-label={`Remove ${file.name}`}
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
        <div id={errorId} role="alert" className="text-destructive text-sm">
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
  type FileDropzoneProps,
  type FileRejection,
  type FileValidator,
};
