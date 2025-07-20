import { Client, QueryResult } from 'pg';
import { PgConfig } from 'pg-env';

export class PgTestClient {
  public config: PgConfig;
  public client: Client;
  private ctxStmts: string = '';
  private _ended: boolean = false;

  constructor(config: PgConfig) {
    this.config = config;
    this.client = new Client({
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.user,
      password: this.config.password
    });
    this.client.connect();
  }

  close(): void {
    if (!this._ended) {
      this._ended = true;
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

  // exposing so we can use for graphile-test
  async ctxQuery(): Promise<void> {
    if (this.ctxStmts) {
      await this.client.query(this.ctxStmts);
    }
  }  

}
