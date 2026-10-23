import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { api, auth, modules } from '@constructive-io/sdk';
import { parseDotenv } from '12factor-env/dotenv';

import { probeDatabase, type UnreachableCause } from './db-probe';
import { DEFAULT_DATA_TOKEN_SKEW_MS, getHost, reprovisionAdvice } from './host';

const DEFAULT_API_ENDPOINT = 'http://api.localhost:3000/graphql';
const DEFAULT_MODULES_ENDPOINT = 'http://modules.localhost:3000/graphql';

export type ApiClient = ReturnType<typeof api.createClient>;
export type ModulesClient = ReturnType<typeof modules.createClient>;

export type ProjectContext = {
  api: ApiClient;
  modules: ModulesClient;
  databaseId: string;
  schemaId: string;
  ownerId: string | undefined;
  apiEndpoint: string;
  modulesEndpoint: string;
  databaseName: string;
  accessToken: string;
  // Per-DB data/CRUD endpoint (api-<db>.localhost). Empty when DATABASE_NAME is
  // absent — record tools need it; schema tools use `api` and ignore it.
  dataEndpoint: string;
  // The database's schema hash as the binding probe read it; it changes on
  // every schema change. Undefined on a backend that doesn't serve it.
  hash?: string;
};

export type ProjectContextFailureCode =
  | 'no-env'
  | 'missing-credentials'
  | 'db-missing'
  | 'db-suspended'
  | 'account-mismatch'
  | 'backend-unreachable'
  | 'schema-unresolved';

export type ResolveResult = {
  context: ProjectContext | null;
  reason: string;
  code?: ProjectContextFailureCode;
  /** Why the backend couldn't answer, with code 'backend-unreachable'. */
  cause?: UnreachableCause;
};

// The project values pi needs, and where they come from. A scaffolded project
// folder carries them in `.env` (desktop); a headless host — a container, a
// Job, CI — injects them as real environment variables, so no credential is
// ever written into a git clone the agent could commit. Both lanes produce the
// same record, which is why the resolver takes VALUES, not a directory.
export const CONTEXT_ENV_KEYS = [
  'ACCESS_TOKEN',
  'DATABASE_ID',
  'API_ENDPOINT',
  'MODULES_ENDPOINT',
  'DATABASE_NAME',
  'OWNER_ID',
] as const;

export type ContextEnvKey = (typeof CONTEXT_ENV_KEYS)[number];

/** Prefix for injected variables: `ACCESS_TOKEN` is far too generic to claim in
 *  a shared process environment, `CONSTRUCTIVE_ACCESS_TOKEN` is not. Inside a
 *  project `.env` the bare names stay readable (and are what the scaffolder
 *  writes), so both spellings resolve, prefixed winning. */
export const CONTEXT_ENV_PREFIX = 'CONSTRUCTIVE_';

/** Values keyed by name, or a lookup function (a host with a secret store). */
export type ContextSource =
  | Record<string, string | undefined>
  | ((name: string) => string | undefined);

const lookup = (source: ContextSource): ((name: string) => string | undefined) =>
  typeof source === 'function' ? source : (name) => source[name];

const readContextValue = (source: ContextSource, key: ContextEnvKey): string | undefined => {
  const get = lookup(source);
  const value = get(`${CONTEXT_ENV_PREFIX}${key}`) ?? get(key);
  return value ? value : undefined;
};

/** Use the process environment (or any injected record) as the source. */
export function fromEnvironment(
  environment: Record<string, string | undefined> = process.env,
): ContextSource {
  return environment;
}

/** Read a project `.env` as the source. The file is authoritative here — the
 *  key in it belongs to whatever backend wrote it, so it is not merged under
 *  the ambient environment. Returns null when the file is absent. */
export async function fromEnvFile(cwd: string): Promise<ContextSource | null> {
  try {
    return parseDotenv(await readFile(path.join(cwd, '.env'), 'utf8'));
  } catch {
    return null;
  }
}

