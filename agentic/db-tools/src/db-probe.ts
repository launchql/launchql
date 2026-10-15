import { api } from '@constructive-io/sdk';

export type DatabaseProbe =
  | { outcome: 'found'; name?: string; ownerId?: string }
  | { outcome: 'missing' }
  | { outcome: 'unreachable'; detail: string };

type ProbePayload = {
  databases: {
    nodes: { id: string; name: string | null; ownerId: string | null }[];
  } | null;
};

export type ProbeExecutor = {
  execute<T>(
    document: string,
    variables?: Record<string, unknown>,
  ): Promise<
    | { ok: true; data: T; errors: undefined }
    | { ok: false; data: null; errors: { message: string }[] }
  >;
};

const AUTH_ERROR_RE = /unauthenticated|unauthorized|permission denied|jwt|http 401|http 403/i;

// Liveness probe for a bound database. The split drives recovery: 'missing'
// means the backend answered and the binding is dead (database deleted,
// backend refreshed) — recovery is reprovision. 'unreachable' means no usable
// answer (backend down, network error, rejected credential) — recovery is
// retry/re-sign-in, never reprovision.
//
// The probe authenticates with the ACCOUNT bearer, not the project's .env key:
// the platform api rejects per-database keys, and the singular `database(id:)`
// field is gone from the current contract, so the lookup goes through the
// `databases` collection filter via the SDK's raw FetchAdapter.
export async function probeDatabase(args: {
  endpoint: string;
  bearer: string;
  databaseId: string;
  executor?: ProbeExecutor;
  signInHint?: string;
  fetch?: typeof globalThis.fetch;
  signal?: AbortSignal;
}): Promise<DatabaseProbe> {
  const executor =
    args.executor ??
    new api.FetchAdapter(args.endpoint, { Authorization: `Bearer ${args.bearer}` }, args.fetch);
  const document = `
    query ProbeDatabase {
      databases(where: { id: { equalTo: ${JSON.stringify(args.databaseId)} } }) {
        nodes { id name ownerId }
      }
    }`;
  try {
    const result = await executor.execute<ProbePayload>(document);
    if (result.ok) {
      const node = result.data.databases?.nodes?.[0];
      if (!node) return { outcome: 'missing' };
      return { outcome: 'found', name: node.name ?? undefined, ownerId: node.ownerId ?? undefined };
    }
    const detail = result.errors?.[0]?.message ?? 'unknown error';
    // A 5xx is the backend failing, not an answer about this database. An auth
    // rejection is a dead ACCOUNT credential — never evidence the binding is
    // dead, so it must not push toward reprovision.
    if (/^HTTP 5\d\d/i.test(detail)) return { outcome: 'unreachable', detail };
    if (AUTH_ERROR_RE.test(detail)) {
      return {
        outcome: 'unreachable',
        detail: `${detail} — the account credential was rejected. ${
          args.signInHint ?? 'Sign in again, then retry.'
        }`,
      };
    }
    return { outcome: 'missing' };
  } catch (err) {
    args.signal?.throwIfAborted();
    return { outcome: 'unreachable', detail: err instanceof Error ? err.message : String(err) };
  }
}
