import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

jest.mock('../src/db-probe', () => ({ probeDatabase: jest.fn() }));
jest.mock('@constructive-io/sdk', () => ({
  api: { createClient: jest.fn() },
  auth: { createClient: jest.fn() },
  modules: { createClient: jest.fn(() => ({ kind: 'modules' })) },
}));

import { api } from '@constructive-io/sdk';

import {
  CONTEXT_ENV_PREFIX,
  fromEnvFile,
  fromEnvironment,
  resolveProjectContext,
} from '../src/context';
import { probeDatabase } from '../src/db-probe';
import { configureHost } from '../src/host';

const mockProbe = probeDatabase as jest.MockedFunction<typeof probeDatabase>;
const mockCreateClient = api.createClient as jest.Mock;

const schemaClient = {
  schema: {
    findMany: () => ({
      execute: async () => ({
        ok: true,
        data: { schemas: { nodes: [{ id: 'schema-1', name: 'app_public' }] } },
      }),
    }),
  },
};

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(path.join(os.tmpdir(), 'pi-context-'));
  mockProbe.mockResolvedValue({ status: 'found', databaseId: 'db-1', name: 'myapp', ownerId: 'u1', hash: 'h1' });
  mockCreateClient.mockReturnValue(schemaClient);
  configureHost({
    account: () => ({ userId: 'u1', accessToken: 'account-bearer' }),
    backendConfig: () => ({
      apiEndpoint: 'http://api.localhost:3000/graphql',
      modulesEndpoint: 'http://modules.localhost:3000/graphql',
    }),
  });
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
  jest.clearAllMocks();
});

describe('resolveProjectContext sources', () => {
  it('resolves from injected environment variables, no file needed', async () => {
    const resolved = await resolveProjectContext(
      fromEnvironment({
        [`${CONTEXT_ENV_PREFIX}ACCESS_TOKEN`]: 'project-key',
        [`${CONTEXT_ENV_PREFIX}DATABASE_ID`]: 'db-1',
        [`${CONTEXT_ENV_PREFIX}DATABASE_NAME`]: 'myapp',
      }),
    );

    expect(resolved.context).toMatchObject({
      accessToken: 'project-key',
      databaseId: 'db-1',
      databaseName: 'myapp',
      schemaId: 'schema-1',
      dataEndpoint: 'http://api-myapp.localhost:3000/graphql',
    });
  });

  it('resolves from a project .env when given a cwd (unchanged host behavior)', async () => {
    writeFileSync(path.join(dir, '.env'), 'ACCESS_TOKEN=file-key\nDATABASE_ID=db-file\n');

    const resolved = await resolveProjectContext(dir);

    expect(resolved.context).toMatchObject({ accessToken: 'file-key', databaseId: 'db-file' });
  });

  it('prefers the prefixed name over the bare one', async () => {
    const resolved = await resolveProjectContext({
      ACCESS_TOKEN: 'bare',
      [`${CONTEXT_ENV_PREFIX}ACCESS_TOKEN`]: 'prefixed',
      DATABASE_ID: 'db-1',
    });

    expect(resolved.context?.accessToken).toBe('prefixed');
  });

  it('accepts a lookup function as the source', async () => {
    const values: Record<string, string> = {
      [`${CONTEXT_ENV_PREFIX}ACCESS_TOKEN`]: 'from-fn',
      [`${CONTEXT_ENV_PREFIX}DATABASE_ID`]: 'db-1',
    };

    const resolved = await resolveProjectContext((name) => values[name]);

    expect(resolved.context?.accessToken).toBe('from-fn');
  });

  it('pins the data-plane endpoints from the source, never the control plane', async () => {
    const resolved = await resolveProjectContext({
      [`${CONTEXT_ENV_PREFIX}ACCESS_TOKEN`]: 'project-key',
      [`${CONTEXT_ENV_PREFIX}DATABASE_ID`]: 'db-1',
      [`${CONTEXT_ENV_PREFIX}API_ENDPOINT`]: 'http://api.evil.test/graphql',
    });

    expect(resolved.context?.apiEndpoint).toBe('http://api.evil.test/graphql');
    // control-plane clients + probe stay on the host-configured backend
    expect(mockCreateClient).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: 'http://api.localhost:3000/graphql' }),
    );
    expect(mockProbe).toHaveBeenCalledWith(
      expect.objectContaining({ endpoint: 'http://api.localhost:3000/graphql' }),
    );
  });

  it('reports no-env when a cwd has no .env', async () => {
    const resolved = await resolveProjectContext(dir);

    expect(resolved.context).toBeNull();
    expect(resolved.code).toBe('no-env');
  });

  it('reports missing-credentials when the source carries no credentials', async () => {
    const resolved = await resolveProjectContext(fromEnvironment({ PATH: '/usr/bin' }));

    expect(resolved.context).toBeNull();
    expect(resolved.code).toBe('missing-credentials');
  });
});

