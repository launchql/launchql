import { getConnections, PgTestClient } from 'pgsql-test';
import cases from 'jest-in-case';

let pg: PgTestClient;
let teardown:  () => Promise<void>;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections());
});

afterAll(async () => {
  await teardown();
});


cases(
  'rfc6238',
  async (opts: { date: string; len: number; algo: string; result: string }) => {
    const { generate } = await pg.one(
      `SELECT totp.generate(
         secret := $1,
         period := 30,
         digits := $2,
         time_from := $3,
         hash := $4,
         encoding := NULL
       )`,
      ['12345678901234567890', opts.len, opts.date, opts.algo]
    );
    expect(generate).toEqual(opts.result);
    expect(generate).toMatchSnapshot();
  },
  [
    { date: '1970-01-01 00:00:59', len: 8, algo: 'sha1', result: '94287082' },
    { date: '2005-03-18 01:58:29', len: 8, algo: 'sha1', result: '07081804' },
    { date: '2005-03-18 01:58:31', len: 8, algo: 'sha1', result: '14050471' },
    { date: '2009-02-13 23:31:30', len: 8, algo: 'sha1', result: '89005924' },
    { date: '2033-05-18 03:33:20', len: 8, algo: 'sha1', result: '69279037' },
    { date: '2603-10-11 11:33:20', len: 8, algo: 'sha1', result: '65353130' }
  ]
);

cases(
  'speakeasy test',
  async (opts: { date: string; len: number; algo: string; step: number; result: string }) => {
    const { generate } = await pg.one(
      `SELECT totp.generate(
         secret := $1,
         period := $5,
         digits := $2,
         time_from := $3,
         hash := $4,
         encoding := NULL
       )`,
      ['12345678901234567890', opts.len, opts.date, opts.algo, opts.step]
    );
    expect(generate).toEqual(opts.result);
    expect(generate).toMatchSnapshot();
  },
  [
    { date: '1970-01-01 00:00:59', len: 6, step: 30, algo: 'sha1', result: '287082' },
    { date: '2005-03-18 01:58:29', len: 6, step: 30, algo: 'sha1', result: '081804' },
    { date: '2005-03-18 01:58:29', len: 6, step: 60, algo: 'sha1', result: '360094' }
  ]
);

cases(
  'verify',
  async (opts: { date: string; len: number; algo?: string; step: number; result: string }) => {
    const [{ verified }] = await pg.any(
      `SELECT * FROM totp.verify(
         secret := $1,
         check_totp := $2,
         period := $3,
         digits := $4,
         time_from := $5,
         encoding := NULL
       ) as verified`,
      ['12345678901234567890', opts.result, opts.step, opts.len, opts.date]
    );
    expect(verified).toBe(true);
  },
  [
    { date: '1970-01-01 00:00:59', len: 6, step: 30, algo: 'sha1', result: '287082' },
    { date: '2005-03-18 01:58:29', len: 6, step: 30, algo: 'sha1', result: '081804' },
    { date: '2005-03-18 01:58:29', len: 6, step: 60, algo: 'sha1', result: '360094' },
    { date: '1970-01-01 00:00:59', len: 8, step: 30, algo: 'sha1', result: '94287082' },
    { date: '2005-03-18 01:58:29', len: 8, step: 30, algo: 'sha1', result: '07081804' },
    { date: '2005-03-18 01:58:31', len: 8, step: 30, algo: 'sha1', result: '14050471' },
    { date: '2009-02-13 23:31:30', len: 8, step: 30, algo: 'sha1', result: '89005924' },
    { date: '2033-05-18 03:33:20', len: 8, algo: 'sha1', step: 30, result: '69279037' },
    { date: '2603-10-11 11:33:20', len: 8, algo: 'sha1', step: 30, result: '65353130' }
  ]
);

cases(
  'issue',
  async (opts: { encoding: string | null; secret: string; date: string; len: number; step: number; algo: string; result: string }) => {
    const { generate } = await pg.one(
      `SELECT totp.generate(
         secret := $1,
         period := $2,
         digits := $3,
         time_from := $4,
         hash := $5,
         encoding := $6
       )`,
      [opts.secret, opts.step, opts.len, opts.date, opts.algo, opts.encoding]
    );
    expect(generate).toEqual(opts.result);
    expect(generate).toMatchSnapshot();
  },
  [
    {
      encoding: null,
      secret: 'OH3NUPO3WOGOZZQ4',
      date: '2020-11-14 07:46:37.212048+00',
      len: 6,
      step: 30,
      algo: 'sha1',
      result: '476240'
    },
    {
      encoding: 'base32',
      secret: 'OH3NUPO3WOGOZZQ4',
      date: '2020-11-14 07:46:37.212048+00',
      len: 6,
      step: 30,
      algo: 'sha1',
      result: '788648'
    },
    {
      encoding: 'base32',
      secret: 'OH3NUPO',
      date: '2020-11-14 07:46:37.212048+00',
      len: 6,
      step: 30,
      algo: 'sha1',
      result: '080176'
    }
  ]
);
