process.env.LOG_SCOPE = 'pgsql-test';

import { getConnections } from '../src/connect';
import { PgTestClient } from '../src/test-client';

let pg: PgTestClient;
let teardown: () => Promise<void>;

beforeAll(async () => {
  ({ pg, teardown } = await getConnections());
});

beforeEach(async () => {
  await pg.beforeEach();
  await pg.query(`CREATE TABLE expect_error_items (id int PRIMARY KEY, name text NOT NULL)`);
  await pg.query(`INSERT INTO expect_error_items VALUES (1, 'one')`);
});

afterEach(async () => {
  await pg.afterEach();
});

afterAll(async () => {
  await teardown();
});

const count = async () =>
  Number((await pg.one(`SELECT count(*) AS n FROM expect_error_items`)).n);

describe('PgTestClient.expectError', () => {
  it('keeps the transaction usable after the expected failure', async () => {
    await pg.expectError(
      () => pg.query(`INSERT INTO expect_error_items VALUES (1, 'dup')`),
      /duplicate key value/
    );

    expect(await count()).toBe(1);
    await pg.query(`INSERT INTO expect_error_items VALUES (2, 'two')`);
    expect(await count()).toBe(2);
  });

  it('can be called repeatedly in one test', async () => {
    await pg.expectError(() => pg.query(`INSERT INTO expect_error_items VALUES (1, 'a')`), 'duplicate key');
    await pg.expectError(() => pg.query(`INSERT INTO expect_error_items VALUES (3, NULL)`), /not-null/);
    await pg.expectError(() => pg.query(`SELECT 1/0`), { code: '22012' });

    expect(await count()).toBe(1);
  });

  it('returns the caught error', async () => {
    const err = await pg.expectError(() => pg.query(`SELECT 1/0`));
    expect(err.code).toBe('22012');
  });

  it('matches code and message together', async () => {
    await pg.expectError(() => pg.query(`SELECT 1/0`), { code: '22012', message: /division by zero/ });
    await expect(
      pg.expectError(() => pg.query(`SELECT 1/0`), { code: '22012', message: /nope/ })
    ).rejects.toThrow(/expectError: expected .*got 22012: division by zero/);
  });

  it('fails when the statement succeeds, and rolls the success back', async () => {
    await expect(
      pg.expectError(() => pg.query(`INSERT INTO expect_error_items VALUES (2, 'two')`), /duplicate/)
    ).rejects.toThrow(/expectError: expected \/duplicate\/, but the statement succeeded/);

    expect(await count()).toBe(1);
  });

  it('fails when the error does not match, and leaves the transaction usable', async () => {
    const err = await pg
      .expectError(() => pg.query(`SELECT 1/0`), /permission denied/)
      .catch((e: Error) => e);

    expect((err as Error).message).toMatch(/expected \/permission denied\/, got 22012: division by zero/);
    expect(((err as Error).cause as any).code).toBe('22012');
    expect(await count()).toBe(1);
  });

  it('keeps work done before the call and nests with a caller savepoint of the same name', async () => {
    await pg.query(`INSERT INTO expect_error_items VALUES (2, 'two')`);
    await pg.savepoint('pgsql_test_expect_error');
    await pg.query(`INSERT INTO expect_error_items VALUES (3, 'three')`);

    await pg.expectError(() => pg.query(`SELECT 1/0`), { code: '22012' });
    expect(await count()).toBe(3);

    await pg.rollback('pgsql_test_expect_error');
    expect(await count()).toBe(2);
  });

  it('reverts setContext-free session state set inside the failed block', async () => {
    await pg.expectError(async () => {
      await pg.query(`SELECT set_config('app.flag', 'on', true)`);
      await pg.query(`SELECT 1/0`);
    }, { code: '22012' });

    const { flag } = await pg.one(`SELECT current_setting('app.flag', true) AS flag`);
    expect(flag || null).toBeNull();
  });
});
