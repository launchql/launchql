/**
 * Core types for the Constructive error system.
 *
 * A Constructive error is identified by a stable, machine-readable `code`
 * (ALL_CAPS). Human-facing copy is kept separate (in i18n catalogs) so the
 * same code can be localized. Every code is classified as `public` (safe to
 * surface to end users) or `internal` (an invariant/developer error that must
 * be masked in production).
 */

/** Values that can be interpolated into a message or carried as error context. */
export type ContextValue = string | number | boolean | null | undefined;

/** Structured, machine-readable context attached to an error. */
export type ErrorContext = Record<string, ContextValue>;

/** A context with no parameters (codes that take no dynamic values). */
export type EmptyContext = Record<never, never>;

/**
 * Classification of a code.
 * - `public`   — user-facing; safe to send to clients as-is.
 * - `internal` — developer/invariant error; masked in production.
 */
export type ErrorClass = 'public' | 'internal';

/**
 * A single registry entry describing one error code. This is the source of
 * truth; message copy, factories, and classification all derive from it.
 */
export interface ErrorDefinition<C extends ErrorContext = EmptyContext> {
  /** Stable machine code, e.g. `ACCOUNT_EXISTS`. */
  code: string;
  /** Public (surface to users) vs internal (mask in prod). */
  class: ErrorClass;
  /** HTTP status hint for transports that want one. */
  http: number;
  /**
   * Default message. Either an i18n template using `{{var}}` placeholders
   * (preferred — localizable) or a function for messages with conditional
   * logic that a flat template cannot express.
   */
  message: string | ((context: C) => string);
  /** Documented context parameter names (for tooling / codegen). */
  params?: readonly (keyof C & string)[];
  /**
   * For legacy dynamic DB throws of the form `CODE (arg0, arg1)`, maps the
   * positional args to context keys so `parse()` can recover structure.
   */
  positional?: readonly (keyof C & string)[];
}

/** The canonical, normalized result of parsing an error from any source. */
export interface ParsedError {
  /** Constructive code if one could be determined, else `null`. */
  code: string | null;
  /** Structured context recovered from the error (may be empty). */
  context: ErrorContext;
  /** Classification (`internal` when the code is unknown — fail safe). */
  class: ErrorClass;
  /**
   * Valid producer classification actually used by parse (canonical error,
   * DETAIL or GraphQL extensions). Absent when class comes from the registry
   * or the unknown-code fallback. Describes the immediate input before any further normalization.
   */
  explicitClass?: ErrorClass;
  /** `true` when `code` is present in the registry. */
  known: boolean;
  /** Best-effort raw message from the source error. */
  rawMessage: string;
  /** Original PostgreSQL SQLSTATE, when the source was a pg error. */
  sqlState?: string;
  /** The original error, for logging/debugging. */
  originalError: unknown;
}

/** Extended PostgreSQL error fields (populated by pg-protocol on errors). */
export interface PgErrorFields {
  code?: string;
  detail?: string;
  hint?: string;
  where?: string;
  position?: string;
  internalPosition?: string;
  internalQuery?: string;
  schema?: string;
  table?: string;
  column?: string;
  dataType?: string;
  constraint?: string;
  file?: string;
  line?: string;
  routine?: string;
}
