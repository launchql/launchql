// Building a blueprint: constructBlueprint enqueues a `blueprint:construct`
// job and returns the construction id at once (constructive-db#4156). A worker
// builds one blueprint at a time, each under a 120 s statement timeout, and
// moves the construction row pending → constructing → constructed | failed,
// with a failed build's coded error in `error`. A backend from before that
// builds inside the mutation and raises the build's error from it, so the
// first read already says constructed, and the same wait serves both.

import type { ModulesClient } from './context';
import { isTransientProvisionError } from './provision-database/request-database';

/**
 * How long a tool waits for its build: the build's own 120 s statement
 * timeout, plus as long again for the builds queued ahead of it (a cold build
 * of a curated blueprint takes 15-40 s). It stays under the 5-minute limit
 * hosts put on the long database tools, so the tool reports the wait itself
 * instead of being cut off.
 */
export const CONSTRUCTION_DEADLINE_MS = 240_000;
export const CONSTRUCTION_POLL_MS = 2_000;
/**
 * Unreadable statuses in a row tolerated before giving up. The build goes on
 * whether or not a read gets through, so a dropped request or a momentary 502
 * must not end the wait.
 */
export const MAX_CONSECUTIVE_READ_FAILURES = 3;

const MAY_STILL_FINISH =
  'The build may still finish on the backend: read the schema before you call again.';

/** Table name → id, for the tables a construction created. */
export type ConstructionTableMap = Record<string, string>;

export type WaitForConstructionOptions = {
  signal?: AbortSignal;
  deadlineMs?: number;
  pollMs?: number;
  now?: () => number;
  sleep?: (ms: number, signal?: AbortSignal) => Promise<void>;
};

const errorText = (err: unknown) => (err instanceof Error ? err.message : String(err));

function stopped(): Error {
  return new Error(`Stopped waiting for the blueprint build. ${MAY_STILL_FINISH}`);
}

function abortableSleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(stopped());
    const onAbort = () => {
      clearTimeout(timer);
      reject(stopped());
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

function tableMapOf(raw: unknown): ConstructionTableMap {
  if (!raw || typeof raw !== 'object') return {};
  return Object.fromEntries(
    Object.entries(raw).filter((entry): entry is [string, string] => typeof entry[1] === 'string'),
  );
}

/**
 * A failed construction's coded error on one line: `CODE: message` for a
 * database error, `CODE {context}` for one raised through errors.raise_error.
 */
function describeConstructionError(error: unknown): string | null {
  if (!error || typeof error !== 'object') return null;
  const { code, message, context } = error as { code?: unknown; message?: unknown; context?: unknown };
  const head = [code, message].filter((part) => typeof part === 'string' && part).join(': ');
  const hasContext = Boolean(context && typeof context === 'object' && Object.keys(context).length);
  const tail = hasContext ? JSON.stringify(context) : '';
  return [head, tail].filter(Boolean).join(' ') || null;
}

type ConstructionSelect = Parameters<ModulesClient['blueprintConstruction']['findOne']>[0]['select'];

/**
 * Why a construction failed, from its `error` column. That column came with
 * the queued build, and the modules SDK predates it, so it is read on its own
 * after a failure: the status reads stay valid on a backend without it. The
 * SDK's select type doesn't list `error`, but the ORM writes each select key
 * as the field name.
 */
export async function readConstructionFailure(
  modules: ModulesClient,
  constructionId: string,
): Promise<string> {
  try {
    const result = await modules.blueprintConstruction
      .findOne({ id: constructionId, select: { error: true } as ConstructionSelect })
      .unwrap();
    const row = result.blueprintConstruction as { error?: unknown } | null;
    return describeConstructionError(row?.error) ?? 'the backend gave no reason';
  } catch (err) {
    return `the backend gave no reason (reading it failed: ${errorText(err)})`;
  }
}

/**
 * Wait for a construction to finish. Resolves with its table map once it is
 * constructed, and throws with the backend's coded error once it failed, or
 * when the deadline passes, the signal aborts, or its status can't be read.
 */
export async function waitForConstruction(
  modules: ModulesClient,
  constructionId: string,
  options: WaitForConstructionOptions = {},
): Promise<ConstructionTableMap> {
  const {
    signal,
    deadlineMs = CONSTRUCTION_DEADLINE_MS,
    pollMs = CONSTRUCTION_POLL_MS,
    now = Date.now,
    sleep = abortableSleep,
  } = options;
  const deadline = now() + deadlineMs;
  let status = 'pending';
  let readFailures = 0;

  for (;;) {
    if (signal?.aborted) throw stopped();
    let row: { status?: string | null; tableMap?: unknown } | null | undefined;
    try {
      const result = await modules.blueprintConstruction
        .findOne({ id: constructionId, select: { status: true, tableMap: true } })
        .unwrap();
      row = result.blueprintConstruction;
      readFailures = 0;
    } catch (err) {
      // A GraphQL error is the backend's answer and won't change on a reread.
      if (!isTransientProvisionError(err) || ++readFailures >= MAX_CONSECUTIVE_READ_FAILURES) {
        throw new Error(
          `Could not read the blueprint build's status: ${errorText(err)}. ${MAY_STILL_FINISH}`,
        );
      }
    }
    if (row === null) throw new Error(`The backend has no blueprint construction ${constructionId}.`);
    if (row?.status === 'constructed') return tableMapOf(row.tableMap);
    if (row?.status === 'failed') {
      throw new Error(
        `The blueprint build failed: ${await readConstructionFailure(modules, constructionId)}`,
      );
    }
    status = row?.status ?? status;
    if (now() >= deadline) {
      const where = status === 'pending' ? "waiting in the backend's build queue" : 'building';
      throw new Error(
        `The blueprint build was still ${where} after ${Math.round(deadlineMs / 1000)} s. ${MAY_STILL_FINISH}`,
      );
    }
    await sleep(pollMs, signal);
  }
}

/**
 * Construct a blueprint into a schema and wait for the build. Resolves with
 * the created tables; throws with the backend's reason when it fails.
 */
export async function buildBlueprint(
  modules: ModulesClient,
  input: { blueprintId: string; schemaId: string },
  options: WaitForConstructionOptions = {},
): Promise<ConstructionTableMap> {
  const result = await modules.mutation
    .constructBlueprint({ input }, { select: { result: true } })
    .unwrap();
  const constructionId = result.constructBlueprint?.result;
  if (!constructionId) throw new Error('constructBlueprint returned no construction id');
  return waitForConstruction(modules, constructionId, options);
}
