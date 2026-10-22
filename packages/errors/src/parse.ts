import { classify } from './classify';
import { ConstructiveError } from './error';
import { format } from './format';
import { httpStatusFor } from './http';
import { extractPgErrorFields, RAISE_EXCEPTION_SQLSTATE, SQLSTATE_TO_CODE } from './pg';
import { getDefinition } from './registry';
import type { ContextValue, ErrorClass, ErrorContext, ParsedError } from './types';

/** Leading ALL_CAPS token, optionally followed by `(arg, arg)` positional args. */
const CODE_TOKEN = /^([A-Z][A-Z0-9_]+)(?:\s*\((.*)\))?\s*$/;

/** Narrow an arbitrary value to a valid {@link ErrorClass}, else `null`. */
function toErrorClass(value: unknown): ErrorClass | null {
  return value === 'public' || value === 'internal' ? value : null;
}

interface GraphqlLike {
  message?: string;
  extensionsCode?: string;
  extensionsContext?: ErrorContext;
  extensionsClass?: ErrorClass;
}

function getMessage(error: unknown): string {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (error && typeof error === 'object' && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message;
  }
  return String(error);
}

/** Pull GraphQL-shaped fields, including the `{ errors: [...] }` request wrapper. */
function extractGraphqlLike(error: unknown): GraphqlLike | null {
  if (!error || typeof error !== 'object') return null;
  const e = error as Record<string, unknown>;

  const fromNode = (node: Record<string, unknown> | undefined): GraphqlLike | null => {
    if (!node) return null;
    const extensions = node.extensions as Record<string, unknown> | undefined;
    const out: GraphqlLike = {};
    if (typeof node.message === 'string') out.message = node.message;
    if (extensions && typeof extensions.code === 'string') out.extensionsCode = extensions.code;
    if (extensions && extensions.context && typeof extensions.context === 'object') {
      out.extensionsContext = extensions.context as ErrorContext;
    }
    if (extensions) {
      const cls = toErrorClass(extensions.class);
      if (cls) out.extensionsClass = cls;
    }
    return out.message || out.extensionsCode ? out : null;
  };

  if (Array.isArray(e.errors) && e.errors.length > 0) {
    const first = fromNode(e.errors[0] as Record<string, unknown>);
    if (first) return first;
  }
  return fromNode(e);
}

function parseDetailJson(
  detail?: string
): { code: string; context: ErrorContext; class: ErrorClass | null } | null {
  if (!detail) return null;
  const trimmed = detail.trim();
  if (!trimmed.startsWith('{')) return null;
  try {
    const obj = JSON.parse(trimmed) as { code?: unknown; context?: unknown; class?: unknown };
    if (obj && typeof obj.code === 'string') {
      const context = obj.context && typeof obj.context === 'object' ? (obj.context as ErrorContext) : {};
      return { code: obj.code, context, class: toErrorClass(obj.class) };
    }
  } catch {
    // not structured json — fall through
  }
  return null;
}

function coerce(value: string): ContextValue {
  if (value === '') return value;
  const num = Number(value);
  return Number.isNaN(num) ? value : num;
}

/** Map legacy positional args (`CODE (a, b)`) onto named context keys. */
function mapPositional(code: string, args: string[]): ErrorContext {
  if (args.length === 0) return {};
  const positional = getDefinition(code)?.positional;
  if (!positional || positional.length === 0) {
    return { args: args.join(', ') };
  }
  const context: ErrorContext = {};
  positional.forEach((key, i) => {
    if (i < args.length) context[key] = coerce(args[i]);
  });
  return context;
}

function parseMessageCode(message: string): { code: string; args: string[] } | null {
  const m = message.trim().match(CODE_TOKEN);
  if (!m) return null;
  return { code: m[1], args: m[2] !== undefined ? m[2].split(',').map((s) => s.trim()).filter(Boolean) : [] };
}

