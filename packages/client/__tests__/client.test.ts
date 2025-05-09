import { PoolClient } from 'pg';
import { Database } from '../src';

let client: Database;

const databaseUrl = process.env.TEST_DATABASE_URL || 'postgres://postgres:password@localhost:5432/postgres';

beforeAll(() => {
  client = new Database(databaseUrl);
});

afterAll(async () => {
  await client.shutdown();
});

it('getClient', async () => {
  try {
    await client.withTransaction(async (client: PoolClient) => {
      const result = await client.query('SELECT 1');
      expect(result.rows[0]['?column?'] || result.rows[0].count).toBe(1);
    });
  } catch (e) {
    if (e instanceof AggregateError) {
      for (const err of e.errors) {
        console.error('AggregateError item:', err);
      }
    } else {
      console.error('Test failure:', e);
    }
    throw e;
  }
});