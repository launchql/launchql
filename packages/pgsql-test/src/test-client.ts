import { Client, QueryResult } from 'pg';
import { PgConfig } from 'pg-env';
import { AuthOptions, PgTestConnectionOptions, PgTestClientContext } from '@pgpmjs/types';
import { getRoleName } from './roles';
import { generateContextStatements } from './context-utils';
import { insertJson, type JsonSeedMap } from './seed/json';
import { loadCsvMap, type CsvSeedMap } from './seed/csv';
import { loadSqlFiles } from './seed/sql';
import { deployLaunchql } from './seed/launchql';

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
    this.ctxStmts = generateContextStatements(this.contextSettings);
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
    
    this.ctxStmts = generateContextStatements(nulledSettings);
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

  async ctxQuery(): Promise<void> {
    if (this.ctxStmts) {
      await this.client.query(this.ctxStmts);
    }
  }

  // NOTE: all queries should call ctxQuery() before executing the query

  async query<T = any>(query: string, values?: any[]): Promise<QueryResult<T>> {
    await this.ctxQuery();
    const result = await this.client.query<T>(query, values);
    return result;
  }  

  async loadJson(data: JsonSeedMap): Promise<void> {
    await this.ctxQuery();
    await insertJson(this.client, data);
  }

  async loadSql(files: string[]): Promise<void> {
    await this.ctxQuery();
    await loadSqlFiles(this.client, files);
  }

  // NON-RLS load/seed methods:

  async loadCsv(tables: CsvSeedMap): Promise<void> {
    // await this.ctxQuery(); // no point to call ctxQuery() here
    // because POSTGRES doesn't support row-level security on COPY FROM...
    await loadCsvMap(this.client, tables);
  }

  async loadLaunchql(cwd?: string, cache: boolean = false): Promise<void> {
    // await this.ctxQuery(); // no point to call ctxQuery() here
    // because deployLaunchql() has it's own way of getting the client...
    // so for now, we'll expose this but it's limited
    await deployLaunchql(this.config, cwd, cache);
  }

}
