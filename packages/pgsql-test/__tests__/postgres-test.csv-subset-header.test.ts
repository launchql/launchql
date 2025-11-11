process.env.LOG_SCOPE = 'pgsql-test';

import fs from 'fs';
import path from 'path';

import { seed } from '../src';
import { getConnections } from '../src/connect';
import { exportTableToCsv } from '../src/seed/csv';
import { PgTestClient } from '../src/test-client';

const csv = (file: string) => path.resolve(__dirname, '../csv', file);

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

    // 2. Seed from CSV using COPY FROM STDIN
    seed.csv({
      'custom.users': csv('users.csv'),
      'custom.posts': csv('posts-subset-header.csv')
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

it('csv in/out', async () => {
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

  // 6. Ensure output directory exists
  const outDir = path.resolve(__dirname, '../output');
  fs.mkdirSync(outDir, { recursive: true });

  // 7. Export updated tables to CSV
  await exportTableToCsv(pg, 'custom.users', path.join(outDir, 'users.csv'));
  await exportTableToCsv(pg, 'custom.posts', path.join(outDir, 'posts.csv'));

  console.log(`📤 Exported users and posts to ${outDir}`);
});
