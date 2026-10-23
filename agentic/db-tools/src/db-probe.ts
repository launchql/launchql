import { classifyBackendErrors, errorsText, type GraphQLError, postGraphQL } from './graphql-http';
import { getHost } from './host';

const DEFAULT_API_ENDPOINT = 'http://api.localhost:3000/graphql';

export type UnreachableCause = 'network' | 'server' | 'auth' | 'error';

export type DatabaseProbe =
  | { status: 'found'; databaseId: string; name?: string; ownerId?: string; hash?: string }
  | {
      status: 'suspended';
      databaseId: string;
      name?: string;
      ownerId?: string;
      hash?: string;
      suspendedAt: string;
      suspendedReason?: string;
    }
  | { status: 'missing'; databaseId: string }
  | { status: 'unreachable'; databaseId: string; cause: UnreachableCause; detail: string };

type ProbeNode = {
  id: string;
  name?: string | null;
  ownerId?: string | null;
  hash?: string | null;
  suspendedAt?: string | null;
  suspendedReason?: string | null;
};

type ProbePayload = { databases: { nodes: ProbeNode[] } | null };

const FIELDS = 'id name ownerId hash suspendedAt suspendedReason';
// A backend from before `hash` and the suspension columns.
const BASIC_FIELDS = 'id name ownerId';
const NEWER_FIELD_RE = /\b(hash|suspended_?at|suspended_?reason)\b/i;

const document = (databaseId: string, fields: string) => `
    query ProbeDatabase {
      databases(where: { id: { equalTo: ${JSON.stringify(databaseId)} } }, first: 1) {
        nodes { ${fields} }
      }
    }`;

// Liveness probe for a bound database, on the platform api. Only 'missing'
// means the binding is dead: the backend answered and the account can't see
// the database (deleted, or access to it lost). 'suspended' means it exists
// and is held, so its data must not be replaced. 'unreachable' is any answer
// that says nothing about the database (no response, a failing backend, a
// rejected account credential, an error this probe doesn't know); recovery is
// a retry or a sign-in, never a reprovision.
//
// The probe authenticates with the ACCOUNT bearer, not the project's .env key:
// the platform api rejects per-database keys, and the singular `database(id:)`
// field is gone from the current contract, so the lookup goes through the
// `databases` collection filter.
export async function probeDatabase(args: {
  endpoint: string;
  bearer: string;
  databaseId: string;
  signInHint?: string;
  post?: typeof postGraphQL;
}): Promise<DatabaseProbe> {
  const post = args.post ?? postGraphQL;
  const { databaseId } = args;
  const ask = (fields: string) =>
    post<ProbePayload>({
      endpoint: args.endpoint,
      headers: { Authorization: `Bearer ${args.bearer}` },
      query: document(databaseId, fields),
    });

  let result = await ask(FIELDS);
  if (result.errors.length > 0 && result.errors.some((e) => NEWER_FIELD_RE.test(e?.message ?? ''))) {
    result = await ask(BASIC_FIELDS);
  }
  if (result.errors.length > 0) return unreachable(databaseId, result.errors, args.signInHint);

  const nodes = result.data?.databases?.nodes;
  if (!Array.isArray(nodes)) {
    return { status: 'unreachable', databaseId, cause: 'error', detail: 'the backend answered without a databases list' };
  }
  const node = nodes[0];
  if (!node) return { status: 'missing', databaseId };
  const found = {
    databaseId,
    name: node.name ?? undefined,
    ownerId: node.ownerId ?? undefined,
    hash: node.hash ?? undefined,
  };
  if (node.suspendedAt) {
    return {
      status: 'suspended',
      ...found,
      suspendedAt: node.suspendedAt,
      suspendedReason: node.suspendedReason ?? undefined,
    };
  }
  return { status: 'found', ...found };
}

function unreachable(databaseId: string, errors: GraphQLError[], signInHint?: string): DatabaseProbe {
  const detail = errorsText(errors);
  switch (classifyBackendErrors(errors)) {
  case 'network':
    return { status: 'unreachable', databaseId, cause: 'network', detail };
  case 'server':
    return { status: 'unreachable', databaseId, cause: 'server', detail };
  case 'auth':
  case 'forbidden':
    // A rejected ACCOUNT credential is never evidence the binding is dead.
    return {
      status: 'unreachable',
      databaseId,
      cause: 'auth',
      detail: `${detail}: the account credential was rejected. ${signInHint ?? 'Sign in again, then retry.'}`,
    };
  default:
    return { status: 'unreachable', databaseId, cause: 'error', detail };
  }
}

/**
 * Probe a database with the host's account bearer on its configured control
 * endpoint (never a project-pinned one). Without a bearer the answer is
 * unreachable with cause 'auth'.
 */
export async function probeBoundDatabase(databaseId: string): Promise<DatabaseProbe> {
  const host = getHost();
  const account = host.account();
  const bearer = account?.apiKey ?? account?.accessToken;
  if (!bearer) {
    return {
      status: 'unreachable',
      databaseId,
      cause: 'auth',
      detail: `No usable account credential. ${host.signInHint ?? 'Sign in to the app, then retry.'}`,
    };
  }
  return probeDatabase({
    endpoint: host.backendConfig()?.apiEndpoint || DEFAULT_API_ENDPOINT,
    bearer,
    databaseId,
    signInHint: host.signInHint,
  });
}
