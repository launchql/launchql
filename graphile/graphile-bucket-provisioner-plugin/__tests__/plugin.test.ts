/**
 * Tests for the explicit bucket reconciliation request mutation.
 */

let capturedLambdaCallback: Function | null = null;

jest.mock('grafast', () => ({
  context: jest.fn(() => ({
    get: jest.fn((key: string) => `mock-${key}`),
  })),
  lambda: jest.fn((_combined: any, callback: any) => {
    capturedLambdaCallback = callback;
    return 'lambda-step';
  }),
  object: jest.fn((obj: any) => obj),
}));

const mockGetRaw = jest.fn(() => 'mock-input');
jest.mock('graphile-utils', () => ({
  extendSchema: jest.fn((factory: any) => {
    const schema = factory();
    if (schema.plans?.Mutation?.provisionBucket) {
      schema.plans.Mutation.provisionBucket(null, { getRaw: mockGetRaw });
    }
    return {
      name: 'ExtendSchemaPlugin',
      schema: { hooks: {} },
      _typeDefs: schema.typeDefs,
      _plans: schema.plans,
    };
  }),
  gql: jest.fn((strings: TemplateStringsArray) => strings.join('')),
}));

import { createBucketProvisionerPlugin } from '../src/plugin';

const DATABASE_ID = 'db-uuid-123';
const BUCKET_ID = 'bucket-uuid-789';
const BUCKETS_TABLE_ID = 'buckets-table-uuid';
const OWNER_ID = 'owner-uuid-222';
const REQUESTED_AT = '2026-10-16T21:00:00.000Z';

interface MockOptions {
  scope: string;
  entityField: string | null;
  physicalName?: string | null;
  scopeKey?: string | null;
  bucketFound?: boolean;
}

function createMockPgClient({
  scope,
  entityField,
  physicalName = null,
  scopeKey = null,
  bucketFound = true,
}: MockOptions) {
  const query = jest.fn((arg: any) => {
    const sql: string = typeof arg === 'string' ? arg : arg.text;
    if (sql.includes('jwt_private.current_database_id')) {
      return Promise.resolve({ rows: [{ id: DATABASE_ID }] });
    }
    if (sql.includes('function_resolution.storage_modules()')) {
      return Promise.resolve({
        rows: [{
          id: 'sm-uuid-456',
          database_id: DATABASE_ID,
          buckets_table_id: BUCKETS_TABLE_ID,
          scope,
          entity_field: entityField,
          entity_table_id: entityField === 'owner_id' ? 'entity-table-uuid' : null,
          buckets_schema: 'app_public',
          buckets_table: 'buckets',
          private_schema: 'app_private',
          allowed_origins: null,
          entity_schema: entityField === 'owner_id' ? 'app_public' : null,
          entity_table: entityField === 'owner_id' ? 'accounts' : null,
        }],
      });
    }
    if (sql.includes('FROM app_public.accounts')) {
      return Promise.resolve({ rows: [{ id: OWNER_ID }] });
    }
    if (sql.includes('FROM app_public.buckets')) {
      return Promise.resolve({
        rows: bucketFound
          ? [{
            id: BUCKET_ID,
            key: 'public',
            physical_name: physicalName,
            scope_key: scopeKey,
          }]
          : [],
      });
    }
    if (sql.includes('buckets_provision(')) {
      return Promise.resolve({
        rows: [{ id: BUCKET_ID, key: 'public', physical_name: physicalName, provision_requested_at: REQUESTED_AT }],
      });
    }
    throw new Error(`unexpected query: ${sql}`);
  });
  return { query };
}

async function invoke(pgClient: any, input: Record<string, string> = { bucketKey: 'public' }) {
  const withPgClient = jest.fn((_settings: any, callback: any) => callback(pgClient));
  return capturedLambdaCallback!({
    input,
    withPgClient,
    pgSettings: { role: 'admin' },
  });
}

function provisionCall(pgClient: any): { text: string; values: unknown[] } {
  const call = pgClient.query.mock.calls.find((args: any[]) =>
    args[0]?.text?.includes('buckets_provision('));
  expect(call).toBeDefined();
  return call[0];
}

describe('createBucketProvisionerPlugin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedLambdaCallback = null;
  });

  it('returns a mutation-only plugin', () => {
    const plugin = createBucketProvisionerPlugin();

    expect(plugin).toBeDefined();
    expect(plugin.name).toBe('ExtendSchemaPlugin');
    expect(plugin.schema).toBeDefined();
  });

  it.each([
    ['app', null, null],
    ['platform', null, null],
    ['database', 'database_id', DATABASE_ID],
    ['org', 'owner_id', OWNER_ID],
  ])('requests a %s-scope bucket through the generated provision function', async (scope, entityField, scopeKey) => {
    createBucketProvisionerPlugin();
    const pgClient = createMockPgClient({ scope, entityField, scopeKey });

    const payload = await invoke(pgClient, entityField === 'owner_id'
      ? { bucketKey: 'public', ownerId: OWNER_ID }
      : { bucketKey: 'public' });
    const provision = provisionCall(pgClient);

    expect(provision.text).toMatch(
      /^SELECT id, key, physical_name, provision_requested_at FROM "?app_private"?\."?buckets_provision"?\(\$1::uuid\)$/
    );
    expect(provision.values).toEqual([BUCKET_ID]);
    expect(payload).toEqual({
      bucketId: BUCKET_ID,
      bucketKey: 'public',
      physicalName: null,
      provisionRequestedAt: REQUESTED_AT,
    });
    expect(pgClient.query.mock.calls.some((args: any[]) =>
      args[0]?.text?.includes('app_jobs.add_job'))).toBe(false);
  });

  it('looks an owner-scoped bucket up by its owner before requesting reconciliation', async () => {
    createBucketProvisionerPlugin();
    const pgClient = createMockPgClient({ scope: 'org', entityField: 'owner_id', scopeKey: OWNER_ID });

    await invoke(pgClient, { bucketKey: 'public', ownerId: OWNER_ID });
    const bucketLookup = pgClient.query.mock.calls.find((args: any[]) =>
      args[0]?.text?.includes('FROM app_public.buckets'));

    expect(bucketLookup[0].text).toContain('owner_id AS scope_key');
    expect(bucketLookup[0].values).toEqual(['public', OWNER_ID]);
  });

  it('propagates provision failures as GraphQL errors', async () => {
    createBucketProvisionerPlugin();
    const pgClient = createMockPgClient({
      scope: 'database',
      entityField: 'database_id',
      scopeKey: DATABASE_ID,
    });
    pgClient.query.mockImplementation((arg: any): Promise<any> => {
      const sql: string = typeof arg === 'string' ? arg : arg.text;
      if (sql.includes('buckets_provision(')) {
        return Promise.reject(new Error('JOB_SUBJECT_NOT_FOUND'));
      }
      return createMockPgClient({
        scope: 'database',
        entityField: 'database_id',
        scopeKey: DATABASE_ID,
      }).query(arg);
    });

    await expect(invoke(pgClient)).rejects.toThrow('JOB_SUBJECT_NOT_FOUND');
  });

  it('throws for invalid and missing bucket inputs', async () => {
    createBucketProvisionerPlugin();

    await expect(invoke({ query: jest.fn() }, { bucketKey: '' }))
      .rejects.toThrow('INVALID_BUCKET_KEY');

    const pgClient = createMockPgClient({
      scope: 'app',
      entityField: null,
      bucketFound: false,
    });
    await expect(invoke(pgClient)).rejects.toThrow('BUCKET_NOT_FOUND');
  });
});