export type ResolveOptions = {
  /** Which plane the context is for. Ownership gates the control plane only:
   *  schema editing and provisioning act under the signed-in account, so a
   *  foreign-owned binding is blocked ('account-mismatch'). The data plane
   *  (real rows via app end-user tokens) never checks desktop-account
   *  ownership — a live foreign-owned database serves data fine, exactly as
   *  the app itself does in the Preview. */
  plane?: 'control' | 'data';
};

/**
 * Resolve the project context from injected values, or from a project folder.
 *
 * Passing a `cwd` string keeps the original behavior (read `<cwd>/.env`) so
 * existing hosts — Constructive Desktop, the confirm gate — are unchanged.
 * Headless hosts pass values instead: `fromEnvironment()` for a container or
 * Job, an explicit record for anything else.
 */
export async function resolveProjectContext(
  input: string | ContextSource,
  options: ResolveOptions = {},
): Promise<ResolveResult> {
  const source = typeof input === 'string' ? await fromEnvFile(input) : input;
  if (!source) {
    return {
      context: null,
      reason:
        'No .env found in the project. Provision a Constructive database first (scaffold the project), then retry.',
      code: 'no-env',
    };
  }

  const env = Object.fromEntries(
    CONTEXT_ENV_KEYS.map((key) => [key, readContextValue(source, key)]),
  ) as Record<ContextEnvKey, string | undefined>;
  const accessToken = env.ACCESS_TOKEN;
  const databaseId = env.DATABASE_ID;

  if (!accessToken || !databaseId) {
    return {
      context: null,
      reason: `Project is not connected to a Constructive database yet (missing ${CONTEXT_ENV_PREFIX}ACCESS_TOKEN/${CONTEXT_ENV_PREFIX}DATABASE_ID in the environment, or ACCESS_TOKEN/DATABASE_ID in .env). Provision the database first, then retry.`,
      code: 'missing-credentials',
    };
  }

  // A source-supplied pin wins for the DATA plane (the access key belongs to
  // whatever backend wrote it); otherwise fall back to the app's backend-config
  // store (environment-aware) so app + harness share one endpoint source.
  const host = getHost();
  const backend = host.backendConfig();
  const apiEndpoint = env.API_ENDPOINT || backend?.apiEndpoint || DEFAULT_API_ENDPOINT;
  const modulesEndpoint = env.MODULES_ENDPOINT || backend?.modulesEndpoint || DEFAULT_MODULES_ENDPOINT;

  // The whole control plane (binding probe, schema resolution, blueprint/schema
  // tools) authenticates with the ACCOUNT bearer: the platform api rejects
  // per-database keys, so the project ACCESS_TOKEN can never act on metaschema
  // surfaces. The source's key stays in the context for the data plane only.
  // The bearer is only ever sent to the app-configured backend — never a
  // source-pinned endpoint, which an untrusted cloned project controls.
  const controlApiEndpoint = backend?.apiEndpoint || DEFAULT_API_ENDPOINT;
  const controlModulesEndpoint = backend?.modulesEndpoint || DEFAULT_MODULES_ENDPOINT;
  const account = host.account();
  const accountBearer = account?.apiKey ?? account?.accessToken;
  if (!accountBearer) {
    return {
      context: null,
      reason: `No usable account credential to reach the Constructive control plane. ${
        host.signInHint ?? 'Sign in to the app, then retry.'
      }`,
      code: 'missing-credentials',
    };
  }
  const controlHeaders = { Authorization: `Bearer ${accountBearer}` };

  const apiClient = api.createClient({ endpoint: controlApiEndpoint, headers: controlHeaders });

  // Always probe the bound database — the DATABASE_ID stamp proves it WAS
  // bound, never that the database still exists (backend refresh, deletion,
  // revoked key). The probe is the single source of binding health.
  const probe = await probeDatabase({
    endpoint: controlApiEndpoint,
    bearer: accountBearer,
    databaseId,
    signInHint: host.signInHint,
  });
  if (probe.status === 'unreachable') {
    return {
      context: null,
      reason: unreachableReason(controlApiEndpoint, probe.cause, probe.detail),
      code: 'backend-unreachable',
      cause: probe.cause,
    };
  }
  if (probe.status === 'missing') {
    return {
      context: null,
      reason: `The bound database (DATABASE_ID=${databaseId}) no longer exists on this backend, or this account lost access to it. ${reprovisionAdvice(host)}`,
      code: 'db-missing',
    };
  }

  // Schemas are account-scoped: a live binding under a different account is
  // never shown in the Schemas tab or written to by the agent. The project's
  // local blueprint survives account changes, so recovery is a reprovision
  // under the signed-in account. Owner truth comes from the probe (backend),
  // not the source's stamp. Data-plane resolution skips this gate — see
  // ResolveOptions.
  const sessionUserId = account?.userId;
  if (
    options.plane !== 'data' &&
    probe.ownerId &&
    sessionUserId &&
    probe.ownerId !== sessionUserId
  ) {
    return {
      context: null,
      reason: `The bound database (DATABASE_ID=${databaseId}) was provisioned under a different account than the one signed in. ${reprovisionAdvice(host)}`,
      code: 'account-mismatch',
    };
  }

  // A suspended database still holds its data, so it is never a reason to
  // reprovision: nothing can read or change it until the hold is lifted.
  if (probe.status === 'suspended') {
    const why = probe.suspendedReason ? ` (${probe.suspendedReason})` : '';
    return {
      context: null,
      reason: `The bound database (DATABASE_ID=${databaseId}) is suspended${why} since ${probe.suspendedAt}. Its data is kept, but nothing can read or change it until the suspension is lifted.`,
      code: 'db-suspended',
    };
  }

  const databaseName = env.DATABASE_NAME || probe.name || '';
  const ownerId = probe.ownerId || env.OWNER_ID || undefined;
  const dataEndpoint = databaseName
    ? deriveSubdomainEndpoint(apiEndpoint, `api-${databaseName}`)
    : '';

  const schema = await resolveSchemaId(apiClient, databaseId);
  if ('reason' in schema) {
    return { context: null, reason: schema.reason, code: 'schema-unresolved' };
  }
  const schemaId = schema.id;

  return {
    context: {
      api: apiClient,
      modules: modules.createClient({ endpoint: controlModulesEndpoint, headers: controlHeaders }),
      databaseId,
      schemaId,
      ownerId,
      apiEndpoint,
      modulesEndpoint,
      databaseName,
      accessToken,
      dataEndpoint,
      hash: probe.hash,
    },
    reason: '',
  };
}

