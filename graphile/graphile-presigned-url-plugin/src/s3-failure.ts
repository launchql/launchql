/**
 * Turning an S3 transport failure into a reason a caller can act on.
 *
 * The AWS SDK routinely fails with an **empty** `message`: an unreachable
 * endpoint arrives as an `AggregateError` whose own message is `''` and whose
 * per-address `errors` hold the `ECONNREFUSED`, and a hung socket arrives as a
 * bare wrapper around its `cause`. Anything that reports `err.message` verbatim
 * therefore hands the client a blank reason — which is how a server signing
 * against the wrong endpoint (a `storage_module.endpoint` naming a host the
 * server cannot reach) presents as an upload that fails with nothing to
 * diagnose.
 *
 * So a failure is described by walking to where the words actually are, and
 * re-thrown naming the coordinates it was talking to, with the original kept as
 * `cause` for the server log.
 */

/** How far to walk `errors` / `cause` before the chain stops being informative. */
const MAX_DEPTH = 4;

interface ErrorLike {
  name?: string;
  message?: string;
  errors?: unknown[];
  cause?: unknown;
  $metadata?: { httpStatusCode?: number };
}

/**
 * Describe a thrown S3 error in one line, including the nested errors an
 * `AggregateError` (or a `cause` chain) hides its actual reason in.
 */
export function describeS3Failure(err: unknown, depth = 0): string {
  if (err === null || err === undefined) return 'unknown error';
  if (typeof err !== 'object') return String(err);

  const e = err as ErrorLike;
  const name = typeof e.name === 'string' && e.name !== 'Error' ? e.name : '';
  const message = typeof e.message === 'string' ? e.message : '';
  const head = message.length > 0 ? [name, message].filter(Boolean).join(': ') : name;

  const status = e.$metadata?.httpStatusCode ? `HTTP ${e.$metadata.httpStatusCode}` : '';

  let detail = '';
  if (depth < MAX_DEPTH) {
    const nested = Array.isArray(e.errors) ? e.errors : e.cause !== undefined ? [e.cause] : [];
    const described = nested
      .map((inner) => describeS3Failure(inner, depth + 1))
      .filter((text) => text.length > 0 && text !== 'unknown error');
    if (described.length > 0) detail = `(${described.join('; ')})`;
  }

  const described = [head, status, detail].filter((part) => part.length > 0).join(' ');
  return described.length > 0 ? described : 'unknown error';
}

/**
 * Wrap a failed S3 call as an error whose message carries the operation, the
 * coordinates it used, and the underlying reason — with the original as `cause`.
 *
 * `context` is rendered as `key=value` pairs in the order given; entries with no
 * value are dropped, so a connection without an explicit endpoint (real AWS)
 * does not print an empty one.
 */
export function s3FailureError(
  operation: string,
  context: Record<string, string | number | undefined | null>,
  err: unknown,
): Error {
  const coordinates = Object.entries(context)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');

  const prefix = coordinates.length > 0 ? `${operation}: ${coordinates}` : operation;
  return new Error(`${prefix}: ${describeS3Failure(err)}`, { cause: err });
}
