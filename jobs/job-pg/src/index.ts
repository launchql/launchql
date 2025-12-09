/* eslint-disable no-console */

import pg from 'pg';
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

function once(fn: (...args: any[]) => any, context?: any) {
  let result: any;
  return function (this: any, ...args: any[]) {
    if (fn) {
      result = fn.apply(context || this, args);
      fn = null as any;
    }
    return result;
  };
}

const getDbString = () =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const pgPoolConfig = {
  connectionString: getDbString()
};

const end = (pool: any) => {
  try {
    if (pool.ended || pool.ending) {
      console.error(
        'DO NOT CLOSE pool, why are you trying to call end() when already ended?'
      );
      return;
    }
    pool.end();
    console.log('successfully closed pool.');
  } catch (e) {
    process.stderr.write(String(e));
  }
};

class PoolManager {
  pgPool: any;
  callbacks: [Function, any, any[]?][];
  _closed?: boolean;

  constructor({ pgPool = new (pg as any).Pool(pgPoolConfig) } = {}) {
    this.pgPool = pgPool;
    this.callbacks = [];
    const close = once(async () => {
      console.log('closing pg pool manager...');
      await this.close();
    }, this);
    SYS_EVENTS.forEach((event) => {
      process.on(event, close);
    });
  }
  onClose(fn: (...args: any[]) => any, context?: any, args: any[] = []) {
    this.callbacks.push([fn, context, args]);
  }
  getPool(): any {
    return this.pgPool;
  }
  async close(): Promise<void> {
    if (this._closed) return;
    for (let i = 0; i < this.callbacks.length; i++) {
      const entry = this.callbacks[i];
      console.log('closing fn', entry[0].name);
      await entry[0].apply(entry[1], entry[2]);
    }
    end(this.pgPool);
    this._closed = true;
  }
}

const mngr = new PoolManager();

export default mngr;
