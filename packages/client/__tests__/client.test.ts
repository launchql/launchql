process.env.DATABASE_URL = 'postgres://postgres:password@localhost:5432/postgres';
import { PoolClient } from 'pg';
import { Database } from '../src';

let client: Database;

beforeAll(() => {
  client = new Database();
});

afterAll(async () => {
  await client.shutdown();
});

it('getClient', async () => {
  await client.withTransaction(async (client: PoolClient) => {
    const result = await client.query('SELECT 1');
    expect(result.rows[0]['?column?'] || result.rows[0].count).toBe(1);
  });
});
