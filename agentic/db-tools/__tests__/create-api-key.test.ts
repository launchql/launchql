import type { HarnessToolContext } from '@agentic-kit/harness';

jest.mock('../src/context', () => ({
  resolveProjectContext: jest.fn(),
  resolveDataToken: jest.fn(),
  deriveSubdomainEndpoint: jest.fn(() => 'http://auth-demo.localhost:6464/graphql'),
}));
jest.mock('../src/host', () => ({ getHost: jest.fn() }));
jest.mock('@constructive-io/sdk', () => ({ auth: { createClient: jest.fn() } }));

import { auth } from '@constructive-io/sdk';

import { resolveDataToken, resolveProjectContext } from '../src/context';
import { getHost } from '../src/host';
import {
  createApiKeyTool,
  describeScope,
  isStepUpError,
  toEnvVar,
} from '../src/tools/create-api-key';

const mockResolve = resolveProjectContext as jest.MockedFunction<typeof resolveProjectContext>;
const mockToken = resolveDataToken as jest.MockedFunction<typeof resolveDataToken>;
const mockGetHost = getHost as jest.MockedFunction<typeof getHost>;
const mockCreateClient = auth.createClient as jest.Mock;

const PLAINTEXT = 'cnc_live_sk_super_secret_value';
const MINTED = {
  ok: true,
  data: { createApiKey: { result: { apiKey: PLAINTEXT, keyId: 'key-1', expiresAt: '2026-11-01' } } },
  errors: [] as { message: string }[],
};
const STEP_UP = {
  ok: false,
  data: undefined as unknown,
  errors: [{ message: 'STEP_UP_REQUIRED: verify your password' }],
};

function makeClient(
  mintResults: unknown[],
  existingPrincipal: unknown = null,
  existingScopeRow: unknown = null,
) {
  const createApiKey = jest.fn();
  for (const result of mintResults) {
    createApiKey.mockReturnValueOnce({ execute: async (): Promise<unknown> => result });
  }
  return {
    principal: {
      findFirst: jest.fn().mockReturnValue({
        unwrap: async (): Promise<unknown> => ({ principal: existingPrincipal }),
      }),
    },
    principalEntity: {
      findFirst: jest.fn().mockReturnValue({
        unwrap: async (): Promise<unknown> => ({ principalEntity: existingScopeRow }),
      }),
    },
    mutation: { createApiKey },
  };
}

function makeHost(overrides: Record<string, unknown> = {}) {
  return {
    account: (): null => null,
    backendConfig: (): null => null,
    deliverSecret: jest.fn(async (): Promise<void> => undefined),
    requestStepUp: jest.fn(async (): Promise<boolean> => true),
    ...overrides,
  };
}

function mockFetchWith(entityIdsSupported: boolean) {
  return jest.fn(async (_url: unknown, init: { body?: string } | undefined) => {
    const body = String(init?.body ?? '');
    const json = body.includes('__type')
      ? {
        data: {
          __type: {
            inputFields: [
              { name: 'name' },
              ...(entityIdsSupported ? [{ name: 'entityIds' }, { name: 'isReadOnly' }] : []),
            ],
          },
        },
      }
      : { data: { createPrincipal: { result: 'prin-1' } } };
    return { ok: true, status: 200, json: async () => json };
  });
}

const ctx: HarnessToolContext = { cwd: '/tmp/project' };

function run(params: Record<string, unknown>) {
  return createApiKeyTool.execute(params as never, ctx);
}

function useContext() {
  mockResolve.mockResolvedValue({
    context: {
      databaseId: 'db-1',
      databaseName: 'demo',
      apiEndpoint: 'http://api.localhost:6464/graphql',
    },
    reason: '',
  } as never);
}

const realFetch = global.fetch;

afterEach(() => {
  jest.clearAllMocks();
  global.fetch = realFetch;
});

describe('helpers', () => {
  it('derives the env var name', () => {
    expect(toEnvVar('deploy bot')).toBe('DEPLOY_BOT_API_KEY');
    expect(toEnvVar('  CI API key ')).toBe('CI_API_KEY');
  });

  it('detects step-up errors', () => {
    expect(isStepUpError(['STEP_UP_REQUIRED: verify'])).toBe(true);
    expect(isStepUpError(['Step-up required'])).toBe(true);
    expect(isStepUpError(['permission denied'])).toBe(false);
  });

  it('summarizes scope', () => {
    expect(describeScope(['a'], true)).toBe('scoped to 1 entity, read-only');
    expect(describeScope(undefined, false)).toMatch(/unscoped/);
  });
});

