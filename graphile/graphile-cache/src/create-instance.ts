import { createServer } from 'node:http';

import { Logger } from '@pgpmjs/logger';
import express from 'express';
import { grafserv } from 'grafserv/express/v4';
import { RealtimeManager } from 'graphile-realtime-subscriptions';
import { postgraphile } from 'postgraphile';

import { awaitGraphileBuildReadiness } from './build-readiness';
import { disposeUncachedEntry, type GraphileCacheEntry } from './graphile-cache';
import { createPresetServicesReleaser } from './preset-services';

const log = new Logger('graphile-cache:create');

interface GraphileInstanceOptions {
  preset: any;
  cacheKey: string;
  /**
   * When true, a RealtimeManager is created and started alongside the
   * PostGraphile instance.  The pool is extracted from the preset's
   * pgServices (managed by pg-cache) rather than passed separately.
   */
  enableRealtime?: boolean;
}

/**
 * Create a PostGraphile v5 instance backed by grafserv/express.
 *
 * This is the shared factory used by both graphql/server and graphql/explorer
 * to spin up a fully-initialised PostGraphile handler that fits into the
 * graphile-cache LRU cache.
 *
 * Callers are responsible for building the `GraphileConfig.Preset` (including
 * pgServices, grafserv options, grafast context, etc.) before passing it here.
 *
 * When `enableRealtime` is true, a RealtimeManager is created that bridges
 * cursor-tracked events from `drain_changes()` into the PostGraphile
 * instance's PgSubscriber EventEmitter.  Both `pgSubscriber` and the pg
 * pool are extracted from the resolved preset's pgServices — no separate
 * pool parameter is needed.
 */
export const createGraphileInstance = async (
  opts: GraphileInstanceOptions
): Promise<GraphileCacheEntry> => {
  const { preset, cacheKey, enableRealtime = false } = opts;

  const pgl = postgraphile(preset);
  const resolvedPreset = pgl.getResolvedPreset();
  const releasePresetServices = createPresetServicesReleaser(resolvedPreset);
  const serv = pgl.createServ(grafserv);

  const handler = express();
  const httpServer = createServer(handler);
  let failedBuildReleasePromise: Promise<void> | null = null;
  const releaseFailedBuild = (): Promise<void> => {
    if (failedBuildReleasePromise) return failedBuildReleasePromise;
    failedBuildReleasePromise = (async () => {
      const failures: unknown[] = [];
      try {
        await pgl.release();
      } catch (error) {
        failures.push(error);
      }
      try {
        await releasePresetServices();
      } catch (error) {
        failures.push(error);
      }
      if (failures.length === 1) throw failures[0];
      if (failures.length > 1) throw new AggregateError(failures, 'Graphile service cleanup failed');
    })();
    return failedBuildReleasePromise;
  };

  await awaitGraphileBuildReadiness({
    schemaResult: pgl.getSchemaResult(),
    addTo: () => serv.addTo(handler, httpServer),
    ready: () => serv.ready(),
    release: releaseFailedBuild,
    onReleaseError: (releaseError) => {
      log.error(
        'Graphile build cleanup failed',
        { stage: 'failed-build-release' }
      );
    }
  });

  const entry: GraphileCacheEntry = {
    pgl,
    serv,
    handler,
    httpServer,
    cacheKey,
    createdAt: Date.now(),
    releasePresetServices
  };

  if (enableRealtime) {
    try {
      // Extract PgSubscriber and pool from the resolved preset's pgServices.
      // The pool is the same instance managed by pg-cache (via getPgPool)
      // and threaded into the preset by makePgService({ pool, schemas }).
      const pgService = (resolvedPreset as any).pgServices?.[0];
      const pgSubscriber = pgService?.pgSubscriber ?? null;
      const pool = pgService?.adaptorSettings?.pool ?? null;

      if (!pgSubscriber) {
        throw new Error('Realtime requires a PostgreSQL subscriber');
      } else if (!pool) {
        throw new Error('Realtime requires a PostgreSQL pool');
      } else {
        const manager = new RealtimeManager({
          pgSubscriber,
          pool,
          nodeId: `graphile-cache:${cacheKey}`,
          schema: 'realtime_public',
        });

        entry.realtimeManager = manager;
        await manager.start();
        log.info(`RealtimeManager started for PostGraphile[${cacheKey}]`);
      }
    } catch (err) {
      try {
        await disposeUncachedEntry(entry);
      } catch (cleanupError) {
        throw new AggregateError([err, cleanupError], 'Realtime startup and cleanup failed', { cause: err });
      }
      throw err;
    }
  }

  return entry;
};
