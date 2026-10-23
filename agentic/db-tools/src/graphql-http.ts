// A GraphQL POST that keeps what the SDK's FetchAdapter throws away. That
// adapter turns any non-2xx into `HTTP 403: Forbidden` and drops the body, so
// a tenant API's `ACCESS_SUSPENDED` (a 403 with a JSON body, sent for a
// deleted or suspended database) reads the same as any other refusal. Here
// the body's errors keep their `extensions.code`, and every error carries the
// HTTP status it arrived with.

import {
  createFetch,
  type GraphQLAdapter,
  type GraphQLError,
  type QueryResult,
} from '@constructive-io/graphql-query/runtime';

export type { GraphQLError };

export type HttpGraphQLResponse<T> = {
  /** The response status, or null when no response arrived. */
  httpStatus: number | null;
  data: T | null;
  /**
   * Body errors, each with `extensions.httpStatus` added. A non-2xx without
   * body errors becomes one `{ code: 'HTTP_ERROR', httpStatus }` error, and a
   * fetch that threw becomes one `{ code: 'NETWORK' }` error.
   */
  errors: GraphQLError[];
};

export type PostGraphQLArgs = {
  endpoint: string;
  headers?: Record<string, string>;
  query: string;
  variables?: Record<string, unknown>;
  fetchFn?: typeof fetch;
};

const errorText = (err: unknown): string => (err instanceof Error ? err.message : String(err));

export async function postGraphQL<T>(args: PostGraphQLArgs): Promise<HttpGraphQLResponse<T>> {
  const fetchFn = (args.fetchFn ?? createFetch()).bind(globalThis) as typeof fetch;
  let response: Response;
  try {
    response = await fetchFn(args.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...args.headers,
      },
      body: JSON.stringify({ query: args.query, variables: args.variables ?? {} }),
    });
  } catch (err) {
    const cause = (err as { cause?: { code?: unknown } } | null)?.cause?.code;
    return {
      httpStatus: null,
      data: null,
      errors: [
        {
          message: typeof cause === 'string' ? `${errorText(err)} (${cause})` : errorText(err),
          extensions: { code: 'NETWORK' },
        },
      ],
    };
  }

  const httpStatus = response.status;
  let body: { data?: T | null; errors?: GraphQLError[] } | null = null;
  try {
    body = (await response.json()) as typeof body;
  } catch {
    body = null;
  }

  const bodyErrors = Array.isArray(body?.errors) ? body.errors : [];
  if (bodyErrors.length > 0) {
    return {
      httpStatus,
      data: body?.data ?? null,
      errors: bodyErrors.map((error) => ({
        ...error,
        message: error?.message ?? '',
        extensions: { ...error?.extensions, httpStatus },
      })),
    };
  }
  if (!response.ok || !body) {
    const text = response.statusText ? `: ${response.statusText}` : '';
    return {
      httpStatus,
      data: null,
      errors: [
        {
          message: response.ok ? `HTTP ${httpStatus}${text} (the body was not JSON)` : `HTTP ${httpStatus}${text}`,
          extensions: { code: 'HTTP_ERROR', httpStatus },
        },
      ],
    };
  }
  return { httpStatus, data: body.data ?? null, errors: [] };
}

/**
 * An ORM adapter over `postGraphQL`: the SDK clients take it in place of their
 * FetchAdapter, and their failures then carry the status and code.
 */
export function statusAdapter(
  endpoint: string,
  headers?: Record<string, string>,
  fetchFn?: typeof fetch,
): GraphQLAdapter {
  let current = { ...headers };
  return {
    async execute<T>(document: string, variables?: Record<string, unknown>): Promise<QueryResult<T>> {
      const result = await postGraphQL<T>({ endpoint, headers: current, query: document, variables, fetchFn });
      return result.errors.length > 0
        ? { ok: false, data: null, errors: result.errors }
        : { ok: true, data: result.data as T, errors: undefined };
    },
    setHeaders(next: Record<string, string>) {
      current = { ...current, ...next };
    },
    getEndpoint: () => endpoint,
  };
}

export type BackendErrorKind = 'suspended' | 'auth' | 'forbidden' | 'server' | 'network' | 'graphql';

const codeOf = (error: GraphQLError): string | undefined => {
  const code = error?.extensions?.code;
  return typeof code === 'string' ? code : undefined;
};

// The status an error arrived with: ours from extensions, or the SDK
// adapter's `HTTP 503: …` message.
const statusOf = (error: GraphQLError): number | undefined => {
  const status = error?.extensions?.httpStatus;
  if (typeof status === 'number') return status;
  const match = /^HTTP (\d{3})\b/.exec(error?.message ?? '');
  return match ? Number(match[1]) : undefined;
};

const AUTH_MESSAGE_RE = /jwt|unauthenticated|invalid token/i;
const FORBIDDEN_MESSAGE_RE = /permission denied/i;

/**
 * What a failed backend answer says, first match wins: the database is
 * suspended or gone (`ACCESS_SUSPENDED`), no response, the backend failing
 * (5xx, 429), a rejected credential (401), a refusal (403), or anything else.
 */
export function classifyBackendErrors(errors: readonly GraphQLError[]): BackendErrorKind {
  const list = errors ?? [];
  const some = (test: (error: GraphQLError) => boolean) => list.some((error) => test(error));
  if (some((e) => codeOf(e) === 'ACCESS_SUSPENDED')) return 'suspended';
  if (some((e) => codeOf(e) === 'NETWORK')) return 'network';
  if (
    some((e) => {
      const status = statusOf(e);
      return status !== undefined && (status >= 500 || status === 429);
    })
  ) {
    return 'server';
  }
  if (
    some((e) => statusOf(e) === 401 || codeOf(e) === 'UNAUTHENTICATED' || AUTH_MESSAGE_RE.test(e?.message ?? ''))
  ) {
    return 'auth';
  }
  if (
    some((e) => statusOf(e) === 403 || codeOf(e) === 'FORBIDDEN' || FORBIDDEN_MESSAGE_RE.test(e?.message ?? ''))
  ) {
    return 'forbidden';
  }
  return 'graphql';
}

/** The messages of a failed answer, joined for a reason string. */
export function errorsText(errors: readonly GraphQLError[]): string {
  return (errors ?? []).map((error) => error?.message || codeOf(error) || 'unknown error').join('; ');
}
