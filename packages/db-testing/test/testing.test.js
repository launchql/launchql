import v4 from 'uuid/v4';
import {
  close,
  connect,
  getConnection,
  closeConnection,
  dropdb
} from '../src/index';
import {
  getConnObj,
  getConnStr,
  cleanup,
  verifydb,
  expectBasicSeed,
  config
} from './utils';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
require('dotenv').load();

let db;

describe('testing', () => {
  afterEach(async () => {
    await closeConnection(db);
  });

  it('hot seed w extensions', async () => {
    db = await getConnection({
      ...config,
      hot: true,
      directory: __dirname + '/fixtures/basic',
      extensions: ['pgcrypto', 'citext']
    });
    await expectBasicSeed(db);
  });
  it('hot seed option', async () => {
    db = await getConnection({
      ...config,
      hot: true,
      directory: __dirname + '/fixtures/basic'
    });
    await expectBasicSeed(db);
  });
  it('hot seed option prefix', async () => {
    const dir = process.cwd();
    process.chdir(__dirname + '/fixtures/basic');
    db = await getConnection({
      ...config,
      hot: true,
      prefix: 'testing-another-'
    });
    await expectBasicSeed(db);
    process.chdir(dir);
  });
  it('sqitch seed option', async () => {
    db = await getConnection({
      ...config,
      directory: __dirname + '/fixtures/basic'
    });
    await expectBasicSeed(db);
  });
  it('sqitch seed option prefix', async () => {
    const dir = process.cwd();
    process.chdir(__dirname + '/fixtures/basic');
    db = await getConnection({
      ...config,
      prefix: 'testing-another-'
    });
    await expectBasicSeed(db);
    process.chdir(dir);
  });
});
