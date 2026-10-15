import type { HarnessToolContext } from '@agentic-kit/harness';
import { createFetch } from '@constructive-io/graphql-query/runtime';

export const REQUEST_TIMEOUT_MS = 30_000;
export const PROVISION_TIMEOUT_MS = 5 * 60_000;
export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 500;

const RETRY_STATUSES = new Set([502, 503, 504]);

// Codes that mean the connection never opened, so the server cannot have seen
// the request: the only failures where a write is safe to send again.
const NOT_SENT_CODES = new Set([
  'ECONNREFUSED',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'EADDRNOTAVAIL',
  'UND_ERR_CONNECT_TIMEOUT',
]);

export type BackendFetchOptions = {
  /** Aborts every send and every backoff wait. */
  signal?: AbortSignal;
  /** Limit of one send; `0` sends with no limit of its own. */
  timeoutMs?: number;
  /** Called before retry `attempt` of `max`. */
  onRetry?: (attempt: number, max: number) => void;
  fetch?: typeof globalThis.fetch;
  retryDelayMs?: number;
  random?: () => number;
};

/**
 * A `fetch` for backend GraphQL calls: it obeys `signal`, stops one send after
 * `timeoutMs`, and retries up to `MAX_RETRIES` times with backoff. A read
 * retries on any network error and on 502, 503, or 504. A write (a `mutation`
 * document) retries only when the connection never opened. A timeout never
 * retries: the limit is the limit of the whole request.
 */
export function createBackendFetch(options: BackendFetchOptions = {}): typeof globalThis.fetch {
  const {
    signal,
    timeoutMs = REQUEST_TIMEOUT_MS,
    onRetry,
    retryDelayMs = RETRY_DELAY_MS,
    random = Math.random,
  } = options;
  const baseFetch = options.fetch ?? createFetch();

  return async (input, init = {}) => {
    const write = isWrite(init);
    for (let attempt = 0; ; attempt++) {
      if (attempt > 0) {
        onRetry?.(attempt, MAX_RETRIES);
        await sleep(backoff(attempt, retryDelayMs, random), signal);
      }
      signal?.throwIfAborted();

      const timeout = timeoutMs > 0 ? AbortSignal.timeout(timeoutMs) : undefined;
      const sendSignal = signal && timeout ? AbortSignal.any([signal, timeout]) : signal ?? timeout;
      let response: Response;
      try {
        response = await baseFetch(input, { ...init, signal: sendSignal });
      } catch (err) {
        signal?.throwIfAborted();
        if (timeout?.aborted) throw timeoutError(input, timeoutMs, write);
        const retryable = !write || connectionNeverOpened(err);
        if (retryable && attempt < MAX_RETRIES) continue;
        throw err;
      }

      if (!write && RETRY_STATUSES.has(response.status) && attempt < MAX_RETRIES) {
        await response.arrayBuffer().catch((): undefined => undefined);
        continue;
      }
      return response;
    }
  };
}

/** A backend fetch for one tool call: its signal, and retries reported as progress. */
export function toolFetch(
  ctx: HarnessToolContext,
  options: BackendFetchOptions = {},
): typeof globalThis.fetch {
  return createBackendFetch({
    signal: ctx.signal,
    onRetry: (attempt, max) => ctx.onProgress?.(`Retrying ${attempt}/${max}`),
    ...options,
  });
}

/** The `fetch` and `signal` for `resolveProjectContext` in one tool call. */
export function toolRequests(
  ctx: HarnessToolContext,
  options: BackendFetchOptions = {},
): { fetch: typeof globalThis.fetch; signal?: AbortSignal } {
  return { fetch: toolFetch(ctx, options), signal: ctx.signal };
}

/** `signal`, also aborted with `message` once `ms` pass. */
export function withTimeLimit(
  signal: AbortSignal | undefined,
  ms: number,
  message: string,
): AbortSignal {
  const controller = new AbortController();
  setTimeout(() => controller.abort(new Error(message)), ms).unref?.();
  return signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
}

function isWrite(init: RequestInit): boolean {
  const method = (init.method ?? 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD') return false;
  if (typeof init.body !== 'string') return true;
  try {
    const { query } = JSON.parse(init.body) as { query?: unknown };
    return typeof query === 'string' ? topLevelKeywords(query).includes('mutation') : true;
  } catch {
    return true;
  }
}

// The words outside every brace, string, and comment: the operation keywords
// and names of a GraphQL document.
function topLevelKeywords(document: string): string[] {
  const words: string[] = [];
  let depth = 0;
  for (let i = 0; i < document.length; i++) {
    const char = document[i];
    if (char === '#') {
      while (i < document.length && document[i] !== '\n') i++;
    } else if (document.startsWith('"""', i)) {
      const end = document.indexOf('"""', i + 3);
      i = end === -1 ? document.length : end + 2;
    } else if (char === '"') {
      i++;
      while (i < document.length && document[i] !== '"') i += document[i] === '\\' ? 2 : 1;
    } else if (char === '{' || char === '(') {
      depth++;
    } else if (char === '}' || char === ')') {
      depth--;
    } else if (depth === 0 && /[A-Za-z_]/.test(char)) {
      const match = /^[A-Za-z_]\w*/.exec(document.slice(i));
      words.push(match[0]);
      i += match[0].length - 1;
    }
  }
  return words;
}

function connectionNeverOpened(err: unknown, depth = 0): boolean {
  if (!err || typeof err !== 'object' || depth > 5) return false;
  const { code, cause, errors } = err as { code?: unknown; cause?: unknown; errors?: unknown };
  if (typeof code === 'string' && NOT_SENT_CODES.has(code)) return true;
  if (connectionNeverOpened(cause, depth + 1)) return true;
  return Array.isArray(errors) && errors.some((e) => connectionNeverOpened(e, depth + 1));
}

function backoff(attempt: number, baseMs: number, random: () => number): number {
  const ceiling = baseMs * 2 ** (attempt - 1);
  return ceiling / 2 + random() * (ceiling / 2);
}

/** Resolves after `ms`, or rejects with the abort reason as soon as `signal` aborts. */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason);
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function timeoutError(input: RequestInfo | URL, timeoutMs: number, write: boolean): Error {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const seconds = Math.round(timeoutMs / 1000);
  const tail = write ? ' The request can still finish on the server.' : '';
  return new Error(`The backend at ${url} did not answer within ${seconds} s.${tail}`);
}
