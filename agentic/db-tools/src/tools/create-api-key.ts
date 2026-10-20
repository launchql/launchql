import type { HarnessTool } from '@agentic-kit/harness';
import { auth } from '@constructive-io/sdk';
import { z } from 'zod';

import { deriveSubdomainEndpoint, resolveDataToken, resolveProjectContext } from '../context';
import {
  classifyBackendErrors,
  errorsText,
  type GraphQLError,
  postGraphQL,
  statusAdapter,
} from '../graphql-http';
import { getHost } from '../host';

const CreateApiKeyZod = z.object({
  key_name: z
    .string()
    .describe(
      'Name for the API key (e.g. "deploy bot"). The .env variable name derives from it (UPPER_SNAKE + _API_KEY).',
    ),
  principal_name: z
    .string()
    .describe(
      'Machine identity (principal) that owns the key. Defaults to key_name. An existing principal with this name is reused for unscoped keys.',
    )
    .optional(),
  entity_ids: z
    .array(z.string())
    .describe(
      'Entity row UUIDs to scope the principal to. Omit for a personal (unscoped) key that acts as the signed-in app user.',
    )
    .optional(),
  read_only: z
    .boolean()
    .describe('Restrict the principal and key to read-only operations.')
    .optional(),
  expires_in_days: z
    .number()
    .int()
    .positive()
    .describe('Key lifetime in days. Default 90.')
    .optional(),
});

export type CreateApiKeyDetails = {
  success: boolean;
  message: string;
  keyId?: string;
  envVar?: string;
  expiresAt?: string;
  principalId?: string;
  principalName?: string;
  scope?: string;
  needsAuth?: boolean;
  /** The app API answered ACCESS_SUSPENDED: the database is deleted or suspended. */
  code?: 'database-unavailable';
};

type ToolResult = { content: { type: 'text'; text: string }[]; details: CreateApiKeyDetails };

function fail(message: string, extra?: Partial<CreateApiKeyDetails>): ToolResult {
  return {
    content: [{ type: 'text', text: message }],
    details: { success: false, message, ...extra },
  };
}

export function toEnvVar(keyName: string): string {
  const base = keyName
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return base.endsWith('_API_KEY') ? base : `${base}_API_KEY`;
}

export function isStepUpError(messages: string[]): boolean {
  return messages.some((m) => /step[\s_-]?up/i.test(m));
}

export function describeScope(entityIds: string[] | undefined, readOnly: boolean): string {
  const parts: string[] = [];
  parts.push(
    entityIds?.length
      ? `scoped to ${entityIds.length} entit${entityIds.length === 1 ? 'y' : 'ies'}`
      : 'unscoped (acts as the signed-in app user)',
  );
  if (readOnly) parts.push('read-only');
  return parts.join(', ');
}

// The plain fetch, read at call time. postGraphQL keeps a 403's body, so a
// deleted or suspended database's ACCESS_SUSPENDED reaches the caller.
async function rawGraphql(
  endpoint: string,
  token: string | undefined,
  query: string,
  variables?: Record<string, unknown>,
): Promise<{ data?: Record<string, unknown>; errors?: GraphQLError[] }> {
  const result = await postGraphQL<Record<string, unknown>>({
    endpoint,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    query,
    variables,
    fetchFn: (input, init) => fetch(input, init),
  });
  return { data: result.data ?? undefined, errors: result.errors.length > 0 ? result.errors : undefined };
}

const UNAVAILABLE_MESSAGE =
  'The app database is unavailable: the backend answered ACCESS_SUSPENDED, so it was deleted or is suspended. No key was minted.';

const isSuspended = (errors: readonly GraphQLError[] | undefined) =>
  Boolean(errors?.length) && classifyBackendErrors(errors) === 'suspended';

const unavailable = (): ToolResult => fail(UNAVAILABLE_MESSAGE, { code: 'database-unavailable' });

