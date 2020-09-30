import { v4 } from 'uuid';
import pgPromise from 'pg-promise';
import { dropdb, createdb, templatedb } from '../src/lib/db';
import { getConnObj, getConnStr, cleanup, verifydb } from '../utils';
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

const pgp = pgPromise({
  noWarnings: true
});

describe('createdb', () => {
  const database = `testing-db-${v4()}`;
  afterEach(async () => {
    await cleanup(database);
  });
  it('create a database', async () => {
    await createdb(
      getConnObj({
        database
      })
    );
    await verifydb(database);
  });
});
describe('templatedb', () => {
  const database = `testing-db-${v4()}`;
  const template = `testing-db-template-${v4()}`;
  afterEach(async () => {
    await cleanup(database);
    await cleanup(template);
  });
  it('create a templatedb database', async () => {
    await createdb(
      getConnObj({
        database: template
      })
    );

    await templatedb(
      getConnObj({
        database,
        template
      })
    );

    await verifydb(database);
  });
});
describe('dropdb', () => {
  const database = `testing-db-${v4()}`;
  beforeEach(async () => {
    await createdb(
      getConnObj({
        database
      })
    );
    await verifydb(database);
  });
  it('drop a database', async () => {
    let failed = false;
    await dropdb(
      getConnObj({
        database
      })
    );
    try {
      const client = await pgp(getConnStr({ database }));
      await client.connect();
    } catch (e) {
      failed = true;
    }
    expect(failed).toBeTruthy();
  });
});
