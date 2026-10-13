/**
 * Tests for the explicit bucket reconciliation enqueue mutation.
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
const JOB_ID = 'job-uuid-999';

interface MockOptions {
  scope: string;
  entityField: string | null;
  physicalName?: string | null;
  scopeKey?: string | null;
  orgResolver?: {
    entity_type: string;
    get_org_fn_schema: string;
    get_org_fn: string;
  } | null;
  bucketFound?: boolean;
}

function createMockPgClient({
  scope,
  entityField,
  physicalName = null,
  scopeKey = null,
  orgResolver = null,
  bucketFound = true,
}: MockOptions) {
  const query = jest.fn((arg: any) => {
    const sql: string = typeof arg === 'string' ? arg : arg.text;
    if (sql.includes('jwt_private.current_database_id')) {
      return Promise.resolve({ rows: [{ id: DATABASE_ID }] });
    }
    if (sql.includes('metaschema_modules_public.storage_module')) {
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
    if (sql.includes('metaschema.resolve_entity_context_by_field')) {
      return Promise.resolve({ rows: orgResolver ? [orgResolver] : [{
        entity_type: scope,
        get_org_fn_schema: null,
        get_org_fn: null,
      }] });
    }
    if (sql.includes('app_jobs.add_job')) {
      return Promise.resolve({ rows: [{ id: JOB_ID }] });
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

function enqueueCall(pgClient: any): { text: string; values: unknown[] } {
  const call = pgClient.query.mock.calls.find((args: any[]) =>
    args[0]?.text?.includes('app_jobs.add_job'));
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

  it('enqueues the global-scope reconciliation job without entity attribution', async () => {
    createBucketProvisionerPlugin();
    const pgClient = createMockPgClient({ scope: 'app', entityField: null });

    const result = await invoke(pgClient);
    const enqueue = enqueueCall(pgClient);

    expect(enqueue.text).toContain("identifier => 'storage:provision_bucket'");
    expect(enqueue.text).toContain("'id', $1::uuid");
    expect(enqueue.text).toContain("'scope', $2::text");
    expect(enqueue.text).toContain("queue_name => 'bucket:' || $1::text");
    expect(enqueue.text).toContain('max_attempts => 25');
    expect(enqueue.text).toContain('priority => 0');
    expect(enqueue.text).not.toContain('entity_id =>');
    expect(enqueue.text).not.toContain('organization_id =>');
    expect(enqueue.values).toEqual([BUCKET_ID, 'app']);
    expect(result).toEqual({
      bucketId: BUCKET_ID,
      bucketKey: 'public',
      physicalName: null,
      jobId: JOB_ID,
    });
  });

  it('enqueues the platform global-scope reconciliation job', async () => {
    createBucketProvisionerPlugin();
    const pgClient = createMockPgClient({
      scope: 'platform',
      entityField: null,
      physicalName: 'existing-physical-name',
    });

    const result = await invoke(pgClient);
    const enqueue = enqueueCall(pgClient);

    expect(enqueue.text).not.toContain('db_id =>');
    expect(enqueue.text).not.toContain('entity_type =>');
    expect(enqueue.values).toEqual([BUCKET_ID, 'platform']);
    expect(result.physicalName).toBe('existing-physical-name');
  });

  it('enqueues the exact database-scope reconciliation job', async () => {
    createBucketProvisionerPlugin();
    const pgClient = createMockPgClient({
      scope: 'database',
      entityField: 'database_id',
      scopeKey: DATABASE_ID,
    });

    const result = await invoke(pgClient);
    const enqueue = enqueueCall(pgClient);
    const bucketLookup = pgClient.query.mock.calls.find((args: any[]) =>
      args[0]?.text?.includes('FROM app_public.buckets'));

    expect(bucketLookup[0].text).toContain('database_id AS scope_key');
    expect(bucketLookup[0].values).toEqual(['public']);
    expect(enqueue.text).toContain("'database_id', $2::uuid");
    expect(enqueue.text).toContain("'id', $1::uuid");
    expect(enqueue.text).toContain("'scope', $3::text");
    expect(enqueue.text).toContain('db_id => $2');
    expect(enqueue.text).toContain('entity_id => $2');
    expect(enqueue.text).toContain('organization_id => NULL');
    expect(enqueue.text).toContain('entity_type => $3');
    expect(enqueue.values).toEqual([BUCKET_ID, DATABASE_ID, 'database']);
    expect(result.jobId).toBe(JOB_ID);
  });

  it('enqueues an entity-scope job with the resolved organization function', async () => {
    createBucketProvisionerPlugin();
    const pgClient = createMockPgClient({
      scope: 'org',
      entityField: 'owner_id',
      scopeKey: OWNER_ID,
      orgResolver: {
        entity_type: 'org',
        get_org_fn_schema: 'org_private',
        get_org_fn: 'get_organization_id',
      },
    });

    await invoke(pgClient, { bucketKey: 'public', ownerId: OWNER_ID });
    const enqueue = enqueueCall(pgClient);
    const bucketLookup = pgClient.query.mock.calls.find((args: any[]) =>
      args[0]?.text?.includes('FROM app_public.buckets'));
    const resolverLookup = pgClient.query.mock.calls.find((args: any[]) =>
      args[0]?.text?.includes('metaschema.resolve_entity_context_by_field'));

    expect(bucketLookup[0].text).toContain('owner_id AS scope_key');
    expect(bucketLookup[0].values).toEqual(['public', OWNER_ID]);
    expect(resolverLookup[0].values).toEqual([
      DATABASE_ID,
      BUCKETS_TABLE_ID,
      'owner_id',
    ]);
    expect(enqueue.text).toContain("'id', $1::uuid");
    expect(enqueue.text).toContain("'owner_id', $2::uuid");
    expect(enqueue.text).toContain("'scope', $3::text");
    expect(enqueue.text).toContain('entity_id => $2');
    expect(enqueue.text).toContain(
      'organization_id => org_private.get_organization_id($3::text, $2::uuid)',
    );
    expect(enqueue.text).toContain('entity_type => $3');
    expect(enqueue.values).toEqual([BUCKET_ID, OWNER_ID, 'org']);
  });

  it('enqueues an entity-scope job with NULL organization without a resolver', async () => {
    createBucketProvisionerPlugin();
    const pgClient = createMockPgClient({
      scope: 'user',
      entityField: 'owner_id',
      scopeKey: OWNER_ID,
    });

    await invoke(pgClient, { bucketKey: 'public', ownerId: OWNER_ID });
    const enqueue = enqueueCall(pgClient);
    const resolverLookup = pgClient.query.mock.calls.find((args: any[]) =>
      args[0]?.text?.includes('metaschema.resolve_entity_context_by_field'));

    expect(resolverLookup[0].values).toEqual([
      DATABASE_ID,
      BUCKETS_TABLE_ID,
      'owner_id',
    ]);
    expect(enqueue.text).toContain("'owner_id', $2::uuid");
    expect(enqueue.text).toContain('entity_id => $2');
    expect(enqueue.text).toContain('organization_id => NULL');
    expect(enqueue.text).toContain('entity_type => $3');
    expect(enqueue.values).toEqual([BUCKET_ID, OWNER_ID, 'user']);
  });

  it('propagates enqueue failures as GraphQL errors', async () => {
    createBucketProvisionerPlugin();
    const pgClient = createMockPgClient({
      scope: 'database',
      entityField: 'database_id',
      scopeKey: DATABASE_ID,
    });
    pgClient.query.mockImplementation((arg: any): Promise<any> => {
      const sql: string = typeof arg === 'string' ? arg : arg.text;
      if (sql.includes('app_jobs.add_job')) {
        return Promise.reject(new Error('enqueue failed'));
      }
      return createMockPgClient({
        scope: 'database',
        entityField: 'database_id',
        scopeKey: DATABASE_ID,
      }).query(arg);
    });

    await expect(invoke(pgClient)).rejects.toThrow('enqueue failed');
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
