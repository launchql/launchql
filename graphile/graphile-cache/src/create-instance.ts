import { createServer } from 'node:http';

import { Logger } from '@pgpmjs/logger';
import express from 'express';
import { grafserv } from 'grafserv/express/v4';
import { RealtimeManager } from 'graphile-realtime-subscriptions';
import { postgraphile } from 'postgraphile';

import { disposeUncachedEntry, type GraphileCacheEntry } from './graphile-cache';
import { awaitGraphileBuildReadiness } from './utils/build-readiness';
import { createPresetServicesReleaser } from './utils/preset-services';
import { releaseFailedBuild } from './utils/release-failed-build';

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
 * Each generation owns its HTTP server and the services in its resolved preset.
 * Supply fresh services for each generation; externally supplied pools remain
 * caller-owned. Failed readiness or realtime startup releases that generation.
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
  let serv!: ReturnType<typeof grafserv>;
  let handler!: ReturnType<typeof express>;
  let httpServer!: ReturnType<typeof createServer>;

  await awaitGraphileBuildReadiness({
    schemaResult: async () => {
      await pgl.getSchemaResult();
    },
    addTo: () => {
      handler = express();
      httpServer = createServer(handler);
      serv = pgl.createServ(grafserv);
      return serv.addTo(handler, httpServer);
    },
    ready: () => serv.ready(),
    release: () => releaseFailedBuild(pgl, releasePresetServices, httpServer),
    onReleaseError: (releaseError) => {
      log.error(`Failed to release PostGraphile[${cacheKey}] after build failure:`, releaseError);
    },
  });

  const entry: GraphileCacheEntry = {
    pgl,
    serv,
    handler,
    httpServer,
    cacheKey,
    createdAt: Date.now(),
    releasePresetServices,
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
