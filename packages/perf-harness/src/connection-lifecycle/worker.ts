import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { setTimeout as delay } from 'node:timers/promises';

import {
  clearGraphileCache,
  createGraphileInstance,
  disposeUncachedEntry,
  graphileCache,
  type GraphileCacheEntry,
  waitForActiveDisposals,
} from 'graphile-cache';
import { lexicographicSortSchema, printSchema } from 'graphql';
import type { Pool } from 'pg';
import { getConnections } from 'pgsql-test';
import { makePgService } from 'postgraphile/adaptors/pg';
import { grafast } from 'postgraphile/grafast';
import { PostGraphileAmberPreset } from 'postgraphile/presets/amber';

import { measureBenchmarkCase } from '../metrics';
import { parseWorkerProcessArgs, redactSecret, writeWorkerResult } from '../process';
import type { JsonValue, SuccessfulWorkerResult } from '../types';

const modes = ['idle', 'subscribed', 'startup-race', 'cache', 'cache-subscribed', 'failed-build', 'replacement'] as const;
type Mode = typeof modes[number];
interface Config { mode: Mode; cycles: number; concurrency: number }

const parseConfig = (value: JsonValue): Config => {
  const config = value as unknown as Config;
  assert(config && modes.includes(config.mode), 'unknown lifecycle mode');
  assert(Number.isSafeInteger(config.cycles) && config.cycles > 0, 'cycles must be positive');
  assert(Number.isSafeInteger(config.concurrency) && config.concurrency > 0 && config.concurrency <= 16,
    'concurrency must be between 1 and 16');
  return config;
};

const waitUntil = async (predicate: () => boolean | Promise<boolean>, label: string): Promise<number> => {
  const start = performance.now();
  while (!await predicate()) {
    if (performance.now() - start > 5000) throw new Error(`Timed out: ${label}`);
    await delay(2);
  }
  return performance.now() - start;
};

