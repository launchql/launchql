process.env.SKITCH_PATH = __dirname + '/fixtures/skitch';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;

import { promisify } from 'util';
import { exec } from 'child_process';
import { resolve as resolvePath } from 'path';

const asyncExec = promisify(exec);
import { PGUSER, PGPASSWORD, PGHOST, PGPORT, PATH } from '@launchql/db-env';

import { deploy, revert, verify } from '../src/index';

const database = 'my-test-module-db';
const pg = require('pg');
let pgPool;

describe('deploy sqitch modules', () => {
  beforeEach(async () => {
    pgPool = new pg.Pool({
      connectionString: `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}:${PGPORT}/${database}`
    });
    try {
      await asyncExec(
        `dropdb -U ${PGUSER} -h ${PGHOST} -p ${PGPORT} ${database}`,
        {
          env: {
            PGPASSWORD,
            PATH
          }
        }
      );
    } catch (e) {}
    await asyncExec(
      `createdb -U ${PGUSER} -h ${PGHOST} -p ${PGPORT} ${database}`,
      {
        env: {
          PGPASSWORD,
          PATH
        }
      }
    );
  });
  afterEach(async () => {
    pgPool.end();
    await asyncExec(
      `dropdb -U ${PGUSER} -h ${PGHOST} -p ${PGPORT} ${database}`,
      {
        env: {
          PGPASSWORD,
          PATH
        }
      }
    );
  });
  it('deploy', async () => {
    const utils = await deploy('secrets', database);
    const {
      rows: [{ generate_secret: secret }]
    } = await pgPool.query('SELECT * FROM generate_secret()');
    const {
      rows: [{ secretfunction: secret2 }]
    } = await pgPool.query('SELECT * FROM secretfunction()');
    expect(secret).toBeTruthy();
    expect(secret2).toBeTruthy();
  });
  it('revert', async () => {
    const deployUtils = await deploy('secrets', database);
    const {
      rows: [{ generate_secret: secret }]
    } = await pgPool.query('SELECT * FROM generate_secret()');
    const {
      rows: [{ secretfunction: secret2 }]
    } = await pgPool.query('SELECT * FROM secretfunction()');
    expect(secret).toBeTruthy();
    expect(secret2).toBeTruthy();
    let failed = false;
    const revertUtils = await revert('secrets', database);
    try {
      const {
        rows: [{ generate_secret: secret3 }]
      } = await pgPool.query('SELECT * FROM generate_secret()');
    } catch (e) {
      failed = true;
    }
    expect(failed).toBe(true);
  });
  it('verify', async () => {
    const deployUtils = await deploy('secrets', database);

    // verify
    await verify('secrets', database);

    // verify w code
    const {
      rows: [{ generate_secret: secret }]
    } = await pgPool.query('SELECT * FROM generate_secret()');
    const {
      rows: [{ secretfunction: secret2 }]
    } = await pgPool.query('SELECT * FROM secretfunction()');
    expect(secret).toBeTruthy();
    expect(secret2).toBeTruthy();

    // revert
    let failed = false;
    const revertUtils = await revert('secrets', database);
    try {
      const {
        rows: [{ generate_secret: secret3 }]
      } = await pgPool.query('SELECT * FROM generate_secret()');
    } catch (e) {
      failed = true;
    }
    expect(failed).toBe(true);
  });
});
