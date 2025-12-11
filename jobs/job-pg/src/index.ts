/* eslint-disable no-console */

import { Pool, PoolConfig } from 'pg';
import env from './env';

// k8s only does SIGINT
// other events are bad for babel-watch
const SYS_EVENTS = [
  // 'SIGUSR2',
  'SIGINT'
  // 'SIGTERM',
  // 'SIGPIPE',
  // 'SIGHUP',
  // 'SIGABRT'
];

function once<T extends (...args: unknown[]) => unknown>(
  fn: T,
  context?: unknown
): (...args: Parameters<T>) => ReturnType<T> | undefined {
  let called = false;
  let result: ReturnType<T> | undefined;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!called && fn) {
      // context is just forwarded through, it is not inspected
      result = fn.apply((context ?? this) as never, args) as ReturnType<T>;
      called = true;
    }
    return result;
  };
}

const getDbString = (): string =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const pgPoolConfig: PoolConfig = {
  connectionString: getDbString()
};

const end = (pool: Pool): void => {
  try {
    // Pool has internal state flags, but they are not part of the public type
    const state = pool as unknown as {
      ended?: boolean;
      ending?: boolean;
    };
    if (state.ended || state.ending) {
      console.error(
        'DO NOT CLOSE pool, why are you trying to call end() when already ended?'
      );
      return;
    }
    void pool.end();
    console.log('successfully closed pool.');
  } catch (e) {
    process.stderr.write(String(e));
  }
};

// Callbacks registered for pool close events can accept arbitrary arguments
// (we forward whatever was passed to `onClose`).
type PoolCloseCallback = (...args: any[]) => Promise<void> | void;

class PoolManager {
  private pgPool: Pool;
  private callbacks: Array<[PoolCloseCallback, any, any[]]>;
  private _closed: boolean;

  constructor({ pgPool = new Pool(pgPoolConfig) }: { pgPool?: Pool } = {}) {
    this.pgPool = pgPool;
    this.callbacks = [];
    this._closed = false;

    const closeOnce = once(async () => {
      console.log('closing pg pool manager...');
      await this.close();
    }, this);

    SYS_EVENTS.forEach((event) => {
      process.on(event, closeOnce);
    });
  }

  onClose(fn: PoolCloseCallback, context?: any, args: any[] = []): void {
    this.callbacks.push([fn, context, args]);
  }

  getPool(): Pool {
    return this.pgPool;
  }

  async close(): Promise<void> {
    if (this._closed) return;

    for (const [fn, context, args] of this.callbacks) {
      console.log('closing fn', fn.name);
      await fn.apply(context, args);
    }

    end(this.pgPool);
    this._closed = true;
  }
}

const mngr = new PoolManager();

export default mngr;
