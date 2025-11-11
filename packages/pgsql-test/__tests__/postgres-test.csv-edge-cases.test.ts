process.env.LOG_SCOPE = 'pgsql-test';

import path from 'path';

import { seed } from '../src';
import { getConnections } from '../src/connect';
import { PgTestClient } from '../src/test-client';

const csv = (file: string) => path.resolve(__dirname, '../csv', file);

describe('CSV edge cases', () => {
  describe('quoted commas', () => {
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
              title TEXT
            );
          `);
        }),

        seed.csv({
          'custom.posts': csv('posts-quoted-commas.csv')
        })
      ]));
    });

    afterAll(async () => {
      await teardown();
    });

    it('handles quoted commas in CSV fields', async () => {
      const res = await pg.query(`
        SELECT id, user_id, content, title
        FROM custom.posts
        ORDER BY id
      `);

      expect(res.rows).toEqual([
        { id: 1, user_id: 1, content: 'Hello, world!', title: 'First Post, Ever' },
        { id: 2, user_id: 2, content: 'Graphile is cool!', title: 'GraphQL, PostGraphile' }
      ]);
    });
  });

  describe('escaped quotes', () => {
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
              content TEXT NOT NULL
            );
          `);
        }),

        seed.csv({
          'custom.posts': csv('posts-escaped-quotes.csv')
        })
      ]));
    });

    afterAll(async () => {
      await teardown();
    });

    it('handles escaped quotes in CSV fields', async () => {
      const res = await pg.query(`
        SELECT id, user_id, content
        FROM custom.posts
        ORDER BY id
      `);

      expect(res.rows).toEqual([
        { id: 1, user_id: 1, content: 'He said "hello"' },
        { id: 2, user_id: 2, content: 'She replied "hi"' }
      ]);
    });
  });
});
