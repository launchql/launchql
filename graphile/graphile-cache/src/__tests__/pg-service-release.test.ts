import { type GetConnectionResult, getConnections } from 'pgsql-test';
import { makePgService } from 'postgraphile/adaptors/pg';

import { createPresetServicesReleaser } from '../preset-services';

const waitFor = async (predicate: () => boolean): Promise<void> => {
  const deadline = Date.now() + 5000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error('Timed out waiting for subscriber cleanup');
    await new Promise(resolve => setTimeout(resolve, 5));
  }
};

describe('unpatched PostgreSQL service release', () => {
  let fixture: GetConnectionResult;

  beforeAll(async () => {
    fixture = await getConnections({}, []);
  });
  beforeEach(async () => {
    await fixture.pg.beforeEach();
    await fixture.db.beforeEach();
  });
  afterEach(async () => {
    await fixture.db.afterEach();
    await fixture.pg.afterEach();
  });
  afterAll(async () => {
    await fixture?.teardown();
  });

  it('eventually returns the subscriber backend and removes its LISTEN channels', async () => {
    const poolConfig = { ...fixture.pg.config, max: 1 };
    const pool = fixture.manager.getPool(poolConfig);
    const service = makePgService({ pool, schemas: ['public'] });
    const release = createPresetServicesReleaser({ pgServices: [service] });
    try {
      const iterator = await service.pgSubscriber!.subscribe('graphile_cache_release_test');
      let received = false;
      const notification = iterator.next().then(result => {
        expect(result.value).toBe('ready');
        received = true;
      });
      // pg_notify must commit independently of the fixture's savepoint.
      for (let attempt = 0; attempt < 100 && !received; attempt++) {
        await fixture.pg.query("SELECT pg_notify('graphile_cache_release_test', 'ready')");
        await fixture.pg.publish();
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      expect(received).toBe(true);
      await notification;
      expect(pool.totalCount).toBe(1);
      expect(pool.idleCount).toBe(0);
      const before = await fixture.pg.query(
        'SELECT pid FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid()'
      );

      await release();
      // The public call succeeding is the disposal contract. Pool return is a
      // separate eventual observation, not a prerequisite for that success.
      await waitFor(() => pool.idleCount === 1);
      const channels = await pool.query('SELECT pg_listening_channels()');
      expect(channels.rows).toEqual([]);
      const backend = await pool.query('SELECT pg_backend_pid() AS pid');
      expect(before.rows.map(row => row.pid)).toContain(backend.rows[0].pid);
      expect(pool.totalCount).toBe(1);
    } finally {
      await release();
    }
  });
});
