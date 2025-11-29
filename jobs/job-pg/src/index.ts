/* eslint-disable no-console */

import pg from 'pg';
import pgConfig from './env';
import { getPgPool, teardownPgPools } from 'pg-cache';

type CloseFn = (...args: any[]) => unknown | Promise<unknown>;
interface PoolManagerOptions {
  pgPool?: pg.Pool;
}

// k8s commonly sends SIGINT to app containers during shutdown
const SYS_EVENTS: ReadonlyArray<NodeJS.Signals> = ['SIGINT'];

function once<T extends CloseFn>(fn: T, context?: unknown) {
  let called = false;
  let result: ReturnType<T>;
  return function (this: unknown, ...args: Parameters<T>): ReturnType<T> {
    if (!called) {
      called = true;
      // @ts-expect-error allow dynamic context binding
      result = fn.apply(context ?? this, args);
    }
    return result as ReturnType<T>;
  };
}

const defaultPool = getPgPool(pgConfig);

class PoolManager {
  private readonly pgPool: pg.Pool;
  private readonly callbacks: Array<[CloseFn, unknown?, unknown[]?]> = [];
  private _closed = false;

  constructor({ pgPool = defaultPool }: PoolManagerOptions = {}) {
    this.pgPool = pgPool;
    const closeOnce = once(async () => {
      console.log('closing pg pool manager...');
      await this.close();
    }, this);
    SYS_EVENTS.forEach((event) => {
      process.on(event, closeOnce);
    });
  }

  onClose(fn: CloseFn, context?: unknown, args: unknown[] = []) {
    this.callbacks.push([fn, context, args]);
  }

  getPool(): pg.Pool {
    return this.pgPool;
  }

  async close(): Promise<void> {
    if (this._closed) return;
    for (let i = 0; i < this.callbacks.length; i++) {
      const entry = this.callbacks[i];
      console.log('closing fn', entry[0].name || 'anonymous');
      // apply optional context/args tuple
      await entry[0].apply(entry[1], entry[2] as Parameters<CloseFn>);
    }
    try {
      // Prefer centralized teardown to keep pg-cache consistent
      await teardownPgPools();
      console.log('successfully closed pools via pg-cache.');
    } catch (e) {
      process.stderr.write(String(e));
    }
    this._closed = true;
  }
}

const mngr = new PoolManager();

export { PoolManager };
export default mngr;
