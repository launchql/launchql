import { Client, QueryResult } from 'pg';
import { PgConfig } from 'pg-env';
import { AuthOptions } from '@launchql/types';

type PgTestClientOpts = {
  deferConnect?: boolean;
  trackConnect?: (p: Promise<any>) => void;
  auth?: AuthOptions;
};

export class PgTestClient {
  public config: PgConfig;
  public client: Client;
  private ctxStmts: string = '';
  private _ended: boolean = false;
  private connectPromise: Promise<void> | null = null;

  constructor(config: PgConfig, opts: PgTestClientOpts = {}) {
    this.config = config;
    this.client = new Client({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password
    });
    if (!opts.deferConnect) {
      this.connectPromise = this.client.connect();
      if (opts.trackConnect) opts.trackConnect(this.connectPromise);
      if (opts.auth) {
        this.connectPromise = this.connectPromise.then(() => this.auth(opts.auth));
      }
    }
  }

  private async ensureConnected(): Promise<void> {
    if (this.connectPromise) {
      try {
        await this.connectPromise;
      } catch {}
    }
  }

  async close(): Promise<void> {
    if (!this._ended) {
      this._ended = true;
      await this.ensureConnected();
      this.client.end();
    }
  }

  async begin(): Promise<void> {
    await this.client.query('BEGIN;');
  }

  async savepoint(name: string = 'lqlsavepoint'): Promise<void> {
    await this.client.query(`SAVEPOINT "${name}";`);
  }

  async rollback(name: string = 'lqlsavepoint'): Promise<void> {
    await this.client.query(`ROLLBACK TO SAVEPOINT "${name}";`);
  }

  async commit(): Promise<void> {
    await this.client.query('COMMIT;');
  }

  async beforeEach(): Promise<void> {
    await this.begin();
    await this.savepoint();
  }

  async afterEach(): Promise<void> {
    await this.rollback();
    await this.commit();
  }

  setContext(ctx: Record<string, string | null>): void {
    this.ctxStmts = Object.entries(ctx)
      .map(([key, val]) =>
        val === null
          ? `SELECT set_config('${key}', NULL, true);`
          : `SELECT set_config('${key}', '${val}', true);`
      )
      .join('\n');
  }

  async auth(options?: AuthOptions): Promise<void> {
    const role = options?.role ?? (this.config as any).auth?.role ?? null;
    const userIdKey =
      options?.userIdKey ?? (this.config as any).auth?.userIdKey ?? 'jwt.claims.user_id';
    const userId =
      options?.userId ?? (this.config as any).auth?.userId ?? null;

    this.setContext({
      role,
      [userIdKey]: userId !== null ? String(userId) : null
    });
  }

  async any<T = any>(query: string, values?: any[]): Promise<T[]> {
    const result = await this.query(query, values);
    return result.rows;
  }

  async one<T = any>(query: string, values?: any[]): Promise<T> {
    const rows = await this.any<T>(query, values);
    if (rows.length !== 1) {
      throw new Error('Expected exactly one result');
    }
    return rows[0];
  }

  async oneOrNone<T = any>(query: string, values?: any[]): Promise<T | null> {
    const rows = await this.any<T>(query, values);
    return rows[0] || null;
  }

  async many<T = any>(query: string, values?: any[]): Promise<T[]> {
    const rows = await this.any<T>(query, values);
    if (rows.length === 0) throw new Error('Expected many rows, got none');
    return rows;
  }

  async manyOrNone<T = any>(query: string, values?: any[]): Promise<T[]> {
    return this.any<T>(query, values);
  }

  async none(query: string, values?: any[]): Promise<void> {
    await this.query(query, values);
  }

  async result(query: string, values?: any[]): Promise<import('pg').QueryResult> {
    return this.query(query, values);
  }

  async query<T = any>(query: string, values?: any[]): Promise<QueryResult<T>> {
    await this.ctxQuery();
    const result = await this.client.query<T>(query, values);
    return result;
  }  

  async ctxQuery(): Promise<void> {
    if (this.ctxStmts) {
      await this.client.query(this.ctxStmts);
    }
  }  

}
