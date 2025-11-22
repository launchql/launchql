import type { QueryArrayConfig, QueryConfig, QueryResult, QueryResultRow } from 'pg';
import { PgTestClient } from 'pgsql-test';

/**
 * A wrapper around PgTestClient that implements the pg.Client query interface.
 * This allows Drizzle to work seamlessly with PgTestClient's context management.
 * 
 * The key insight is that Drizzle calls the underlying pg.Client's query() method directly,
 * which bypasses PgTestClient's ctxQuery() that applies SET LOCAL statements for RLS testing.
 * This adapter intercepts all query calls and ensures ctxQuery() is called first.
 */
export class DrizzleTestClient {
  constructor(private testClient: PgTestClient) {}

  /**
   * Query method that handles all Drizzle query calls.
   * Ensures ctxQuery() is called before each query execution to apply context (SET LOCAL statements).
   */
  async query<T extends QueryResultRow = any>(
    queryTextOrConfig: string | QueryConfig | QueryArrayConfig,
    values?: any[]
  ): Promise<QueryResult<T>> {
    // Apply context before query (this is the critical step that makes RLS work)
    await this.testClient.ctxQuery();

    // Handle different query signatures that Drizzle might use
    if (typeof queryTextOrConfig === 'string') {
      // Direct string query: query('SELECT * FROM users', [1])
      return await this.testClient.client.query<T>(queryTextOrConfig, values);
    } else if ('text' in queryTextOrConfig) {
      // QueryConfig or QueryArrayConfig object: query({ text: 'SELECT...', values: [...] })
      const config = queryTextOrConfig as QueryConfig | QueryArrayConfig;
      if (values !== undefined) {
        // If values are passed separately, use them
        return await this.testClient.client.query<T>(config, values);
      } else {
        // Otherwise use the config as-is
        return await this.testClient.client.query<T>(config);
      }
    } else {
      throw new Error('Invalid query parameters');
    }
  }

  /**
   * Expose the underlying pg.Client for compatibility.
   * Some Drizzle operations might need direct access to client properties.
   */
  get client() {
    return this.testClient.client;
  }

  /**
   * Pass-through methods to maintain full PgTestClient functionality
   */
  async end() {
    return this.testClient.close();
  }

  async connect() {
    // PgTestClient auto-connects in constructor
    // This is here for interface compatibility with pg.Client
    return Promise.resolve();
  }

  /**
   * Expose underlying PgTestClient for test setup/teardown
   */
  getTestClient(): PgTestClient {
    return this.testClient;
  }

  /**
   * Transaction management methods - pass through to PgTestClient
   */
  async begin() {
    return this.testClient.begin();
  }

  async savepoint(name?: string) {
    return this.testClient.savepoint(name);
  }

  async rollback(name?: string) {
    return this.testClient.rollback(name);
  }

  async commit() {
    return this.testClient.commit();
  }

  /**
   * Test isolation methods - pass through to PgTestClient
   */
  async beforeEach() {
    return this.testClient.beforeEach();
  }

  async afterEach() {
    return this.testClient.afterEach();
  }

  /**
   * Context management methods - pass through to PgTestClient
   */
  setContext(ctx: Record<string, string | null>) {
    this.testClient.setContext(ctx);
  }

  auth(options?: Parameters<typeof this.testClient.auth>[0]) {
    this.testClient.auth(options);
  }

  /**
   * Commit current transaction to make data visible to other connections,
   * then start fresh transaction. Maintains test isolation.
   */
  async publish() {
    return this.testClient.publish();
  }

  clearContext() {
    this.testClient.clearContext();
  }
}
