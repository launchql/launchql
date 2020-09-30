import { v4 } from 'uuid';
import pgPromise from 'pg-promise';
import { connect, close } from '../src/lib/connection';
import { createdb, dropdb } from '../src/index';

const pgp = pgPromise({
  noWarnings: true
});

import { getConnObj, verifydb, config } from '../utils';

describe('connect', () => {
  const database = `testing-db-${v4()}`;
  beforeEach(async () => {
    await createdb({ ...config, database });
  });
  afterEach(async () => {
    await dropdb({ ...config, database });
  });
  it('can connect', async () => {
    const client = await connect(getConnObj({ database }));
    close(client);
  });
});
