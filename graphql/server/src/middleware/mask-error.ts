import crypto from 'node:crypto';

import { classify, type ErrorContext, parse } from '@constructive-io/errors';
import { getNodeEnv } from '@pgpmjs/env';
import { Logger } from '@pgpmjs/logger';
import { type GraphQLError, type GraphQLFormattedError } from 'graphql';

const maskErrorLog = new Logger('graphile:maskError');

/**
 * GraphQL framework protocol codes. These originate in the GraphQL/grafast
 * transport layer (not in constructive-db), so they are not Constructive domain
 * codes in the `@constructive-io/errors` registry. They are always safe to
 * surface — they carry no sensitive detail. Everything else (auth, account,
 * resource, constraint, and every constructive-db code) is classified by the
 * registry, which is the single source of truth for public vs. internal.
 */
const GRAPHQL_PROTOCOL_CODES = new Set([
  'GRAPHQL_VALIDATION_FAILED',
  'GRAPHQL_PARSE_FAILED',
  'PERSISTED_QUERY_NOT_FOUND',
  'PERSISTED_QUERY_NOT_SUPPORTED'
]);

/** A code is safe to surface when the registry classifies it public, or it is a
 * GraphQL framework protocol code. */
const isPublicCode = (code: string | null | undefined): boolean =>
  Boolean(code) && (classify(code) === 'public' || GRAPHQL_PROTOCOL_CODES.has(code as string));

/**
 * An error the GraphQL layer raised about the *request*, before any resolver
 * ran: an unknown input field, a value of the wrong type, a missing required
 * variable. graphql-js reports variable coercion without an `extensions.code`
 * (unlike parse/validation, which carry `GRAPHQL_PARSE_FAILED` /
 * `GRAPHQL_VALIDATION_FAILED`), so code-based classification alone reads it as
 * unknown and masks it — telling a client its own malformed query was a server
 * failure, with a reference id pointing at nothing.
 *
 * A request error is answered before a field is resolved, so it carries no
 * response `path` — every execution error has one. Coercion wraps the inner
 * complaint about the value, so `originalError` may be set, but only ever to
 * another GraphQL-layer error: anything a resolver or the database threw arrives
 * as a foreign error (a pg error, an `Error`) and is masked as before. The wrap
 * is recognized by name rather than by `instanceof`, because the error is raised
 * by whichever copy of graphql-js grafast resolved, not by this package's.
 */
const isGraphQLLayerError = (value: unknown): boolean =>
  value == null ||
  ((value as Error).name === 'GraphQLError' &&
    isGraphQLLayerError((value as GraphQLError).originalError));

const isRequestError = (error: GraphQLError): boolean =>
  error.path == null && isGraphQLLayerError((error as { originalError?: unknown }).originalError);

/**
 * A request error's message without the values the request sent. graphql-js
 * writes a variable coercion failure as `Variable "$x" got invalid value <the
 * value> at "<path>"; <inner>`, and a leaf type's inner complaint ends in the
 * value too (`String cannot represent a non string value: <value>`,
 * `Value "<value>" does not exist in "E" enum.`), so a password or API key sent
 * in a malformed input would come back in the answer. The variable, the path and
 * what was wrong stay; the values go.
 */
const withoutInputValues = (error: GraphQLError): string => {
  const inner = error.originalError?.message;
  const message = error.message;
  if (!message.startsWith('Variable "$') || !inner || !message.endsWith(`; ${inner}`)) return message;
  const prefix = message.slice(0, message.length - inner.length - 2);
  const variable = /^Variable "\$[^"]+"/.exec(prefix)?.[0];
  const at = / at "[^"]*"$/.exec(prefix)?.[0] ?? '';
  const complaint = inner
    .replace(/(value): [\s\S]*$/, '$1.')
    .replace(/^Value "[\s\S]*" does not exist in/, 'Value does not exist in');
  return `${variable} got invalid value${at}; ${complaint}`;
};

/** The code a surfaced request error carries when graphql-js supplied none. */
const BAD_USER_INPUT = 'BAD_USER_INPUT';

/**
 * Normalize any GraphQL/database error into a canonical Constructive shape.
 *
 * Database errors surface through Grafast without a populated `extensions.code`
 * (the semantic code lives in the message, and any SQLSTATE/DETAIL lives on the
 * underlying pg error at `originalError`). We parse `originalError` first so we
 * can recover the structured code, then fall back to the GraphQL error itself.
 */
export const normalizeError = (
  error: GraphQLError,
): { code: string | null; context: ErrorContext; class: 'public' | 'internal' } => {
  const original = (error as { originalError?: unknown }).originalError;
  const fromOriginal = original ? parse(original) : null;
  const parsed = fromOriginal?.code ? fromOriginal : parse(error);
  return { code: parsed.code, context: parsed.context, class: parsed.class };
};

/**
 * Production-aware error handling backed by `@constructive-io/errors`.
 *
 * 1. Enrich `extensions.code`/`class`/`context` from the parsed error so clients
 *    always receive a machine-readable code (fixing the gap where database
 *    errors reached clients as a bare message with empty `extensions`).
 * 2. Surface public (registered/allowlisted) errors as-is.
 * 3. In development, pass everything through (enriched) for debugging.
 * 4. In production, mask internal/unknown errors behind a reference ID and log
 *    the original.
 */
export const maskError = (error: GraphQLError): GraphQLError | GraphQLFormattedError => {
  const { code, context, class: errorClass } = normalizeError(error);

  // Lift the structured code onto extensions for every recognized error so
  // clients always receive a machine-readable code (`extensions` is read-only
  // on GraphQLError, so we build a formatted error rather than mutating it).
  const extensions: Record<string, unknown> = { ...error.extensions };
  if (code) {
    extensions.code = code;
    extensions.class = errorClass;
    if (Object.keys(context).length > 0) {
      extensions.context = context;
    }
  }

  const effectiveCode = code ?? (error.extensions?.code as string | undefined);
  if (!effectiveCode && isRequestError(error)) {
    extensions.code = BAD_USER_INPUT;
    return {
      message: withoutInputValues(error),
      ...(error.locations ? { locations: error.locations } : {}),
      extensions,
    } as GraphQLFormattedError;
  }

  if (isPublicCode(effectiveCode) || getNodeEnv() === 'development') {
    // Note: grafserv strips originalError and internal extensions before
    // serializing to the client, so returning the enriched error is safe.
    return {
      message: error.message,
      ...(error.locations ? { locations: error.locations } : {}),
      ...(error.path ? { path: error.path } : {}),
      extensions,
    } as GraphQLFormattedError;
  }

  // Mask internal/unknown errors with a reference ID.
  const errorId = crypto.randomBytes(8).toString('hex');
  maskErrorLog.error(`[masked-error:${errorId}]`, error);

  return {
    message: `An unexpected error occurred. Reference: ${errorId}`,
    extensions: {
      code: 'INTERNAL_SERVER_ERROR',
      errorId
    }
  } as GraphQLFormattedError;
};
