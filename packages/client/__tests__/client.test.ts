process.env.DATABASE_URL = 'postgres://postgres:password@localhost:5432/postgres';
import { PoolClient } from 'pg';

import { Database } from '../src';

const db = new Database();

afterAll(() => {
  db.shutdown();
});

it('getClient', (done) => {
  db.withTransaction(async (client: PoolClient) => {
    try {
      const result = await client.query('SELECT 1');
      expect(result.rows.length).toBe(1);
      done();
    } catch (error) {
      console.error('Error executing query:', error);
      done(error); 
    }
  });
});
