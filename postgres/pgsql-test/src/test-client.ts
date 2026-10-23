import { DeferredConstraintsMode } from '@pgpmjs/types';
import { QueryResult } from 'pg';
import { PgConfig } from 'pg-env';
import { PgClient, PgClientOpts } from 'pgsql-client';
import { insertJsonMap, type JsonSeedMap } from 'pgsql-seed';
import { type CsvSeedMap,loadCsvMap } from 'pgsql-seed';
import { loadSqlFiles } from 'pgsql-seed';
import { deployPgpm } from 'pgsql-seed';

import { formatPgError } from './utils';

export type PgTestClientOpts = PgClientOpts & {
  /**
   * Enable enhanced PostgreSQL error messages with extended fields.
   * Defaults to true. Errors will include detail, hint, where, position, etc.
   * Can be disabled by setting enhancedErrors: false.
   */
  enhancedErrors?: boolean;
  /**
   * How DEFERRABLE INITIALLY DEFERRED constraints are handled under rollback isolation.
   * Defaults to 'off'. See {@link DeferredConstraintsMode}.
   */
  deferredConstraints?: DeferredConstraintsMode;
};

const IN_FAILED_SQL_TRANSACTION = '25P02';
const EXPECT_ERROR_SAVEPOINT = 'pgsql_test_expect_error';

/**
 * What an expected error must match: a substring or RegExp of the message, or
 * an object checking the SQLSTATE `code` and/or the `message`.
 */
export type ExpectedPgError =
  | string
  | RegExp
  | { code?: string; message?: string | RegExp };

const describeExpected = (expected?: ExpectedPgError): string => {
  if (expected === undefined) return 'an error';
  if (typeof expected === 'string' || expected instanceof RegExp) return String(expected);
  return JSON.stringify({
    code: expected.code,
    message: expected.message === undefined ? undefined : String(expected.message)
  });
};

const matchesText = (text: string, pattern: string | RegExp): boolean => {
  if (typeof pattern === 'string') return text.includes(pattern);
  pattern.lastIndex = 0;
  return pattern.test(text);
};

const describeError = (err: any): string =>
  [err?.code, String(err?.message ?? err).split('\n')[0]].filter(Boolean).join(': ');

const matchesExpected = (err: any, expected?: ExpectedPgError): boolean => {
  if (expected === undefined) return true;
  const message = String(err?.message ?? '');
  if (typeof expected === 'string' || expected instanceof RegExp) {
    return matchesText(message, expected);
  }
  if (expected.code !== undefined && err?.code !== expected.code) return false;
  if (expected.message !== undefined && !matchesText(message, expected.message)) return false;
  return true;
};

export class PgTestClient extends PgClient {
  protected testOpts: PgTestClientOpts;

  constructor(config: PgConfig, opts: PgTestClientOpts = {}) {
    super(config, opts);
    this.testOpts = opts;
  }

  /**
   * Check if enhanced errors are enabled. Defaults to true.
   * Can be disabled by setting enhancedErrors: false in options.
   */
  private shouldEnhanceErrors(): boolean {
    // Default to true unless explicitly disabled via option
    return this.testOpts.enhancedErrors !== false;
  }

  /**
   * Override query to enhance PostgreSQL errors with extended fields.
   * When enhancedErrors is enabled, errors will include detail, hint, where, position, etc.
   */
  async query<T = any>(query: string, values?: any[]): Promise<QueryResult<T>> {
    try {
      return await super.query<T>(query, values);
    } catch (err: any) {
      if (this.shouldEnhanceErrors()) {
        // Enhance the error message with PostgreSQL extended fields
        err.message = formatPgError(err, { query, values });
      }
      throw err;
    }
  }

  private get deferredConstraintsMode(): DeferredConstraintsMode {
    return this.testOpts.deferredConstraints ?? 'off';
  }

  async beforeEach(): Promise<void> {
    await this.begin();
    await this.savepoint();
    if (this.deferredConstraintsMode === 'immediate') {
      await this.setConstraintsImmediate();
    }
  }