function unreachableReason(endpoint: string, cause: UnreachableCause, detail: string): string {
  switch (cause) {
  case 'auth':
    // The probe's detail says the credential was rejected and how to sign in.
    return `Could not check the bound database on the Constructive backend at ${endpoint}: ${detail}`;
  case 'error':
    return `The Constructive backend at ${endpoint} answered with an error while checking the bound database (${detail}). Retry; if it keeps failing, check the backend's logs.`;
  case 'server':
    return `The Constructive backend at ${endpoint} is failing (${detail}). Check it is running, then retry.`;
  default:
    return `Could not reach the Constructive backend at ${endpoint} (${detail}). Check it is running, then retry.`;
  }
}

const needsAuthReason = (): string =>
  `Not signed in to the app database yet. ${
    getHost().signInHint ??
    'Sign in from the Sheets tab, or open the Preview and sign in to your app, then try again.'
  }`;

export type DataTokenResult = { token?: string; userId?: string; reason?: string };

// Resolve a data-plane token for record operations: serve the broker's active
// account while valid, otherwise harvest the token the user created by signing
// into their app in the Preview and adopt it into the broker. Also returns the
// signed-in user's id (used to scope rows by entityId). Returns a reason (no
// token) when neither source has a valid token — the caller surfaces a sign-in
// prompt.
export async function resolveDataToken(context: ProjectContext): Promise<DataTokenResult> {
  const host = getHost();
  const broker = host.dataAuthBroker;
  const active = broker?.getActiveToken(context.databaseId);
  if (active) return { token: active.token, userId: active.userId };

  const preview = host.previewToken ? await host.previewToken() : null;
  if (!preview) return { reason: needsAuthReason() };
  if (broker?.isInvalidToken(context.databaseId, preview.accessToken)) {
    return { reason: needsAuthReason() };
  }

  const parsed = preview.accessTokenExpiresAt ? Date.parse(preview.accessTokenExpiresAt) : NaN;
  const expiresAt = Number.isNaN(parsed) ? Date.now() + 60 * 60 * 1000 : parsed;
  const skewMs = host.dataTokenSkewMs ?? DEFAULT_DATA_TOKEN_SKEW_MS;
  if (expiresAt <= Date.now() + skewMs) return { reason: needsAuthReason() };

  broker?.adoptToken(context.databaseId, {
    userId: preview.userId,
    token: preview.accessToken,
    expiresAt,
    origin: 'harvest',
  });
  return { token: preview.accessToken, userId: preview.userId };
}

