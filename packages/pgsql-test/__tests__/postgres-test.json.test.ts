process.env.LOG_SCOPE = 'pgsql-test';
import { seed } from '../src';
import { getConnections } from '../src/connect';
import { PgTestClient } from '../src/test-client';

let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections({}, [
    // 1. Create schema with SERIAL primary keys
    seed.fn(async ({ pg }) => {
      await pg.query(`
        CREATE SCHEMA custom;
        CREATE TABLE custom.users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL
        );

        CREATE TABLE custom.posts (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES custom.users(id),
          content TEXT NOT NULL
        );
      `);
    }),

    // 2. Seed from in-memory JSON
    seed.json({
      'custom.users': [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
      ],
      'custom.posts': [
        { id: 1, user_id: 1, content: 'Hello world!' },
        { id: 2, user_id: 2, content: 'Graphile is cool!' }
      ]
    }),

    // 3. Fix SERIAL sequences to match the highest used ID
    seed.fn(async ({ pg }) => {
      await pg.query(`SELECT setval(pg_get_serial_sequence('custom.users', 'id'), (SELECT MAX(id) FROM custom.users));`);
      await pg.query(`SELECT setval(pg_get_serial_sequence('custom.posts', 'id'), (SELECT MAX(id) FROM custom.posts));`);
    })
  ]));
});

afterAll(async () => {
  await teardown();
});

it('json', async () => {
  // 4. Insert new data without specifying IDs (uses SERIAL)
  await pg.query(`
    INSERT INTO custom.users (name) VALUES ('Carol');
    INSERT INTO custom.posts (user_id, content) VALUES (3, 'Carol''s first post');
  `);

  // 5. Validate full contents
  const res = await pg.query(`
    SELECT custom.users.name, custom.posts.content
    FROM custom.posts
    JOIN custom.users ON custom.users.id = custom.posts.user_id
    ORDER BY custom.users.id
  `);

  expect(res.rows).toEqual([
    { name: 'Alice', content: 'Hello world!' },
    { name: 'Bob', content: 'Graphile is cool!' },
    { name: 'Carol', content: "Carol's first post" }
  ]);

});
