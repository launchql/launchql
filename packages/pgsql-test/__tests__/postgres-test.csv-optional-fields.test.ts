process.env.LOG_SCOPE = 'pgsql-test';

import path from 'path';

import { seed } from '../src';
import { getConnections } from '../src/connect';
import { PgTestClient } from '../src/test-client';

const csv = (file: string) => path.resolve(__dirname, '../csv', file);

let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections({}, [
    seed.fn(async ({ pg }) => {
      await pg.query(`
        CREATE SCHEMA custom;
        CREATE TABLE custom.posts (
          id SERIAL PRIMARY KEY,
          user_id INT NOT NULL,
          content TEXT NOT NULL,
          title TEXT,
          published BOOLEAN
        );
      `);
    }),

    seed.csv({
      'custom.posts': csv('posts-with-optional.csv')
    }),

    seed.fn(async ({ pg }) => {
      await pg.query(`SELECT setval(pg_get_serial_sequence('custom.posts', 'id'), (SELECT MAX(id) FROM custom.posts));`);
    })
  ]));
});

afterAll(async () => {
  await teardown();
});

it('csv with optional fields', async () => {
  const res = await pg.query(`
    SELECT id, user_id, content, title, published
    FROM custom.posts
    ORDER BY id
  `);

  expect(res.rows).toEqual([
    { id: 1, user_id: 1, content: 'Hello world!', title: 'My First Post', published: true },
    { id: 2, user_id: 2, content: 'Graphile is cool!', title: 'GraphQL Rocks', published: false }
  ]);
});