// Per-DB endpoints are deterministic on the provisioning subdomain (= DATABASE_NAME):
// each plane swaps the first host label of its control-plane endpoint
// (e.g. api.localhost -> api-myapp.localhost, auth.localhost -> auth-myapp.localhost).
export function deriveSubdomainEndpoint(baseEndpoint: string, firstLabel: string): string {
  try {
    const url = new URL(baseEndpoint);
    const labels = url.hostname.split('.');
    labels[0] = firstLabel;
    url.hostname = labels.join('.');
    return url.toString();
  } catch {
    return '';
  }
}

// The backend hierarchy is org -> db -> tables; the owning org is the auth-plane
// user the database's ownerId points at. Best-effort display lookup only —
// binding health never depends on it. Authenticates with the account bearer
// against the app-configured auth endpoint (the platform rejects per-database
// keys, and the bearer never goes to a .env-pinned endpoint).
export async function resolveOrgName(ownerId: string): Promise<string | undefined> {
  try {
    const host = getHost();
    const account = host.account();
    const bearer = account?.apiKey ?? account?.accessToken;
    if (!bearer) return undefined;
    const backend = host.backendConfig();
    const authEndpoint = deriveSubdomainEndpoint(
      backend?.apiEndpoint || DEFAULT_API_ENDPOINT,
      'auth',
    );
    if (!authEndpoint) return undefined;
    const client = auth.createClient({
      endpoint: authEndpoint,
      headers: { Authorization: `Bearer ${bearer}` },
    });
    const result = await client.user
      .findMany({
        select: { displayName: true, username: true },
        where: { id: { equalTo: ownerId } },
      })
      .execute();
    if (!result.ok) return undefined;
    const node = (result.data.users?.nodes ?? [])[0];
    return node?.displayName || node?.username || undefined;
  } catch {
    return undefined;
  }
}

// `name` is the logical schema name, identical on every backend; the physical
// (possibly hashed) name is `schemaName`.
async function resolveSchemaId(
  apiClient: ApiClient,
  databaseId: string,
): Promise<{ id: string } | { reason: string }> {
  const result = await apiClient.schema
    .findMany({
      select: { id: true, name: true },
      where: { databaseId: { equalTo: databaseId }, name: { equalTo: 'app_public' } },
    })
    .execute();

  if (!result.ok) {
    const detail = result.errors?.[0]?.message ?? 'unknown error';
    return { reason: `Could not query the app_public schema for database ${databaseId}: ${detail}` };
  }

  const appPublic = (result.data.schemas?.nodes ?? []).find((s) => s?.name === 'app_public');
  if (!appPublic?.id) {
    return {
      reason: `Database ${databaseId} has no app_public schema. The database may not be fully provisioned yet.`,
    };
  }
  return { id: appPublic.id };
}
