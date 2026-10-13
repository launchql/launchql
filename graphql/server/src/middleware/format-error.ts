import crypto from 'node:crypto';

import { type ErrorContext, parse } from '@constructive-io/errors';
import { Logger } from '@pgpmjs/logger';
import { type GraphQLError, type GraphQLFormattedError } from 'graphql';

const formatErrorLog = new Logger('graphile:formatError');

/**
 * An error the GraphQL layer raised about the *request*, before any resolver
 * ran: an unknown input field, a value of the wrong type, a missing required
 * variable. graphql-js reports variable coercion without an `extensions.code`
 * (unlike parse/validation, which carry `GRAPHQL_PARSE_FAILED` /
 * `GRAPHQL_VALIDATION_FAILED`), so code-based classification alone would read
 * it as a server failure instead of the client's own malformed query.
 *
 * A request error is answered before a field is resolved, so it carries no
 * response `path` — every execution error has one. Coercion wraps the inner
 * complaint about the value, so `originalError` may be set, but only ever to
 * another GraphQL-layer error: anything a resolver or the database threw arrives
 * as a foreign error (a pg error, an `Error`). The wrap
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

/** The code a request error carries when graphql-js supplied none. */
const BAD_USER_INPUT = 'BAD_USER_INPUT';

/** The code any other error carries when nothing supplied one. */
const INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR';

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
 * Format every GraphQL error the same way, in every environment. Nothing is
 * masked: the client always receives the real message.
 *
 * 1. Lift the structured code onto `extensions.code`/`class`/`context` from the
 *    parsed error, so database errors reach clients with a machine-readable
 *    code instead of a bare message with empty `extensions`.
 * 2. A request error graphql-js raised without a code is `BAD_USER_INPUT`.
 * 3. Any other error without a code is `INTERNAL_SERVER_ERROR`.
 * 4. Every internal error (unknown, or registered as internal) carries an
 *    `errorId` and is logged under it, so a report can be matched to the log.
 */
export const formatError = (error: GraphQLError): GraphQLFormattedError => {
  const { code, context, class: errorClass } = normalizeError(error);

  // `extensions` is read-only on GraphQLError, so build a formatted error
  // rather than mutating it.
  const extensions: Record<string, unknown> = { ...error.extensions };
  if (code) {
    extensions.code = code;
    extensions.class = errorClass;
    if (Object.keys(context).length > 0) {
      extensions.context = context;
    }
  }

  let internal = Boolean(code) && errorClass === 'internal';
  let message = error.message;
  if (!code && !error.extensions?.code) {
    const requestError = isRequestError(error);
    if (requestError) message = withoutInputValues(error);
    extensions.code = requestError ? BAD_USER_INPUT : INTERNAL_SERVER_ERROR;
    internal = !requestError;
  }

  if (internal) {
    const errorId = crypto.randomBytes(8).toString('hex');
    extensions.errorId = errorId;
    formatErrorLog.error(`[graphql-error:${errorId}]`, error);
  }

  // grafserv strips originalError before serializing to the client.
  return {
    message,
    ...(error.locations ? { locations: error.locations } : {}),
    ...(error.path ? { path: error.path } : {}),
    extensions
  };
};
