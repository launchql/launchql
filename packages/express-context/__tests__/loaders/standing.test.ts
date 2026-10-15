import type { Pool } from 'pg';

import { DATABASE_STANDING_TTL_MS, standingLoader } from '../../src/loaders/standing';
import type { LoaderContext } from '../../src/loaders/types';

const fakePool = (rows: unknown[] | Error) => {
  const query = jest.fn(async (_text: string, _values?: unknown[]) => {
    if (rows instanceof Error) throw rows;
    return { rows };
  });
  return { pool: { query } as unknown as Pool, query };
};

const ctx = (routingPool: Pool, databaseId = 'db-1'): LoaderContext => ({
  routingPool,
  tenantPool: {} as Pool,
  databaseId,
  dbname: 'tenant'
});

beforeEach(() => {
  standingLoader.invalidate();
});

describe('standingLoader', () => {
  it('reads the context database only, from the routing plane', async () => {
    const { pool, query } = fakePool([{ suspended_at: null, suspended_reason: null }]);

    const standing = await standingLoader.resolve(ctx(pool, 'db-a'));

    expect(query).toHaveBeenCalledTimes(1);
    expect(query.mock.calls[0][0]).toMatch(/FROM function_resolution\.database_standing\(\$1\)/);
    expect(query.mock.calls[0][1]).toEqual(['db-a']);
    expect(standing).toEqual({ exists: true, suspended: false, suspendedAt: null, reason: null });
  });

  it('reports a suspended database with when and why', async () => {
    const at = new Date('2026-01-02T03:04:05Z');
    const { pool } = fakePool([{ suspended_at: at.toISOString(), suspended_reason: 'billing' }]);

    const standing = await standingLoader.resolve(ctx(pool));

    expect(standing).toEqual({ exists: true, suspended: true, suspendedAt: at, reason: 'billing' });
  });

  it('reports a database the plane does not know as not existing', async () => {
    const { pool } = fakePool([]);

    expect(await standingLoader.resolve(ctx(pool))).toEqual({
      exists: false,
      suspended: false,
      suspendedAt: null,
      reason: null
    });
  });

  it('propagates a read failure rather than answering', async () => {
    const { pool } = fakePool(new Error('control plane unreachable'));

    await expect(standingLoader.resolve(ctx(pool))).rejects.toThrow('control plane unreachable');
  });

  it('serves repeat reads from cache and re-reads after invalidation', async () => {
    const { pool, query } = fakePool([{ suspended_at: null, suspended_reason: null }]);

    await standingLoader.resolve(ctx(pool));
    await standingLoader.resolve(ctx(pool));
    expect(query).toHaveBeenCalledTimes(1);

    standingLoader.invalidate('db-1');
    await standingLoader.resolve(ctx(pool));
    expect(query).toHaveBeenCalledTimes(2);
  });

  it('bounds the stale window to a few seconds', () => {
    expect(DATABASE_STANDING_TTL_MS).toBeLessThanOrEqual(5_000);
  });

  it('keeps tenants apart: suspending one database does not touch another', async () => {
    const suspended = fakePool([{ suspended_at: new Date(), suspended_reason: 'admin' }]);
    const live = fakePool([{ suspended_at: null, suspended_reason: null }]);

    expect((await standingLoader.resolve(ctx(suspended.pool, 'db-a'))).suspended).toBe(true);
    expect((await standingLoader.resolve(ctx(live.pool, 'db-b'))).suspended).toBe(false);
  });
});
