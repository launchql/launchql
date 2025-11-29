import './env';

import { join } from 'path';
import { Pool } from 'pg';
import {
  createPostGraphileSchema,
  type PostGraphileOptions,
} from 'postgraphile';
import { getConnections, seed } from 'pgsql-test';
import type { PgTestClient } from 'pgsql-test/test-client';

import { printSchemaOrdered } from './printSchema';

const SCHEMA = process.env.SCHEMA ?? 'p';
const sql = (file: string) => join(__dirname, '../sql', file);

type SetupFn =
  | ((client: PgTestClient) => Promise<void> | void)
  | string
  | undefined;

type SchemaTestContext = {
  db: PgTestClient;
  pool: Pool;
  teardown: () => Promise<void>;
};

const getSchemaTestContext = (
  schemas: string[]
): (() => SchemaTestContext) => {
  const ctx: Partial<SchemaTestContext> = {};

  beforeAll(async () => {
    const connections = await getConnections(
      {
        schemas: schemas.length ? schemas : [SCHEMA],
        authRole: 'authenticated',
      },
      [seed.sqlfile([sql('roles.sql'), sql('schema.sql')])]
    );

    ctx.db = connections.pg;
    ctx.teardown = connections.teardown;
    ctx.pool = new Pool(connections.pg.config);
  });

  beforeEach(() => ctx.db?.beforeEach());
  beforeEach(() => ctx.db?.setContext({ role: 'authenticated' }));
  afterEach(() => ctx.db?.afterEach());
  afterAll(async () => {
    if (ctx.pool) {
      await ctx.pool.end();
    }
    if (ctx.teardown) {
      await ctx.teardown();
    }
  });

  return () => {
    if (!ctx.db || !ctx.pool || !ctx.teardown) {
      throw new Error('Schema test context not initialized');
    }

    return ctx as SchemaTestContext;
  };
};

export const setupSchemaTest =
  (schemas: string[], options: PostGraphileOptions, setup?: SetupFn) => {
    const getCtx = getSchemaTestContext(schemas);

    return async (): Promise<void> => {
      const { db, pool } = getCtx();

      if (typeof setup === 'string') {
        await db.query(setup);
      } else if (setup) {
        await setup(db);
      }

      const schema = await createPostGraphileSchema(pool, schemas, options);
      expect(printSchemaOrdered(schema)).toMatchSnapshot();
    };
  };
