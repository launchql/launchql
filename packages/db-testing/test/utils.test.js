import { sqitch, sqitchFast } from '../src/lib/sqitch';
import v4 from 'uuid/v4';
import {
  connectionString,
  createdb,
  dropdb,
  setArgs,
  templatedb
} from '../src/index';
import pgPromise from 'pg-promise';
import { config, getConnStr, expectBasicSeed } from './utils';

jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000;
require('dotenv').load();

const pgp = pgPromise({
  noWarnings: true
});

describe('sqitch', () => {
  let database;
  let opts;

  beforeEach(async () => {
    database = `testing-db-${v4()}`;
    opts = {
      database,
      ...config
    };
    await createdb(opts);
  });

  afterEach(async () => {
    await dropdb(opts);
  });

  it('sqitch', async () => {
    await sqitch(opts, __dirname + '/fixtures/basic');

    const cn = await pgp(opts);
    const db = await cn.connect({ direct: true });

    await expectBasicSeed(db);

    db.done();
  });

  it('sqitch II', async () => {
    const dir = process.cwd();
    process.chdir(__dirname + '/fixtures/basic');
    await sqitch(opts);

    const cn = await pgp(opts);
    const db = await cn.connect({ direct: true });

    await expectBasicSeed(db);

    db.done();
    process.chdir(dir);
  });

  it('sqitchFast', async () => {
    await sqitchFast(opts, __dirname + '/fixtures/basic');

    const cn = await pgp(opts);
    const db = await cn.connect({ direct: true });

    await expectBasicSeed(db);

    db.done();
  });

  it('sqitchFast II', async () => {
    const dir = process.cwd();
    process.chdir(__dirname + '/fixtures/basic');
    await sqitchFast(opts);

    const cn = await pgp(opts);
    const db = await cn.connect({ direct: true });

    await expectBasicSeed(db);

    db.done();
    process.chdir(dir);
  });

  it('can setArgs', () => {
    expect(setArgs({ host: 'localhost' })).toEqual(['-h', 'localhost']);
  });
});