describe('create_api_key execute', () => {
  it('refuses before any client call when the host cannot deliver secrets', async () => {
    useContext();
    mockGetHost.mockReturnValue(makeHost({ deliverSecret: undefined }) as never);
    const result = await run({ key_name: 'deploy bot' });
    expect(result.details.success).toBe(false);
    expect(result.details.message).toMatch(/cannot deliver secrets/);
    expect(mockToken).not.toHaveBeenCalled();
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it('returns the needs-auth prompt without a data token', async () => {
    useContext();
    mockGetHost.mockReturnValue(makeHost() as never);
    mockToken.mockResolvedValue({ reason: 'Not signed in to the app database yet.' });
    const result = await run({ key_name: 'deploy bot' });
    expect(result.details).toMatchObject({ success: false, needsAuth: true });
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it('fails explicit when scoping is requested but the surface is absent', async () => {
    useContext();
    mockGetHost.mockReturnValue(makeHost() as never);
    mockToken.mockResolvedValue({ token: 'tok', userId: 'u1' });
    const fetchMock = mockFetchWith(false);
    global.fetch = fetchMock as never;
    const client = makeClient([MINTED]);
    mockCreateClient.mockReturnValue(client);

    const result = await run({ key_name: 'scoped key', entity_ids: ['e-1'] });
    expect(result.details.success).toBe(false);
    expect(result.details.message).toMatch(/does not support scoping/);
    expect(result.details.message).toMatch(/No key was minted/);
    expect(client.mutation.createApiKey).not.toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refuses to reuse an existing principal for a scoped key', async () => {
    useContext();
    mockGetHost.mockReturnValue(makeHost() as never);
    mockToken.mockResolvedValue({ token: 'tok' });
    global.fetch = mockFetchWith(true) as never;
    const client = makeClient([MINTED], { id: 'prin-row', name: 'bot', userId: 'prin-user' });
    mockCreateClient.mockReturnValue(client);

    const result = await run({ key_name: 'k', principal_name: 'bot', entity_ids: ['e-1'] });
    expect(result.details.success).toBe(false);
    expect(result.details.message).toMatch(/already exists/);
    expect(client.mutation.createApiKey).not.toHaveBeenCalled();
  });

  it('fails explicit for a read-only request when isReadOnly is absent', async () => {
    useContext();
    mockGetHost.mockReturnValue(makeHost() as never);
    mockToken.mockResolvedValue({ token: 'tok' });
    global.fetch = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: { __type: { inputFields: [{ name: 'name' }, { name: 'entityIds' }] } },
      }),
    })) as never;
    const client = makeClient([MINTED]);
    mockCreateClient.mockReturnValue(client);

    const result = await run({ key_name: 'ro key', read_only: true });
    expect(result.details.success).toBe(false);
    expect(result.details.message).toMatch(/isReadOnly/);
    expect(client.mutation.createApiKey).not.toHaveBeenCalled();
  });

  it('reuses an existing principal only after verifying it is unscoped', async () => {
    useContext();
    mockGetHost.mockReturnValue(makeHost() as never);
    mockToken.mockResolvedValue({ token: 'tok' });
    global.fetch = mockFetchWith(true) as never;
    const client = makeClient([MINTED], {
      id: 'prin-row',
      name: 'bot',
      userId: 'prin-user',
      isReadOnly: false,
    });
    mockCreateClient.mockReturnValue(client);

    const result = await run({ key_name: 'k', principal_name: 'bot' });
    expect(result.details.success).toBe(true);
    expect(result.details.principalId).toBe('prin-user');
    expect(client.principalEntity.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { principalId: { equalTo: 'prin-row' } } }),
    );
    expect(client.mutation.createApiKey.mock.calls[0][0].input.principalId).toBe('prin-user');
  });

  it('refuses to reuse an entity-scoped principal for an unscoped key', async () => {
    useContext();
    mockGetHost.mockReturnValue(makeHost() as never);
    mockToken.mockResolvedValue({ token: 'tok' });
    global.fetch = mockFetchWith(true) as never;
    const client = makeClient(
      [MINTED],
      { id: 'prin-row', name: 'bot', userId: 'prin-user', isReadOnly: false },
      { id: 'pe-1' },
    );
    mockCreateClient.mockReturnValue(client);

    const result = await run({ key_name: 'k', principal_name: 'bot' });
    expect(result.details.success).toBe(false);
    expect(result.details.message).toMatch(/narrower scope/);
    expect(client.mutation.createApiKey).not.toHaveBeenCalled();
  });

  it('refuses to reuse a read-only principal for an unscoped key', async () => {
    useContext();
    mockGetHost.mockReturnValue(makeHost() as never);
    mockToken.mockResolvedValue({ token: 'tok' });
    global.fetch = mockFetchWith(true) as never;
    const client = makeClient([MINTED], { id: 'prin-row', name: 'bot', userId: 'prin-user', isReadOnly: true });
    mockCreateClient.mockReturnValue(client);

    const result = await run({ key_name: 'k', principal_name: 'bot' });
    expect(result.details.success).toBe(false);
    expect(result.details.message).toMatch(/narrower scope/);
    expect(client.mutation.createApiKey).not.toHaveBeenCalled();
  });

  it('mints, delivers the secret out of band, and keeps it out of the result', async () => {
    useContext();
    const host = makeHost();
    mockGetHost.mockReturnValue(host as never);
    mockToken.mockResolvedValue({ token: 'tok', userId: 'u1' });
    const fetchMock = mockFetchWith(true);
    global.fetch = fetchMock as never;
    const client = makeClient([MINTED]);
    mockCreateClient.mockReturnValue(client);

    const result = await run({ key_name: 'deploy bot', expires_in_days: 30 });
    expect(result.details).toMatchObject({
      success: true,
      keyId: 'key-1',
      envVar: 'DEPLOY_BOT_API_KEY',
      expiresAt: '2026-11-01',
      principalId: 'prin-1',
      principalName: 'deploy bot',
    });
    expect(host.deliverSecret).toHaveBeenCalledWith({
      databaseId: 'db-1',
      cwd: '/tmp/project',
      envVar: 'DEPLOY_BOT_API_KEY',
      plaintext: PLAINTEXT,
      keyId: 'key-1',
      expiresAt: '2026-11-01',
    });
    expect(JSON.stringify(result)).not.toContain(PLAINTEXT);
    const mintInput = client.mutation.createApiKey.mock.calls[0][0].input;
    expect(mintInput).toMatchObject({ principalId: 'prin-1', keyName: 'deploy bot', expiresIn: { days: 30 } });
    expect(mintInput).not.toHaveProperty('accessLevel');
  });

  it('retries exactly once after a successful step-up', async () => {
    useContext();
    const host = makeHost();
    mockGetHost.mockReturnValue(host as never);
    mockToken.mockResolvedValue({ token: 'tok' });
    global.fetch = mockFetchWith(true) as never;
    const client = makeClient([STEP_UP, MINTED]);
    mockCreateClient.mockReturnValue(client);

    const result = await run({ key_name: 'deploy bot' });
    expect(result.details.success).toBe(true);
    expect(host.requestStepUp).toHaveBeenCalledTimes(1);
    expect(host.requestStepUp).toHaveBeenCalledWith({
      databaseId: 'db-1',
      databaseName: 'demo',
      apiEndpoint: 'http://api.localhost:6464/graphql',
    });
    expect(client.mutation.createApiKey).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(result)).not.toContain(PLAINTEXT);
  });

  it('instructs instead of retrying when the host lacks the step-up hook', async () => {
    useContext();
    mockGetHost.mockReturnValue(makeHost({ requestStepUp: undefined }) as never);
    mockToken.mockResolvedValue({ token: 'tok' });
    global.fetch = mockFetchWith(true) as never;
    const client = makeClient([STEP_UP]);
    mockCreateClient.mockReturnValue(client);

    const result = await run({ key_name: 'deploy bot' });
    expect(result.details.success).toBe(false);
    expect(result.details.message).toMatch(/step-up/i);
    expect(client.mutation.createApiKey).toHaveBeenCalledTimes(1);
  });

  it('fails without minting when the user declines step-up', async () => {
    useContext();
    const host = makeHost({ requestStepUp: jest.fn(async () => false) });
    mockGetHost.mockReturnValue(host as never);
    mockToken.mockResolvedValue({ token: 'tok' });
    global.fetch = mockFetchWith(true) as never;
    const client = makeClient([STEP_UP, MINTED]);
    mockCreateClient.mockReturnValue(client);

    const result = await run({ key_name: 'deploy bot' });
    expect(result.details.success).toBe(false);
    expect(result.details.message).toMatch(/not completed/);
    expect(client.mutation.createApiKey).toHaveBeenCalledTimes(1);
    expect(host.deliverSecret).not.toHaveBeenCalled();
  });

  it('keeps the plaintext out of failure results too', async () => {
    useContext();
    const host = makeHost({
      deliverSecret: jest.fn(async () => {
        throw new Error('env write failed');
      }),
    });
    mockGetHost.mockReturnValue(host as never);
    mockToken.mockResolvedValue({ token: 'tok' });
    global.fetch = mockFetchWith(true) as never;
    mockCreateClient.mockReturnValue(makeClient([MINTED]));

    const result = await run({ key_name: 'deploy bot' });
    expect(result.details.success).toBe(false);
    expect(JSON.stringify(result)).not.toContain(PLAINTEXT);
  });
});
