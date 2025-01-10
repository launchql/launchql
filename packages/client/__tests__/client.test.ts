process.env.DATABASE_URL = 'postgres://postgres:password@localhost:5432/postgres';
import { PoolClient } from 'pg';

import { Database } from '../src';

const db = new Database();

afterAll(async () => {
  await db.shutdown();
});

it('getClient', async () => {
  await db.withTransaction(async (client: PoolClient) => {
    const result = await client.query('SELECT 1');
    expect(result.rows.length).toBe(1);
  });
});
