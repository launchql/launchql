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

export const test =
  (schemas: string[], options: PostGraphileOptions, setup?: SetupFn) =>
  (): Promise<void> =>
    (async () => {
      const connections = await getConnections({}, [
        seed.sqlfile([sql('roles.sql'), sql('schema.sql')]),
      ]);

      const { pg, teardown } = connections;
      pg.setContext({ role: 'authenticated' });

      const pool = new Pool(pg.config);

      try {
        if (typeof setup === 'string') {
          await pg.query(setup);
        } else if (setup) {
          await setup(pg);
        }

        const schema = await createPostGraphileSchema(pool, schemas, options);
        expect(printSchemaOrdered(schema)).toMatchSnapshot();
      } finally {
        await pool.end();
        await teardown();
      }
    })();
