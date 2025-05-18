import path from 'path';
import fs from 'fs';
import { PgTestClient } from '../src/test-client';
import { getConnections } from '../src/connect';
import { seed } from '../src';
import { exportTableToCsv } from '../src/seed/csv';

const csv = (file: string) => path.resolve(__dirname, '../csv', file);

let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections({}, seed.compose([
    // 1. Create schema with SERIAL primary keys
    seed.fn(async ({ pg }) => {
      await pg.query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL
        );

        CREATE TABLE posts (
          id SERIAL PRIMARY KEY,
          user_id INT REFERENCES users(id),
          content TEXT NOT NULL
        );
      `);
    }),

    // 2. Seed from CSV using COPY FROM STDIN
    seed.csv({
      users: csv('users.csv'),
      posts: csv('posts.csv')
    }),

    // 3. Fix SERIAL sequences to match the highest used ID
    seed.fn(async ({ pg }) => {
      await pg.query(`SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));`);
      await pg.query(`SELECT setval(pg_get_serial_sequence('posts', 'id'), (SELECT MAX(id) FROM posts));`);
    })
  ])));
});

afterAll(async () => {
  await teardown();
});

it('csv in/out', async () => {
  // 4. Insert new data without specifying IDs (uses SERIAL)
  await pg.query(`
    INSERT INTO users (name) VALUES ('Carol');
    INSERT INTO posts (user_id, content) VALUES (3, 'Carol''s first post');
  `);

  // 5. Validate full contents
  const res = await pg.query(`
    SELECT users.name, posts.content
    FROM posts
    JOIN users ON users.id = posts.user_id
    ORDER BY users.id
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
  await exportTableToCsv(pg, 'users', path.join(outDir, 'users.csv'));
  await exportTableToCsv(pg, 'posts', path.join(outDir, 'posts.csv'));

  console.log(`📤 Exported users and posts to ${outDir}`);
});
