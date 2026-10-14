import '../middleware/types'; // for Request type

import type { Refusal, RefusalReason, RefusalRecorderStats } from '@constructive-io/express-context';
import {
  clientIpFrom,
  createRecordRefusalsSink,
  RefusalRecorder,
  trustedProxyHops
} from '@constructive-io/express-context';
import type { ConstructiveOptions } from '@constructive-io/graphql-types';
import { Logger } from '@pgpmjs/logger';
import type { Request } from 'express';
import type { Pool } from 'pg';
import { getPgPool } from 'pg-cache';

const log = new Logger('refusals');

/**
 * refusals/recorder — the GraphQL lane's `RefusalRecorder`.
 *
 * One recorder per process, installed by the server at startup and read by
 * every refusal site through `recordRefusal`. Emitters never see the recorder,
 * the pool or a promise: `recordRefusal` is a synchronous counter bump that
 * cannot fail the response being written around it. A harness that mounts a
 * middleware without a server has no recorder installed and the call is a
 * no-op.
 *
 * ## Flush identity
 *
 * A flush runs outside any tenant request, so it establishes its own identity
 * at the top of its transaction: the `platform-bootstrap` service principal
 * (`jwt.claims.user_id` / `principal_id`) attributed to the platform database
 * (`jwt.claims.database_id`, `entity_id`, `entity_type`) as the platform
 * `system` role type (`jwt.claims.role_type`), which the generated writer's
 * guard and RESTRICTIVE insert policy require. Those are the claims every
 * other unattended platform write carries; resolving them is the
 * claim-establishment step at the entry point, not a lookup inside the
 * function being called — `record_refusals` raises if the claims are missing.
 * Resolution is cached after the first success; a failure is reported by the
 * recorder as a failed flush (loud, every interval) and retried next time.
 *
 * @module refusals/recorder
 */

/** The principal an unattended platform write acts as. */
export const PLATFORM_BOOTSTRAP_PRINCIPAL = 'platform-bootstrap';

let installed: RefusalRecorder | null = null;

/** Make `recorder` the process's recorder. Returns the previous one, if any. */
export const installRefusalRecorder = (recorder: RefusalRecorder | null): RefusalRecorder | null => {
  const previous = installed;
  installed = recorder;
  return previous;
};

export const getRefusalRecorder = (): RefusalRecorder | null => installed;

export const getRefusalRecorderStats = (): RefusalRecorderStats | null => installed?.stats() ?? null;

/** The route half of a refusal key — the same shape admission control keys on. */
export const routeKeyOf = (req: Request): string =>
  `${req.method} ${req.baseUrl ?? ''}${req.path ?? req.url ?? ''}`;

/**
 * How far back through `X-Forwarded-For` to believe; mirrors admission
 * control's resolution so the refusal source is the same address the limiter
 * keyed on.
 */
const resolveHops = (req: Request, configured?: number): number => {
  if (typeof configured === 'number') return configured;
  const fromEnv = trustedProxyHops();
  if (fromEnv > 0) return fromEnv;
  return req.app?.get('trust proxy') ? 1 : 0;
};

export interface RecordRefusalOptions {
  /** Overrides the address the refusal is attributed to. */
  sourceIp?: string | null;
  /** See `AdmissionControlOptions.trustedProxyHops`. */
  trustedProxyHops?: number;
  /** Overrides `req.databaseId`. */
  databaseId?: string | null;
}

/**
 * Count one GraphQL-lane refusal. Synchronous; never throws; does nothing
 * when no recorder is installed.
 */
export const recordRefusal = (req: Request, reason: RefusalReason, opts: RecordRefusalOptions = {}): void => {
  const recorder = installed;
  if (!recorder) return;
  const refusal: Refusal = {
    databaseId: opts.databaseId !== undefined ? opts.databaseId : req.databaseId ?? null,
    lane: 'graphql',
    reason,
    routeKey: routeKeyOf(req),
    sourceIp:
      opts.sourceIp !== undefined
        ? opts.sourceIp
        : clientIpFrom(req, resolveHops(req, opts.trustedProxyHops))
  };
  try {
    recorder.record(refusal);
  } catch (err) {
    // The refusal response is already being written; a broken recorder is
    // reported here and via the recorder's own stats, never to the client.
    log.error(`refusal not recorded reason=${reason}: ${err instanceof Error ? err.message : String(err)}`);
  }
};

interface PlatformFlushIdentity {
  databaseId: string;
  actorId: string;
  principalId: string;
}

/**
 * Resolve the claims a flush runs under: the platform database and the
 * `platform-bootstrap` service principal's user row. Throws — with the row
 * that was missing named — rather than returning a partial identity.
 */
export const resolvePlatformFlushIdentity = async (
  pool: Pool,
  principalName = PLATFORM_BOOTSTRAP_PRINCIPAL
): Promise<PlatformFlushIdentity> => {
  const database = await pool.query<{ id: string }>(
    `SELECT id FROM metaschema_public.database WHERE platform IS TRUE`
  );
  if (database.rowCount !== 1) {
    throw new Error(
      `refusals: expected exactly one platform database (metaschema_public.database.platform), found ${database.rowCount}`
    );
  }
  const principal = await pool.query<{ user_id: string; bypass_step_up: boolean }>(
    `SELECT user_id, bypass_step_up FROM constructive_auth_public.principals WHERE name = $1`,
    [principalName]
  );
  if (principal.rowCount !== 1) {
    throw new Error(`refusals: no service principal named '${principalName}'`);
  }
  if (principal.rows[0].bypass_step_up !== true) {
    throw new Error(`refusals: principal '${principalName}' is not a service principal (no bypass_step_up)`);
  }
  return {
    databaseId: database.rows[0].id,
    actorId: principal.rows[0].user_id,
    principalId: principal.rows[0].user_id
  };
};

export const platformFlushClaims = (identity: PlatformFlushIdentity): Record<string, string> => ({
  'jwt.claims.database_id': identity.databaseId,
  'jwt.claims.user_id': identity.actorId,
  'jwt.claims.principal_id': identity.principalId,
  'jwt.claims.entity_id': identity.databaseId,
  'jwt.claims.entity_type': 'database',
  'jwt.claims.role_type': 'system'
});

export interface PlatformRefusalRecorderOptions {
  intervalMs?: number;
  jitterMs?: number;
  maxKeys?: number;
  principalName?: string;
}

/**
 * The recorder the server runs: counts in memory, flushes into
 * `constructive_usage_private.record_refusals` on the platform pool under the
 * platform flush identity. Not started; the caller owns start/stop.
 */
export const createPlatformRefusalRecorder = (
  opts: ConstructiveOptions,
  recorderOpts: PlatformRefusalRecorderOptions = {}
): RefusalRecorder => {
  const pool = getPgPool(opts.pg);
  let cached: Record<string, string> | null = null;
  const claims = async (): Promise<Record<string, string>> => {
    if (cached) return cached;
    cached = platformFlushClaims(await resolvePlatformFlushIdentity(pool, recorderOpts.principalName));
    log.info(`[refusals] flushing as '${recorderOpts.principalName ?? PLATFORM_BOOTSTRAP_PRINCIPAL}'`);
    return cached;
  };
  return new RefusalRecorder({
    sink: createRecordRefusalsSink({ pool, claims }),
    intervalMs: recorderOpts.intervalMs,
    jitterMs: recorderOpts.jitterMs,
    maxKeys: recorderOpts.maxKeys
  });
};
