jest.mock('pg-cache', () => ({
  getPgPool: jest.fn()
}));

jest.mock('@constructive-io/express-context', () => ({
  createDefaultRegistry: jest.fn(() => ({
    resolve: jest.fn().mockResolvedValue(undefined)
  }))
}));

import { svcCache } from '@pgpmjs/server-utils';
import type { Request } from 'express';
import type { Pool } from 'pg';
import { getPgPool } from 'pg-cache';

import type { ApiOptions } from '../../types';
import { getApiConfig, getSvcKey } from '../api';

const mockGetPgPool = getPgPool as jest.MockedFunction<typeof getPgPool>;

const createRequest = (headers: Record<string, string>): Request => {
  const normalized = new Map(
    Object.entries(headers).map(([key, value]) => [key.toLowerCase(), value])
  );

  return {
    protocol: 'http',
    originalUrl: '/graphql',
    get: jest.fn((name: string) => normalized.get(name.toLowerCase()))
  } as unknown as Request;
};

const createPrivateOptions = (): ApiOptions => ({
  pg: {
    database: 'constructive'
  },
  api: {
    isPublic: false,
    metaSchemas: ['metaschema_public']
  }
} as unknown as ApiOptions);

describe('api middleware routing priority', () => {
  beforeEach(() => {
    svcCache.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    svcCache.clear();
  });

  it('uses X-Api-Name before X-Schemata when building private service keys', () => {
    const req = createRequest({
      host: 'admin.localhost',
      'X-Database-Id': 'db-123',
      'X-Api-Name': 'customer-api',
      'X-Schemata': 'app_public'
    });

    expect(getSvcKey(createPrivateOptions(), req)).toBe('api:db-123:customer-api');
  });

  it('uses the same X-Api-Name priority when resolving and caching API config', async () => {
    const query = jest.fn(async (_sql: string, params: unknown[]) => {
      if (Array.isArray(params[0])) {
        return {
          rows: (params[0] as string[]).map((schemaName) => ({
            schema_name: schemaName
          }))
        };
      }

      if (params[0] === 'db-123' && params[1] === 'customer-api') {
        return {
          rows: [{
            api_id: 'api-123',
            database_id: 'db-123',
            dbname: 'tenant_db',
            role_name: 'api_role',
            anon_role: 'api_anon',
            is_public: false,
            schemas: ['api_public']
          }]
        };
      }

      return { rows: [] };
    });

    mockGetPgPool.mockReturnValue({ query } as unknown as Pool);

    const req = createRequest({
      host: 'admin.localhost',
      'X-Database-Id': 'db-123',
      'X-Api-Name': 'customer-api',
      'X-Schemata': 'app_public'
    });

    const result = await getApiConfig(createPrivateOptions(), req);

    expect(req.svc_key).toBe('api:db-123:customer-api');
    expect(result).toMatchObject({
      apiId: 'api-123',
      dbname: 'tenant_db',
      anonRole: 'api_anon',
      roleName: 'api_role',
      schema: ['api_public'],
      databaseId: 'db-123',
      isPublic: false
    });
    expect(svcCache.get('api:db-123:customer-api')).toBe(result);
    expect(query.mock.calls).toEqual(expect.arrayContaining([
      [expect.stringContaining('FROM "routing_public".apis'), ['db-123', 'customer-api']]
    ]));
  });
});

describe('missing served role on an X-Api-Name row', () => {
  beforeEach(() => {
    svcCache.clear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    svcCache.clear();
  });

  const poolWithApiRow = (row: Record<string, unknown>): void => {
    const query = jest.fn(async (_sql: string, params: unknown[]) => {
      if (Array.isArray(params[0])) {
        return { rows: (params[0] as string[]).map((schema_name) => ({ schema_name })) };
      }
      if (params[0] === 'db-123' && params[1] === 'customer-api') {
        return {
          rows: [{
            api_id: 'api-123',
            database_id: 'db-123',
            dbname: 'tenant_db',
            role_name: 'authenticated',
            anon_role: 'anonymous',
            is_public: false,
            schemas: ['api_public'],
            ...row
          }]
        };
      }
      return { rows: [] };
    });
    mockGetPgPool.mockReturnValue({ query } as unknown as Pool);
  };

  const request = () => createRequest({
    host: 'admin.localhost',
    'X-Database-Id': 'db-123',
    'X-Api-Name': 'customer-api'
  });

  it.each([
    ['role_name', null],
    ['role_name', ''],
    ['role_name', '   '],
    ['role_name', undefined],
    ['anon_role', null],
    ['anon_role', ''],
    ['anon_role', '   '],
    ['anon_role', undefined]
  ])('throws MISSING_API_ROLE when %s is %p instead of inventing a role, and caches nothing', async (column, value) => {
    poolWithApiRow({ [column]: value });

    await expect(getApiConfig(createPrivateOptions(), request())).rejects.toMatchObject({
      code: 'MISSING_API_ROLE',
      column,
      apiId: 'api-123',
      message: expect.stringContaining(column)
    });
    expect(svcCache.has('api:db-123:customer-api')).toBe(false);
  });

  it('passes the row roles through verbatim when both are present', async () => {
    poolWithApiRow({ role_name: 'administrator', anon_role: 'administrator' });

    const result = await getApiConfig(createPrivateOptions(), request());

    expect(result).toMatchObject({ roleName: 'administrator', anonRole: 'administrator' });
    expect(svcCache.get('api:db-123:customer-api')).toBe(result);
  });
});
