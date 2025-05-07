process.env.DATABASE_URL = 'postgres://postgres:password@localhost:5432/postgres';
import { PoolClient } from 'pg';

import { Database } from '../src';
let client: Database;

beforeAll(() => {
  client = new Database();
})

afterAll(() => {
  client.shutdown();
});

it('getClient', (done) => {
  client.withTransaction(async (client: PoolClient) => {
    try {
      const result = await client.query('SELECT 1');
      console.log(result.rows);
      done();
    } catch (error) {
      console.error('Error executing query:', error);
      done(error); 
    }
  });
});
