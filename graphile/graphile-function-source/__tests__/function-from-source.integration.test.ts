import type { GraphQLResponse } from 'graphile-test';
import { getConnections, seed } from 'graphile-test';
import { join } from 'path';

import { FunctionFromSourcePreset } from '../src';

jest.setTimeout(120000);

const workspaceRoot = join(__dirname, '../../..');
const TENANT_A = '00000000-0000-4000-8000-00000000000a';
const TENANT_B = '00000000-0000-4000-8000-00000000000b';
const SCHEMA_A = '00000000-0000-4000-8000-0000000000aa';

const SOURCE = `
CREATE FUNCTION visible_total(min_amount numeric)
  RETURNS numeric
  LANGUAGE plpgsql STABLE
  AS $$
BEGIN
  RETURN coalesce((SELECT sum(o.amount) FROM app_public.orders o WHERE o.amount >= min_amount), 0);
END;
$$;`;

const CREATE = `
  mutation ($input: CreateFunctionFromSourceInput!) {
    createFunctionFromSource(input: $input) {
      clientMutationId
      function { id databaseId schemaId name kind volatility returns arguments apiExposed }
    }
  }
`;

type QueryFn = <T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  commit?: boolean,
  reqOptions?: Record<string, unknown>
) => Promise<GraphQLResponse<T>>;

const asTenant = (databaseId: string) => ({
  pgSettings: { role: 'authenticated', 'jwt.claims.database_id': databaseId }
});

describe('createFunctionFromSource', () => {
  let pg: any;
  let db: any;
  let query: QueryFn;
  let teardown: () => Promise<void>;

  beforeAll(async () => {
    const connections = await (getConnections as any)(
      {
        schemas: ['metaschema_public'],
        preset: { extends: [FunctionFromSourcePreset] },
        useRoot: true,
        authRole: 'authenticated'
      },
      [seed.pgpm(workspaceRoot), seed.sqlfile([join(__dirname, '../sql/function-from-source-seed.sql')])]
    );
    ({ pg, db, query, teardown } = connections);
  });

  afterAll(async () => {
    await teardown();
  });

  beforeEach(async () => {
    await pg.beforeEach();
    await db.beforeEach();
  });

  afterEach(async () => {
    await db.afterEach();
    await pg.afterEach();
  });

  const create = (databaseId: string, source: string, claimsFor = databaseId) =>
    query<any>(
      CREATE,
      { input: { clientMutationId: 'm1', databaseId, schemaId: SCHEMA_A, source, apiExposed: true } },
      false,
      asTenant(claimsFor)
    );

  it('inserts the parsed definition under the caller\'s claims', async () => {
    const result = await create(TENANT_A, SOURCE);
    expect(result.errors).toBeUndefined();
    const { clientMutationId, function: fn } = result.data.createFunctionFromSource;
    expect(clientMutationId).toBe('m1');
    expect(fn).toMatchObject({
      databaseId: TENANT_A,
      schemaId: SCHEMA_A,
      name: 'visible_total',
      kind: 'plpgsql',
      volatility: 'STABLE',
      returns: { type: { name: 'numeric' } },
      arguments: [{ name: 'min_amount', type: { name: 'numeric' } }],
      apiExposed: true
    });

    const {
      rows: [row]
    } = await pg.query('SELECT body_ast, security_invoker FROM metaschema_public.function WHERE database_id = $1 AND name = $2',
      [TENANT_A, 'visible_total']);
    expect(row.security_invoker).toBe(true);
    expect(row.body_ast.PLpgSQL_function.datums.map((d: any) => d.PLpgSQL_var.refname)).toEqual([
      'min_amount',
      'found'
    ]);
  });

  it('is refused by RLS when the caller writes into another database', async () => {
    const result = await create(TENANT_A, SOURCE, TENANT_B);
    expect(result.data?.createFunctionFromSource ?? null).toBeNull();
    expect(result.errors?.[0].message).toMatch(/row-level security policy/);
  });

  it('returns a parse error with the parser position and inserts nothing', async () => {
    const source = 'CREATE FUNCTION f() RETURNS int LANGUAGE sql AS $$ SELEC 1 $$';
    const result = await create(TENANT_A, source);
    expect(result.errors?.[0]).toMatchObject({
      message: 'syntax error at or near "SELEC"',
      extensions: { code: 'FUNCTION_SOURCE_PARSE_ERROR', position: source.indexOf('SELEC') }
    });
    const { rows } = await pg.query('SELECT count(*)::int AS n FROM metaschema_public.function');
    expect(rows[0].n).toBe(0);
  });
});