const run = async (): Promise<void> => {
  const { databaseUrl, envelope } = parseWorkerProcessArgs(process.argv.slice(2));
  const config = parseConfig(envelope.workerConfig);
  // pgsql-test owns the isolated database, clients, pool, and final teardown.
  const url = new URL(databaseUrl);
  assert(['postgres:', 'postgresql:'].includes(url.protocol) && !url.search,
    'use a local PostgreSQL URL without query parameters');
  const fixture = await getConnections({
    pg: { host: url.hostname, port: Number(url.port || 5432),
      user: decodeURIComponent(url.username), password: decodeURIComponent(url.password) },
    db: { rootDb: decodeURIComponent(url.pathname.slice(1)) || 'postgres' },
  }, []);
  const poolConfig = {
    ...fixture.pg.config, max: Math.min(16, config.concurrency * 2),
    connectionTimeoutMillis: 5000, idleTimeoutMillis: 1000,
  };
  const pool = fixture.manager.getPool(poolConfig);
  let result: SuccessfulWorkerResult | undefined;
  let primaryError: unknown;
  const cleanupErrors: unknown[] = [];
  let created = 0;
  let released = 0;
  let pendingAtReturn = 0;
  let expectedBuildFailures = 0;
  let peakTotal = 0;
  let peakCheckedOut = 0;
  let peakWaiting = 0;
  let maxSettleMs = 0;
  let peakNotificationListeners = 0;
  let peakErrorListeners = 0;
  let listenerWarnings = 0;
  const onWarning = (warning: Error): void => {
    if (warning.name === 'MaxListenersExceededWarning') listenerWarnings++;
  };
  process.on('warning', onWarning);
  let schemaHash = '';
  let schemaTypeCount = 0;
  const checkpoints: JsonValue[] = [];
  const releaseTimes: number[] = [];
  const poolErrors: string[] = [];
  pool.on('error', error => poolErrors.push(error.message));
  const sample = (): void => {
    peakTotal = Math.max(peakTotal, pool.totalCount);
    peakCheckedOut = Math.max(peakCheckedOut, pool.totalCount - pool.idleCount);
    peakWaiting = Math.max(peakWaiting, pool.waitingCount);
  };
  const sampler = setInterval(sample, 2);
  const newService = () => {
    created++;
    const service = makePgService({ pool, schemas: ['cperf_lifecycle'] });
    const upstreamRelease = service.release.bind(service);
    // Measure the actual public call in every path, including failed builds
    // and disposal started by cache replacement. Do not infer cleanup counts.
    service.release = () => releaseCall(upstreamRelease);
    return service;
  };
  const releaseCall = async (release: () => void | PromiseLike<void>): Promise<void> => {
    const start = performance.now();
    await release();
    releaseTimes.push(performance.now() - start);
    released++;
    if (pool.totalCount !== pool.idleCount) pendingAtReturn++;
    sample();
  };
  const subscribe = async (service: ReturnType<typeof makePgService>, id: number): Promise<void> => {
    const topic = `cperf_${id}`;
    const iterator = await service.pgSubscriber!.subscribe(topic);
    if (config.mode === 'startup-race') return;
    let received = false;
    const next = iterator.next().then(value => {
      assert.equal(value.value, 'ready');
      received = true;
    });
    const deadline = performance.now() + 5000;
    while (!received) {
      assert(performance.now() < deadline, 'LISTEN readiness timed out');
      await fixture.pg.query('SELECT pg_notify($1, $2)', [topic, 'ready']);
      await delay(2);
    }
    await next;
  };
  const verifyChannels = async (target: Pool): Promise<number> => {
    // Hold all acquired clients until every idle backend has been inspected.
    const clients = await Promise.all(Array.from({ length: target.totalCount }, () => target.connect()));
    try {
      for (const client of clients) {
        peakNotificationListeners = Math.max(peakNotificationListeners, client.listenerCount('notification'));
        peakErrorListeners = Math.max(peakErrorListeners, client.listenerCount('error'));
      }
      const results = await Promise.all(clients.map(client => client.query('SELECT pg_listening_channels()')));
      return results.reduce((count, result) => count + result.rowCount!, 0);
    } finally {
      for (const client of clients) client.release();
    }
  };

  try {
    // Fixture setup is committed so independent Graphile connections can see it.
    await fixture.pg.query('CREATE SCHEMA cperf_lifecycle; CREATE TABLE cperf_lifecycle.item (id int PRIMARY KEY, value int NOT NULL); INSERT INTO cperf_lifecycle.item VALUES (1, 42)');
    await fixture.db.query('SELECT 1');
    const baseline = await fixture.pg.query('SELECT count(*)::int AS n FROM pg_stat_activity WHERE datname = current_database()');
    result = await measureBenchmarkCase(envelope.caseName, async () => {
      for (let offset = 0; offset < config.cycles; offset += config.concurrency) {
        await Promise.all(Array.from({ length: Math.min(config.concurrency, config.cycles - offset) }, async (_, index) => {
          const id = offset + index;
          const service = newService();
          if (config.mode === 'idle' || config.mode === 'subscribed' || config.mode === 'startup-race') {
            try {
              if (config.mode !== 'idle') await subscribe(service, id);
            } finally {
              await service.release();
            }
            return;
          }
          const failure = new Error('intentional lifecycle build failure');
          const entry = await createGraphileInstance({
            cacheKey: `cperf_${index}`,
            preset: {
              extends: [PostGraphileAmberPreset],
              pgServices: [service],
              grafserv: { graphqlPath: '/graphql' },
              ...(config.mode === 'failed-build' ? {
                plugins: [{ name: 'LifecycleFailurePlugin', version: '1.0.0', schema: {
                  hooks: { GraphQLSchema: () => { throw failure; } },
                } }],
              } : {}),
            },
          }).catch((error): GraphileCacheEntry | null => {
            if (config.mode !== 'failed-build' || error !== failure) throw error;
            expectedBuildFailures++;
            return null;
          });
          if (!entry) return;
          try {
            const { schema } = await entry.pgl.getSchemaResult();
            const execution = await grafast({ schema, source: '{ allItems { nodes { value } } }',
              resolvedPreset: entry.pgl.getResolvedPreset(), requestContext: {} });
            assert('data' in execution, `runtime query failed: ${JSON.stringify(execution)}`);
            assert.equal(execution.errors, undefined);
            assert.deepEqual(JSON.parse(JSON.stringify(execution.data)), { allItems: { nodes: [{ value: 42 }] } });
            schemaHash = createHash('sha256').update(printSchema(lexicographicSortSchema(schema))).digest('hex');
            schemaTypeCount = Object.keys(schema.getTypeMap()).length;
            if (config.mode === 'cache-subscribed' || config.mode === 'replacement') await subscribe(service, id);
            if (config.mode === 'replacement') {
              // Reuse each key across generations while the old teardown runs.
              graphileCache.set(entry.cacheKey, entry);
            } else {
              await disposeUncachedEntry(entry);
            }
          } catch (error) {
            await disposeUncachedEntry(entry);
            throw error;
          }
        }));
        sample();
        // Observe a long churn window before quiescence, not after every release.
        if ((offset + config.concurrency) % 64 === 0 || offset + config.concurrency >= config.cycles) {
          if (config.mode === 'replacement') {
            await clearGraphileCache();
          }
          await waitForActiveDisposals();
          maxSettleMs = Math.max(maxSettleMs, await waitUntil(
            () => pool.totalCount === pool.idleCount && pool.waitingCount === 0, 'pool quiescence'
          ));
          const channels = await verifyChannels(pool);
          assert.equal(channels, 0, 'LISTEN channels remain after quiescence');
          const activity = await fixture.pg.query('SELECT count(*)::int AS n FROM pg_stat_activity WHERE datname = current_database()');
          checkpoints.push({ cycles: Math.min(offset + config.concurrency, config.cycles),
            total: pool.totalCount, idle: pool.idleCount, waiting: pool.waitingCount,
            backends: activity.rows[0].n, channels, peakNotificationListeners, peakErrorListeners });
        }
      }
      return baseline.rows[0].n as number;
    }, async baselineBackends => {
      assert.equal(released, created);
      assert.equal(pool.totalCount - pool.idleCount, 0);
      assert.deepEqual(poolErrors, []);
      assert.equal(graphileCache.size, 0);
      if (config.mode === 'failed-build') assert.equal(expectedBuildFailures, config.cycles);
      const probe = await pool.query('SELECT 1 AS ok');
      assert.equal(probe.rows[0].ok, 1);
      await waitUntil(() => pool.totalCount === 0, 'idle connection expiry');
      let finalBackends = -1;
      const backendSettleMs = await waitUntil(async () => {
        const activity = await fixture.pg.query('SELECT count(*)::int AS n FROM pg_stat_activity WHERE datname = current_database()');
        finalBackends = activity.rows[0].n;
        return finalBackends === baselineBackends;
      }, 'database backend baseline after idle expiry');
      releaseTimes.sort((a, b) => a - b);
      return {
        schemaHash: schemaHash || createHash('sha256').update('SELECT 1 AS ok').digest('hex'),
        schemaTypeCount, runtimeVerified: true,
        metadata: { ...config, poolMax: poolConfig.max, idleTimeoutMs: poolConfig.idleTimeoutMillis,
          created, released, expectedBuildFailures, pendingAtReturn,
          peakTotal, peakCheckedOut, peakWaiting, maxSettleMs, baselineBackends,
          finalBackends, backendSettleMs, releaseSamples: releaseTimes.length,
          releaseP99Ms: releaseTimes[Math.floor(releaseTimes.length * 0.99)],
          checkpoints, poolErrors, peakNotificationListeners, peakErrorListeners, listenerWarnings },
      };
    });
  } catch (error) {
    primaryError = error;
    process.stderr.write(`Lifecycle failure: ${redactSecret(String(error), databaseUrl)}\n`);
    process.stderr.write(`${JSON.stringify({ created, released, total: pool.totalCount,
      idle: pool.idleCount, waiting: pool.waitingCount, checkpoints })}\n`);
  } finally {
    clearInterval(sampler);
    process.off('warning', onWarning);
    try { await clearGraphileCache(); } catch (error) { cleanupErrors.push(error); }
    try { await fixture.teardown(); } catch (error) { cleanupErrors.push(error); }
  }
  if (primaryError || cleanupErrors.length) {
    throw new AggregateError([...(primaryError ? [primaryError] : []), ...cleanupErrors], 'Lifecycle benchmark failed');
  }
  writeWorkerResult(result!);
};

void run().catch(error => {
  const { databaseUrl, envelope } = parseWorkerProcessArgs(process.argv.slice(2));
  const message = error instanceof AggregateError
    ? error.errors.map(item => String(item?.stack ?? item)).join('\n') : String(error?.stack ?? error);
  writeWorkerResult({ status: 'error', pid: process.pid, caseName: envelope.caseName,
    error: redactSecret(message, databaseUrl) });
  process.exitCode = 1;
});
