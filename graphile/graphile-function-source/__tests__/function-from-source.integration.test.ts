import type { GraphQLResponse } from 'graphile-test';
import { getConnections, seed } from 'graphile-test';
import { join } from 'path';

import { FunctionFromSourcePreset } from '../src';

jest.setTimeout(120000);

const workspaceRoot = join(__dirname, '../../..');
const TENANT_A = '00000000-0000-4000-8000-00000000000a';
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

const UPDATE = `
  mutation ($input: UpdateFunctionFromSourceInput!) {
    updateFunctionFromSource(input: $input) {
      clientMutationId
      function { databaseId schemaId name kind volatility returns arguments apiExposed }
    }
  }
`;

const REPLACEMENT = `
CREATE FUNCTION renamed_total(threshold integer)
  RETURNS integer
  LANGUAGE sql IMMUTABLE
  AS $$ SELECT threshold * 2 $$;`;

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
        authRole: 'postgres'
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

  const create = (source: string) =>
    query<any>(CREATE, {
      input: { clientMutationId: 'm1', databaseId: TENANT_A, schemaId: SCHEMA_A, source, apiExposed: true }
    });

  it('inserts the mapped columns, datums intact', async () => {
    const result = await create(SOURCE);
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

  it('returns a parse error with the parser position and inserts nothing', async () => {
    const source = 'CREATE FUNCTION f() RETURNS int LANGUAGE sql AS $$ SELEC 1 $$';
    const result = await create(source);
    expect(result.errors?.[0]).toMatchObject({
      message: 'syntax error at or near "SELEC"',
      extensions: { code: 'FUNCTION_SOURCE_PARSE_ERROR', position: source.indexOf('SELEC') }
    });
    const { rows } = await pg.query('SELECT count(*)::int AS n FROM metaschema_public.function');
    expect(rows[0].n).toBe(0);
  });

  describe('updateFunctionFromSource', () => {
    const rowOf = async (name: string) => {
      const { rows } = await pg.query(
        `SELECT id, database_id, schema_id, name, kind, volatility, arguments, returns, api_exposed, body_ast
           FROM metaschema_public.function WHERE database_id = $1 AND name = $2`,
        [TENANT_A, name]
      );
      return rows[0];
    };

    const update = (id: string, source: string) =>
      query<any>(UPDATE, { input: { clientMutationId: 'u1', id, source } });

    let id: string;
    beforeEach(async () => {
      expect((await create(SOURCE)).errors).toBeUndefined();
      ({ id } = await rowOf('visible_total'));
    });

    it('writes only the definition columns, keeping database, schema and exposure', async () => {
      const result = await update(id, REPLACEMENT);
      expect(result.errors).toBeUndefined();
      expect(result.data.updateFunctionFromSource).toMatchObject({
        clientMutationId: 'u1',
        function: {
          databaseId: TENANT_A,
          schemaId: SCHEMA_A,
          name: 'renamed_total',
          kind: 'sql',
          volatility: 'IMMUTABLE',
          returns: { type: { name: 'int4' } },
          arguments: [{ name: 'threshold', type: { name: 'int4' } }],
          apiExposed: true
        }
      });
      const row = await rowOf('renamed_total');
      expect(row.id).toBe(id);
      expect(row.body_ast.stmts).toHaveLength(1);
      expect(await rowOf('visible_total')).toBeUndefined();
    });

    it('refuses OR REPLACE, the same text format as create, and changes nothing', async () => {
      const before = await rowOf('visible_total');
      const result = await update(id, REPLACEMENT.replace('CREATE FUNCTION', 'CREATE OR REPLACE FUNCTION'));
      expect(result.errors?.[0]).toMatchObject({
        message: expect.stringContaining('updateFunctionFromSource with its id'),
        extensions: { code: 'FUNCTION_SOURCE_UNSUPPORTED' }
      });
      expect(await rowOf('visible_total')).toEqual(before);
    });

    it('returns a parse error and changes nothing', async () => {
      const before = await rowOf('visible_total');
      const source = 'CREATE FUNCTION visible_total() RETURNS int LANGUAGE sql AS $$ SELEC 1 $$';
      const result = await update(id, source);
      expect(result.errors?.[0]).toMatchObject({
        message: 'syntax error at or near "SELEC"',
        extensions: { code: 'FUNCTION_SOURCE_PARSE_ERROR', position: source.indexOf('SELEC') }
      });
      expect(await rowOf('visible_total')).toEqual(before);
    });
  });
});