  async afterEach(): Promise<void> {
    let violation: unknown;
    if (this.deferredConstraintsMode === 'check') {
      try {
        await this.checkConstraints();
      } catch (err: any) {
        if (err?.code !== IN_FAILED_SQL_TRANSACTION) violation = err;
      }
    }
    await this.rollback();
    await this.commit();
    if (violation) throw violation;
  }

  /**
   * Assert that `run` fails, and keep the test transaction usable afterwards.
   *
   * Wraps `run` in a savepoint on this client, rolls back to it whatever happens
   * (so the aborted statement, or an unexpected success, leaves no trace), then
   * releases it. Throws if `run` succeeds or its error does not match `expected`;
   * otherwise returns the caught error for further assertions.
   *
   * `run` must execute on this same client — a savepoint cannot rescue another
   * connection's aborted transaction.
   *
   * @example
   * await db.expectError(() => db.query('INSERT INTO app.secrets ...'), /permission denied/);
   * const err = await db.expectError(() => db.query('...'), { code: '23505' });
   */
  async expectError<E = any>(run: () => Promise<unknown>, expected?: ExpectedPgError): Promise<E> {
    await this.savepoint(EXPECT_ERROR_SAVEPOINT);
    let caught: any;
    let failed = false;
    try {
      await run();
    } catch (err) {
      failed = true;
      caught = err;
    }

    try {
      await this.rollback(EXPECT_ERROR_SAVEPOINT);
      await this.client.query(`RELEASE SAVEPOINT "${EXPECT_ERROR_SAVEPOINT}";`);
    } catch (cleanupError) {
      const outcome = failed ? `run() failed with ${describeError(caught)}` : 'run() succeeded';
      throw new Error(
        `[pgsql-test] expectError: could not roll back its savepoint (${describeError(cleanupError)}); ${outcome}. ` +
          'Did run() end the transaction or run on another client?',
        { cause: failed ? caught : cleanupError }
      );
    }

    if (!failed) {
      throw new Error(`[pgsql-test] expectError: expected ${describeExpected(expected)}, but the statement succeeded`);
    }
    if (!matchesExpected(caught, expected)) {
      throw new Error(`[pgsql-test] expectError: expected ${describeExpected(expected)}, got ${describeError(caught)}`, {
        cause: caught
      });
    }
    return caught as E;
  }

  /**
   * Run the commit-time checks for every pending deferred constraint now, without committing.
   * Postgres checks all outstanding deferred constraint events when a constraint switches from
   * DEFERRED to IMMEDIATE, so this fails exactly where a real COMMIT would have failed.
   * Once it passes (or throws), the pending events are consumed.
   */
  async checkConstraints(): Promise<void> {
    try {
      await this.setConstraintsImmediate();
    } catch (err: any) {
      if (err?.code !== IN_FAILED_SQL_TRANSACTION) {
        err.message = `[pgsql-test] deferred constraint violated at end of test (a real COMMIT would have failed here):\n${err.message}`;
      }
      throw err;
    }
  }

  private async setConstraintsImmediate(): Promise<void> {
    await this.query('SET CONSTRAINTS ALL IMMEDIATE');
  }

  /**
   * Commit current transaction to make data visible to other connections, then start fresh transaction.
   * Maintains test isolation by creating a savepoint and reapplying session context.
   */
  async publish(): Promise<void> {
    await this.commit();    // make data visible to other sessions
    await this.begin();     // fresh tx
    await this.savepoint(); // keep rollback harness
    if (this.deferredConstraintsMode === 'immediate') {
      await this.setConstraintsImmediate();
    }
    await this.ctxQuery();  // reapply all setContext()
  }

  async loadJson(data: JsonSeedMap): Promise<void> {
    await this.ctxQuery();
    await insertJsonMap(this.client, data);
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

  async loadPgpm(cwd?: string, cache: boolean = false): Promise<void> {
    // await this.ctxQuery(); // no point to call ctxQuery() here
    // because deployPgpm() has it's own way of getting the client...
    // so for now, we'll expose this but it's limited
    await deployPgpm(this.config, cwd, cache, { workspace: Boolean(cwd) });
  }

}