/**
 * Normalize an error from any source (a {@link ConstructiveError}, a node-postgres
 * `DatabaseError`, a GraphQL error or `{ errors: [...] }` wrapper, a plain
 * `Error`, or a string) into a canonical {@link ParsedError}.
 *
 * Resolution order for the code:
 * 1. structured `DETAIL` JSON (`{ code, context }`) — Constructive's DB transport
 * 2. GraphQL `extensions.code`
 * 3. a leading ALL_CAPS token in the message (legacy DB `RAISE`), with any
 *    `(arg, arg)` positional args mapped onto named context via the registry
 * 4. native SQLSTATE constraint mapping (23505 → `UNIQUE_VIOLATION`, …)
 *
 * Classification trusts an explicit `class` provided by the producer — the
 * database transport's `DETAIL.class` or the server's `extensions.class` — when
 * present, since that source is authoritative for the raise site (and correctly
 * classifies codes not yet in the registry). It falls back to `classify(code)`
 * (registry lookup, unknown ⇒ `internal`) only when no explicit class is given.
 * `explicitClass` records the producer class actually used, and is absent when
 * classification falls back to the registry or the unknown-code default.
 */
export function parse(error: unknown): ParsedError {
  if (error instanceof ConstructiveError) {
    return {
      code: error.code,
      context: error.context ?? {},
      class: error.errorClass,
      ...(toErrorClass(error.errorClass) ? { explicitClass: error.errorClass } : {}),
      known: Boolean(getDefinition(error.code)),
      rawMessage: error.message,
      originalError: error
    };
  }

  const pg = extractPgErrorFields(error);
  const gql = extractGraphqlLike(error);
  const rawMessage = gql?.message ?? getMessage(error);
  const sqlState = pg?.code;

  let code: string | null = null;
  let context: ErrorContext = {};
  let explicitClass: ErrorClass | null = null;

  const detail = parseDetailJson(pg?.detail);
  if (detail) {
    code = detail.code;
    context = { ...detail.context };
    explicitClass = detail.class;
  }

  if (!code && gql?.extensionsCode) {
    code = gql.extensionsCode;
    if (gql.extensionsContext) context = { ...gql.extensionsContext };
    if (gql.extensionsClass) explicitClass = gql.extensionsClass;
  }

  if (!code) {
    const parsedMsg = parseMessageCode(gql?.message ?? rawMessage);
    if (parsedMsg && parsedMsg.code !== RAISE_EXCEPTION_SQLSTATE) {
      code = parsedMsg.code;
      context = mapPositional(parsedMsg.code, parsedMsg.args);
    }
  }

  if ((!code || code === RAISE_EXCEPTION_SQLSTATE) && sqlState && SQLSTATE_TO_CODE[sqlState]) {
    code = SQLSTATE_TO_CODE[sqlState];
    if (pg?.constraint) context.constraint = pg.constraint;
    if (pg?.table) context.table = pg.table;
    if (pg?.column) context.column = pg.column;
  }

  if (code === RAISE_EXCEPTION_SQLSTATE) code = null;

  return {
    code,
    context,
    class: explicitClass ?? classify(code),
    ...(explicitClass ? { explicitClass } : {}),
    known: Boolean(code && getDefinition(code)),
    rawMessage,
    sqlState,
    originalError: error
  };
}

/**
 * Normalize any error into a throwable {@link ConstructiveError}.
 *
 * Delegates to {@link parse} for code/context/class recovery, then resolves a
 * localized message from the registry catalogs (falling back to the source
 * error's raw message when the code is unknown) and the registry's HTTP hint.
 * Codes that could not be resolved become `UNKNOWN_ERROR` (internal); a code
 * with no registered status is reported by {@link httpStatusFor} rather than
 * quietly becoming a 500.
 */
export function toError(error: unknown, locale?: string): ConstructiveError {
  if (error instanceof ConstructiveError) return error;

  const parsed = parse(error);
  const code = parsed.code ?? 'UNKNOWN_ERROR';
  const def = getDefinition(code);
  const message = parsed.known
    ? format(code, parsed.context, locale)
    : parsed.rawMessage || format(code, parsed.context, locale);

  return new ConstructiveError({
    code,
    message,
    errorClass: parsed.class,
    http: def ? def.http : httpStatusFor(code).status,
    context: parsed.context
  });
}
