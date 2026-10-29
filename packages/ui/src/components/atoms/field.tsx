"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@vendure-io/ui/lib/utils"
import { Label } from "@vendure-io/ui/components/atoms/label"
import { Separator } from "@vendure-io/ui/components/atoms/separator"

function FieldSet({ className, ...props }: React.ComponentProps<"fieldset">) {
  return (
    <fieldset
      data-slot="field-set"
      className={cn(
        "flex flex-col gap-6 has-[>[data-slot=checkbox-group]]:gap-3 has-[>[data-slot=radio-group]]:gap-3",
        className
      )}
      {...props}
    />
  )
}

function FieldLegend({
  className,
  variant = "legend",
  ...props
}: React.ComponentProps<"legend"> & { variant?: "legend" | "label" }) {
  return (
    <legend
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "mb-3 font-medium data-[variant=label]:text-sm data-[variant=legend]:text-base",
        className
      )}
      {...props}
    />
  )
}

function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "group/field-group @container/field-group flex w-full flex-col gap-7 data-[slot=checkbox-group]:gap-3 *:data-[slot=field-group]:gap-4",
        className
      )}
      {...props}
    />
  )
}

const fieldVariants = cva(
  "data-[invalid=true]:text-destructive-subtle-foreground gap-3 group/field flex w-full",
  {
    variants: {
      orientation: {
        vertical: "flex-col *:w-full [&>.sr-only]:w-auto",
        horizontal:
          "flex-row items-center *:data-[slot=field-label]:flex-auto has-[>[data-slot=field-content]]:items-start has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
        responsive:
          "flex-col *:w-full [&>.sr-only]:w-auto @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:*:data-[slot=field-label]:flex-auto @md/field-group:has-[>[data-slot=field-content]]:items-start @md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  }
)

// Field links its control to the FieldDescription and FieldError it renders.
// Each message registers its id once mounted; controls read the context through
// useFieldControlProps and get aria-describedby (descriptions first, then
// errors) and aria-invalid while the Field is data-invalid. A control's own
// aria-describedby or aria-invalid wins.
type FieldMessageKind = "description" | "error"

type FieldContextValue = {
  describedBy: string | undefined
  invalid: boolean
  register: (id: string, kind: FieldMessageKind) => () => void
}

const FieldContext = createContext<FieldContextValue | null>(null)

/** Space-separated ids, descriptions before errors; undefined when empty. */
function fieldDescribedBy(
  messages: ReadonlyArray<{ id: string; kind: FieldMessageKind }>
) {
  const ids = [
    ...messages.filter((message) => message.kind === "description"),
    ...messages.filter((message) => message.kind === "error"),
  ].map((message) => message.id)
  return ids.length ? ids.join(" ") : undefined
}

function Field({
  className,
  orientation = "vertical",
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof fieldVariants> & {
    "data-invalid"?: boolean | "true" | "false"
  }) {
  const [messages, setMessages] = useState<
    Array<{ id: string; kind: FieldMessageKind }>
  >([])
  const register = useCallback((id: string, kind: FieldMessageKind) => {
    setMessages((current) => [...current, { id, kind }])
    return () =>
      setMessages((current) => current.filter((message) => message.id !== id))
  }, [])
  const invalid =
    props["data-invalid"] === true || props["data-invalid"] === "true"
  const describedBy = fieldDescribedBy(messages)
  const context = useMemo(
    () => ({ describedBy, invalid, register }),
    [describedBy, invalid, register]
  )

  return (
    <FieldContext.Provider value={context}>
      <div
        role="group"
        data-slot="field"
        data-orientation={orientation}
        className={cn(fieldVariants({ orientation }), className)}
        {...props}
      >
        {children}
      </div>
    </FieldContext.Provider>
  )
}

/** Gives a message a stable id and registers it with the enclosing Field. */
function useFieldMessageId(id: string | undefined, kind: FieldMessageKind) {
  const generatedId = useId()
  const messageId = id ?? generatedId
  const register = useContext(FieldContext)?.register
  useEffect(() => register?.(messageId, kind), [register, messageId, kind])
  return messageId
}

type FieldControlAria = {
  "aria-describedby"?: string
  "aria-invalid"?: React.AriaAttributes["aria-invalid"]
}

/** Merges a Field's state into control props. Explicit props win. */
function mergeFieldControlProps<P extends FieldControlAria>(
  props: P,
  field: Pick<FieldContextValue, "describedBy" | "invalid"> | null
): P {
  if (!field) return props
  return {
    ...props,
    "aria-describedby": props["aria-describedby"] ?? field.describedBy,
    "aria-invalid": props["aria-invalid"] ?? (field.invalid || undefined),
  }
}

/**
 * Adds the enclosing Field's aria-describedby and aria-invalid to a control's
 * props. Props the consumer passes explicitly win.
 */
function useFieldControlProps<P extends FieldControlAria>(props: P): P {
  return mergeFieldControlProps(props, useContext(FieldContext))
}

function FieldContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-content"
      className={cn(
        "group/field-content flex flex-1 flex-col gap-1 leading-snug",
        className
      )}
      {...props}
    />
  )
}

function FieldLabel({
  className,
  ...props
}: React.ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot="field-label"
      className={cn(
        "has-data-checked:bg-primary/5 has-data-checked:border-primary/30 dark:has-data-checked:border-primary/20 dark:has-data-checked:bg-primary/10 group/field-label peer/field-label flex w-fit gap-2 leading-snug group-data-[disabled=true]/field:opacity-50 has-[>[data-slot=field]]:rounded-md has-[>[data-slot=field]]:border *:data-[slot=field]:p-3",
        "has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function FieldTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-label"
      className={cn(
        "flex w-fit items-center gap-2 text-sm leading-snug font-medium group-data-[disabled=true]/field:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function FieldDescription({
  className,
  id,
  ...props
}: React.ComponentProps<"p">) {
  const messageId = useFieldMessageId(id, "description")
  return (
    <p
      id={messageId}
      data-slot="field-description"
      className={cn(
        "text-muted-foreground text-left text-sm leading-normal font-normal group-has-data-horizontal/field:text-balance [[data-variant=legend]+&]:-mt-1.5",
        "last:mt-0 nth-last-2:-mt-1",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

function FieldSeparator({
  children,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  children?: React.ReactNode
}) {
  return (
    <div
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "relative -my-2 h-5 text-sm group-data-[variant=outline]/field-group:-mb-2",
        className
      )}
      {...props}
    >
      <Separator className="absolute inset-0 top-1/2" />
      {children && (
        <span
          className="text-muted-foreground bg-background relative mx-auto block w-fit px-2"
          data-slot="field-separator-content"
        >
          {children}
        </span>
      )}
    </div>
  )
}

function FieldError({
  className,
  children,
  errors,
  id,
  ...props
}: React.ComponentProps<"div"> & {
  errors?: Array<{ message?: string } | undefined>
}) {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors?.length) {
      return null
    }

    const uniqueErrors = [
      ...new Map(errors.map((error) => [error?.message, error])).values(),
    ]

    if (uniqueErrors?.length == 1) {
      return uniqueErrors[0]?.message
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrors.map(
          (error, index) =>
            error?.message && <li key={index}>{error.message}</li>
        )}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <FieldErrorMessage
      id={id}
      className={className}
      {...props}
    >
      {content}
    </FieldErrorMessage>
  )
}

// Split from FieldError so only a rendered error registers its id.
function FieldErrorMessage({
  className,
  children,
  id,
  ...props
}: React.ComponentProps<"div">) {
  const messageId = useFieldMessageId(id, "error")
  return (
    <div
      id={messageId}
      role="alert"
      data-slot="field-error"
      className={cn("text-destructive-subtle-foreground text-sm font-normal", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
  fieldDescribedBy,
  mergeFieldControlProps,
  useFieldControlProps,
}
