import { v4 }  from 'uuid';
import {
  close,
  connect,
  getConnection,
  closeConnection,
  droptemplatedb
} from '../src/index';
import { expectBasicSeed } from '../utils';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

let db;

import { TestDatabase } from '../src/lib/test-db';
import { getOpts } from '../src/lib/testing';
import { setTemplate } from '../src/lib/utils';

const directory = __dirname + '/../__fixtures__/basic';

describe('skitchtest', () => {
  it('works', async () => {
    var test = new TestDatabase({
      directory
    });
    await test.init();

    const db = await test.getConnection();
    await expectBasicSeed(db);
    await closeConnection(db);
    await test.close();
  });
});
describe('templatedb', () => {
  it('template option', async () => {
    const config = await getOpts({
      directory
    });

    const templatedb = await getConnection({
      ...config,
      hot: true,
      directory: __dirname + '/../__fixtures__/basic'
    });
    await expectBasicSeed(templatedb);
    close(templatedb);

    const { connectionParameters } = templatedb.client;

    await setTemplate(config, connectionParameters.database);

    db = await getConnection({
      ...config,
      template: connectionParameters.database
    });

    // without inserting, expect data to be there already
    expect(await db.any(`SELECT * FROM myschema.sometable`)).toEqual([
      { id: 1, name: 'joe' },
      { id: 2, name: 'steve' },
      { id: 3, name: 'mary' },
      { id: 4, name: 'rachel' }
    ]);

    {
      await droptemplatedb(connectionParameters);
    }

    await closeConnection(db);
  });
});
