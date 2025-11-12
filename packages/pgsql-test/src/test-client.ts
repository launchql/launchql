import { Client, QueryResult } from 'pg';
import { PgConfig } from 'pg-env';
import { AuthOptions, PgTestConnectionOptions, PgTestClientContext } from '@launchql/types';
import { getRoleName } from './roles';

export type PgTestClientOpts = {
  deferConnect?: boolean;
  trackConnect?: (p: Promise<any>) => void;
} & Partial<PgTestConnectionOptions>;

export class PgTestClient {
  public config: PgConfig;
  public client: Client;
  private opts: PgTestClientOpts;
  private ctxStmts: string = '';
  private contextSettings: PgTestClientContext = {};
  private _ended: boolean = false;
  private connectPromise: Promise<void> | null = null;

  constructor(config: PgConfig, opts: PgTestClientOpts = {}) {
    this.opts = opts;
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
    Object.assign(this.contextSettings, ctx);
    
    this.ctxStmts = Object.entries(this.contextSettings)
      .map(([key, val]) =>
        val === null
          ? `SELECT set_config('${key}', NULL, true);`
          : `SELECT set_config('${key}', '${val}', true);`
      )
      .join('\n');
  }

  /**
   * Set authentication context for the current session.
   * Configures role and user ID using cascading defaults from options → opts.auth → RoleMapping.
   */
  auth(options: AuthOptions = {}): void {
    const role =
      options.role ?? this.opts.auth?.role ?? getRoleName('authenticated', this.opts);
    const userIdKey =
      options.userIdKey ?? this.opts.auth?.userIdKey ?? 'jwt.claims.user_id';
    const userId =
      options.userId ?? this.opts.auth?.userId ?? null;

    this.setContext({
      role,
      [userIdKey]: userId !== null ? String(userId) : null
    });
  }

  /**
   * Commit current transaction to make data visible to other connections, then start fresh transaction.
   * Maintains test isolation by creating a savepoint and reapplying session context.
   */
  async publish(): Promise<void> {
    await this.commit();    // make data visible to other sessions
    await this.begin();     // fresh tx
    await this.savepoint(); // keep rollback harness
    await this.ctxQuery();  // reapply all setContext()
  }

  /**
   * Clear all session context variables and reset to default anonymous role.
   */
  clearContext(): void {
    const defaultRole = getRoleName('anonymous', this.opts);
    
    const nulledSettings: Record<string, string | null> = {};
    Object.keys(this.contextSettings).forEach(key => {
      nulledSettings[key] = null;
    });
    
    nulledSettings.role = defaultRole;
    
    this.ctxStmts = Object.entries(nulledSettings)
      .map(([key, val]) =>
        val === null
          ? `SELECT set_config('${key}', NULL, true);`
          : `SELECT set_config('${key}', '${val}', true);`
      )
      .join('\n');
    
    this.contextSettings = { role: defaultRole };
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

  async loadJson(data: import('./seed/json').JsonSeedMap): Promise<void> {
    await this.ctxQuery(); // Apply context before loading data (important-comment)
    const { insertJson } = await import('./seed/json');
    await insertJson(this.client, this.contextSettings, data);
  }

  async loadCsv(tables: import('./seed/csv').CsvSeedMap): Promise<void> {
    await this.ctxQuery(); // Apply context before loading data (important-comment)
    const { loadCsvMap } = await import('./seed/csv');
    await loadCsvMap(this.client, this.contextSettings, tables);
  }

  async loadSql(files: string[]): Promise<void> {
    await this.ctxQuery(); // Apply context before loading data (important-comment)
    const { loadSqlFiles } = await import('./seed/sql');
    await loadSqlFiles(this.client, this.contextSettings, files);
  }

  async loadLaunchql(cwd?: string, cache: boolean = false): Promise<void> {
    await this.ctxQuery(); // Apply context before loading data (important-comment)
    const { deployLaunchql } = await import('./seed/launchql');
    await deployLaunchql(this.client, this.contextSettings, this.config, cwd, cache);
  }

}