describe('resolveProjectContext binding health', () => {
  const source = fromEnvironment({
    [`${CONTEXT_ENV_PREFIX}ACCESS_TOKEN`]: 'project-key',
    [`${CONTEXT_ENV_PREFIX}DATABASE_ID`]: 'db-1',
  });

  it("carries the database's hash from the probe", async () => {
    const resolved = await resolveProjectContext(source);

    expect(resolved.context?.hash).toBe('h1');
  });

  it('reports a suspended database as db-suspended, never as missing', async () => {
    mockProbe.mockResolvedValue({
      status: 'suspended',
      databaseId: 'db-1',
      ownerId: 'u1',
      suspendedAt: '2026-10-01T00:00:00Z',
    });

    const resolved = await resolveProjectContext(source);

    expect(resolved).toMatchObject({ context: null, code: 'db-suspended' });
    expect(resolved.reason).not.toMatch(/reprovision/i);
  });

  it('reports an unknown backend error as unreachable with its cause', async () => {
    mockProbe.mockResolvedValue({ status: 'unreachable', databaseId: 'db-1', cause: 'error', detail: 'boom' });

    const resolved = await resolveProjectContext(source);

    expect(resolved).toMatchObject({ context: null, code: 'backend-unreachable', cause: 'error' });
    expect(resolved.reason).toMatch(/answered with an error/);
  });

  it("gives the host's reprovision advice for a missing database instead of the tool's", async () => {
    configureHost({
      account: () => ({ userId: 'u1', accessToken: 'account-bearer' }),
      backendConfig: () => null,
      reprovisionHint: 'Approve the rebuild card to re-provision.',
      toolReprovision: false,
    });
    mockProbe.mockResolvedValue({ status: 'missing', databaseId: 'db-1' });

    const resolved = await resolveProjectContext(source);

    expect(resolved.code).toBe('db-missing');
    expect(resolved.reason).toMatch(/Approve the rebuild card/);
    expect(resolved.reason).not.toMatch(/reprovision: true/);
  });
});

describe('resolveProjectContext schema resolution', () => {
  const source = fromEnvironment({
    [`${CONTEXT_ENV_PREFIX}ACCESS_TOKEN`]: 'project-key',
    [`${CONTEXT_ENV_PREFIX}DATABASE_ID`]: 'db-1',
    [`${CONTEXT_ENV_PREFIX}DATABASE_NAME`]: 'myapp',
  });
  const clientReturning = (result: unknown) => {
    const findMany = jest.fn(() => ({ execute: async () => result }));
    mockCreateClient.mockReturnValue({ schema: { findMany } });
    return findMany;
  };

  it('queries the logical app_public schema, whatever its physical (hashed) name', async () => {
    const findMany = clientReturning({
      ok: true,
      data: {
        schemas: {
          nodes: [{ id: 'schema-hashed', name: 'app_public', schemaName: 'myapp-1a2b3c4d-app-public' }],
        },
      },
    });

    const resolved = await resolveProjectContext(source);

    expect(resolved.context?.schemaId).toBe('schema-hashed');
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { databaseId: { equalTo: 'db-1' }, name: { equalTo: 'app_public' } },
      }),
    );
  });

  it('fails hard when the database has no app_public schema, never picking another', async () => {
    clientReturning({ ok: true, data: { schemas: { nodes: [] } } });

    const resolved = await resolveProjectContext(source);

    expect(resolved.context).toBeNull();
    expect(resolved.code).toBe('schema-unresolved');
    expect(resolved.reason).toMatch(/no app_public schema/);
  });

  it('fails hard with the GraphQL error when the schema query fails', async () => {
    clientReturning({ ok: false, data: null, errors: [{ message: 'permission denied' }] });

    const resolved = await resolveProjectContext(source);

    expect(resolved.context).toBeNull();
    expect(resolved.code).toBe('schema-unresolved');
    expect(resolved.reason).toMatch(/permission denied/);
  });
});

describe('fromEnvFile', () => {
  it('parses the project .env, quotes and comments included', async () => {
    writeFileSync(path.join(dir, '.env'), '# comment\nACCESS_TOKEN="quoted key"\nDATABASE_ID=db-1\n');

    expect(await fromEnvFile(dir)).toEqual({ ACCESS_TOKEN: 'quoted key', DATABASE_ID: 'db-1' });
  });

  it('returns null when the file is absent', async () => {
    expect(await fromEnvFile(dir)).toBeNull();
  });
});
