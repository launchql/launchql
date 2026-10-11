import { createServer, type Server } from 'node:http';

import { type GetConnectionResult, getConnections } from 'pgsql-test';
import { makePgService } from 'postgraphile/adaptors/pg';
import { PostGraphileAmberPreset } from 'postgraphile/presets/amber';

import { createGraphileInstance } from '../create-instance';
import { clearGraphileCache, disposeUncachedEntry, graphileCache, type GraphileCacheEntry, waitForEntryDisposal } from '../graphile-cache';
import { createPresetServicesReleaser } from '../utils/preset-services';

jest.setTimeout(30_000);

const listen = (server: Server): Promise<void> => new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', () => {
    server.removeListener('error', reject);
    resolve();
  });
});

const closeServer = (server: Server): Promise<void> => new Promise((resolve, reject) => {
  if (!server.listening) return resolve();
  server.close(error => error ? reject(error) : resolve());
});

const waitFor = async (predicate: () => boolean): Promise<void> => {
  const deadline = Date.now() + 5000;
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error('Timed out waiting for subscriber cleanup');
    await new Promise(resolve => setTimeout(resolve, 5));
  }
};

describe('unpatched PostgreSQL service release', () => {
  let fixture: GetConnectionResult;

  const getPool = () => {
    const config = { ...fixture.pg.config, max: 2 };
    return fixture.manager.getPool(config);
  };

  beforeAll(async () => {
    fixture = await getConnections({}, []);
  });
  beforeEach(async () => {
    await fixture.pg.beforeEach();
    await fixture.db.beforeEach();
  });
  afterEach(async () => {
    await clearGraphileCache();
    jest.restoreAllMocks();
    await fixture?.db.afterEach();
    await fixture?.pg.afterEach();
  });
  afterAll(async () => {
    await fixture?.teardown();
  });

  it('eventually returns the subscriber backend and removes its LISTEN channels', async () => {
    const pool = getPool();
    const end = jest.spyOn(pool, 'end');
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
      expect(end).not.toHaveBeenCalled();
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

  it('keeps caller-provided pools and subscribers caller-owned', async () => {
    const pool = getPool();
    const end = jest.spyOn(pool, 'end');
    const subscriber = { release: jest.fn() };
    const service = makePgService({ pool, superuserPool: pool, schemas: ['public'], pgSubscriber: subscriber as any });
    const release = createPresetServicesReleaser({ pgServices: [service] });
    await release();
    await release();
    expect(subscriber.release).not.toHaveBeenCalled();
    expect(end).not.toHaveBeenCalled();
    expect((await pool.query('SELECT 1 AS alive')).rows).toEqual([{ alive: 1 }]);
  });

  it('releases subscribed same-key generations without closing a shared main server or external pool', async () => {
    const pool = getPool();
    const end = jest.spyOn(pool, 'end');
    const firstService = makePgService({ pool, schemas: ['public'] });
    const secondService = makePgService({ pool, schemas: ['public'] });
    const releaseFirst = jest.spyOn(firstService, 'release');
    const releaseSecond = jest.spyOn(secondService, 'release');
    const mainServer = createServer((_req, res) => res.end('main'));
    const entries: GraphileCacheEntry[] = [];
    const build = async (service: typeof firstService) => {
      const instance = await createGraphileInstance({
        cacheKey: 'shared-generation',
        preset: { extends: [PostGraphileAmberPreset], pgServices: [service], grafserv: { graphiql: false } },
      });
      entries.push(instance);
      await listen(instance.httpServer);
      return instance;
    };

    try {
      await listen(mainServer);
      const first = await build(firstService);
      const second = await build(secondService);
      await firstService.pgSubscriber!.subscribe('graphile_cache_first_generation');
      await secondService.pgSubscriber!.subscribe('graphile_cache_second_generation');
      graphileCache.set(first.cacheKey, first);
      graphileCache.set(second.cacheKey, second);
      await waitForEntryDisposal(first);
      expect(first.httpServer.listening).toBe(false);
      expect(second.httpServer.listening).toBe(true);
      expect(mainServer.listening).toBe(true);
      expect(releaseFirst).toHaveBeenCalledTimes(1);
      expect(releaseSecond).not.toHaveBeenCalled();

      graphileCache.delete(second.cacheKey);
      await waitForEntryDisposal(second);
      expect(disposeUncachedEntry(first)).toBe(waitForEntryDisposal(first));
      expect(disposeUncachedEntry(second)).toBe(waitForEntryDisposal(second));
      expect(second.httpServer.listening).toBe(false);
      expect(mainServer.listening).toBe(true);
      expect(releaseSecond).toHaveBeenCalledTimes(1);
      expect(end).not.toHaveBeenCalled();
      // Observe upstream background cleanup separately from the release result.
      await waitFor(() => pool.waitingCount === 0 && pool.idleCount === pool.totalCount);
      const clients = await Promise.all([pool.connect(), pool.connect()]);
      try {
        for (const client of clients) {
          expect((await client.query('SELECT pg_listening_channels()')).rows).toEqual([]);
        }
      } finally {
        clients.forEach(client => client.release());
      }
      expect((await pool.query('SELECT 1 AS alive')).rows).toEqual([{ alive: 1 }]);
    } finally {
      try {
        await clearGraphileCache();
        await Promise.all(entries.map(instance => disposeUncachedEntry(instance)));
      } finally {
        await closeServer(mainServer);
      }
    }
  });

  it('releases a service after a real schema build fails while its external pool remains usable', async () => {
    const pool = getPool();
    const end = jest.spyOn(pool, 'end');
    const service = makePgService({ pool, schemas: ['public'] });
    const release = jest.spyOn(service, 'release');
    const failure = new Error('schema build sentinel');
    await expect(createGraphileInstance({
      cacheKey: 'failed-schema',
      preset: {
        extends: [PostGraphileAmberPreset], pgServices: [service],
        plugins: [{ name: 'FailGraphileCacheSchema', version: '0.0.0', schema: { hooks: {
          GraphQLSchema: () => { throw failure; },
        } } }],
      },
    })).rejects.toBe(failure);
    expect(release).toHaveBeenCalledTimes(1);
    expect(end).not.toHaveBeenCalled();
    expect((await pool.query('SELECT 1 AS alive')).rows).toEqual([{ alive: 1 }]);
  });
});
