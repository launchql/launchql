process.env.LOG_SCOPE = 'pgsql-test';

import path from 'path';

import { seed } from '../src';
import { getConnections } from '../src/connect';

jest.setTimeout(30000);

it('fails the harness when a seed adapter throws', async () => {
  await expect(
    getConnections({}, [
      seed.fn(async () => {
        throw new Error('DELIBERATE_SEED_FAILURE');
      })
    ])
  ).rejects.toThrow('DELIBERATE_SEED_FAILURE');
});

it('fails the harness when seed SQL is invalid', async () => {
  await expect(
    getConnections({}, [
      seed.fn(async ({ pg }) => {
        await pg.query('SELECT * FROM a_relation_that_does_not_exist');
      })
    ])
  ).rejects.toThrow(/a_relation_that_does_not_exist/);
});

it('fails the harness with the file name when a seed.sqlfile statement errors', async () => {
  const file = path.resolve(__dirname, '../sql', 'seed-broken.sql');
  await expect(
    getConnections({}, [seed.sqlfile([file])])
  ).rejects.toThrow(/seed-broken\.sql[\s\S]*seed_broken_no_such_relation/);
});