async function createPrincipalInputFields(endpoint: string): Promise<Set<string> | 'unavailable'> {
  const probe = await rawGraphql(
    endpoint,
    undefined,
    '{ __type(name: "CreatePrincipalInput") { inputFields { name } } }',
  );
  if (isSuspended(probe.errors)) return 'unavailable';
  const type = probe.data?.__type as { inputFields?: { name: string }[] } | null | undefined;
  return new Set((type?.inputFields ?? []).map((f) => f.name));
}

type Params = z.infer<typeof CreateApiKeyZod>;

export const createApiKeyTool: HarnessTool<typeof CreateApiKeyZod, CreateApiKeyDetails> = {
  name: 'create_api_key',
  label: 'Create API key',
  description:
    'Mint an API key for the project database, owned by a machine principal. Optionally scope it to specific entity rows and/or read-only. The human confirms the mint, completes MFA step-up in the app when required, and receives the key via .env + a one-time reveal — the plaintext key never appears in this conversation. Requires the user to be signed in to their app in the Preview.',
  promptSnippet:
    'create_api_key: mint an entity-scoped API key for the project database. Gated; the plaintext goes to .env + a one-time reveal, never into the chat — reference it as its env var.',
  parameters: CreateApiKeyZod,
  async execute(params: Params, ctx) {
    const keyName = params.key_name?.trim();
    if (!keyName) return fail('create_api_key requires "key_name".');

    const resolved = await resolveProjectContext(ctx.cwd, { plane: 'data' });
    if (!resolved.context) return fail(resolved.reason);
    const { databaseId, databaseName, apiEndpoint } = resolved.context;

    if (!databaseName) {
      return fail(
        'Cannot resolve the app auth endpoint (DATABASE_NAME missing from .env). Re-provision the database, then retry.',
      );
    }

    const host = getHost();
    if (!host.deliverSecret) {
      return fail(
        'This host cannot deliver secrets (no .env write + reveal flow), so no key was minted. Create the key from a host that supports secret delivery.',
      );
    }

    const token = await resolveDataToken(resolved.context);
    if (!token.token) {
      return fail(token.reason ?? 'Sign in to the app database to create an API key.', {
        needsAuth: true,
      });
    }

    const authEndpoint = deriveSubdomainEndpoint(apiEndpoint, `auth-${databaseName}`);
    if (!authEndpoint) return fail('Cannot derive the app auth endpoint.');

    const scoped = Boolean(params.entity_ids?.length) || params.read_only === true;
    try {
      if (scoped) {
        const fields = await createPrincipalInputFields(authEndpoint);
        if (fields === 'unavailable') return unavailable();
        const missing = [
          ...(params.entity_ids?.length && !fields.has('entityIds') ? ['entityIds'] : []),
          ...(params.read_only === true && !fields.has('isReadOnly') ? ['isReadOnly'] : []),
        ];
        if (missing.length) {
          return fail(
            `This deployment does not support scoping a principal at create time (no ${missing.join(', ')} on createPrincipal). No key was minted. If an unscoped key that acts as the signed-in user is acceptable, ask for one explicitly.`,
          );
        }
      }

      const dbAuth = auth.createClient({
        adapter: statusAdapter(authEndpoint, { Authorization: `Bearer ${token.token}` }),
      });

      const principalName = params.principal_name?.trim() || keyName;
      const existing = await dbAuth.principal
        .findFirst({
          where: { name: { equalTo: principalName } },
          select: { id: true, name: true, userId: true, isReadOnly: true },
        })
        .unwrap();

      // createApiKey (like createPrincipal.result) takes the principal's
      // identity userId; principal_entity.principalId references the row id.
      let principalId = existing.principal?.userId;
      if (existing.principal && scoped) {
        return fail(
          `Principal "${principalName}" already exists, and its scope cannot be verified against the requested one. No key was minted. Use a new principal_name for a scoped key, or mint an unscoped key on the existing principal explicitly.`,
        );
      }
      if (existing.principal) {
        const scopeRow = await dbAuth.principalEntity
          .findFirst({
            where: { principalId: { equalTo: existing.principal.id } },
            select: { id: true },
          })
          .unwrap();
        if (scopeRow.principalEntity || existing.principal?.isReadOnly) {
          return fail(
            `Principal "${principalName}" already exists with a narrower scope (entity-scoped or read-only), so a key minted under it would not act as the signed-in user. No key was minted. Use a new principal_name for an unscoped key.`,
          );
        }
      }
      if (!principalId) {
        // The SDK's PrincipalModel.create sends a nested {principal} input, but
        // the live CreatePrincipalInput is flat and its payload only exposes
        // `result: UUID` — raw GraphQL is the only working surface.
        const created = await rawGraphql(
          authEndpoint,
          token.token,
          'mutation ($input: CreatePrincipalInput!) { createPrincipal(input: $input) { result } }',
          {
            input: {
              name: principalName,
              ...(params.entity_ids?.length && { entityIds: params.entity_ids }),
              ...(params.read_only !== undefined && { isReadOnly: params.read_only }),
            },
          },
        );
        if (isSuspended(created.errors)) return unavailable();
        if (created.errors?.length) {
          return fail(`createPrincipal failed: ${errorsText(created.errors)}`);
        }
        const payload = created.data?.createPrincipal as { result?: string } | undefined;
        principalId = payload?.result;
        if (!principalId) return fail('createPrincipal returned no principal id.');
      }

      const mint = () =>
        dbAuth.mutation
          .createApiKey(
            {
              input: {
                principalId: principalId!,
                keyName,
                ...(params.read_only && { accessLevel: 'read_only' }),
                expiresIn: { days: params.expires_in_days ?? 90 },
              },
            },
            { select: { result: { select: { apiKey: true, keyId: true, expiresAt: true } } } },
          )
          .execute();

      let minted = await mint();
      if (!minted.ok && isStepUpError(minted.errors.map((e) => e.message))) {
        if (!host.requestStepUp) {
          return fail(
            'Creating this key requires MFA step-up, and this host has no step-up flow. Complete step-up in the app (verify your password), then retry.',
          );
        }
        const verified = await host.requestStepUp({ databaseId, databaseName, apiEndpoint });
        if (!verified) return fail('Step-up verification was not completed. No key was minted.');
        minted = await mint();
      }
      if (!minted.ok) {
        if (isSuspended(minted.errors)) return unavailable();
        return fail(`createApiKey failed: ${errorsText(minted.errors)}`);
      }

      const record = minted.data?.createApiKey?.result;
      if (!record?.apiKey || !record.keyId) return fail('createApiKey returned no key.');

      const envVar = toEnvVar(keyName);
      await host.deliverSecret({
        databaseId,
        cwd: ctx.cwd,
        envVar,
        plaintext: record.apiKey,
        keyId: record.keyId,
        expiresAt: record.expiresAt ?? undefined,
      });

      const scope = describeScope(params.entity_ids, params.read_only === true);
      const message = `Created API key "${keyName}" (keyId: ${record.keyId}) for principal "${principalName}" — ${scope}. The key was written to .env as ${envVar} and revealed once to the user; it is not in this conversation. Reference it as ${envVar}.${record.expiresAt ? ` Expires ${record.expiresAt}.` : ''}`;
      return {
        content: [{ type: 'text', text: message }],
        details: {
          success: true,
          message,
          keyId: record.keyId,
          envVar,
          expiresAt: record.expiresAt ?? undefined,
          principalId,
          principalName,
          scope,
        },
      };
    } catch (err) {
      // The SDK's unwrap() throws its errors as `errors`.
      if (isSuspended((err as { errors?: GraphQLError[] } | null)?.errors)) return unavailable();
      return fail(err instanceof Error ? err.message : 'Failed to create the API key.');
    }
  },
};
