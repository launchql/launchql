import type { Pool } from 'pg';

import { requestProtectionLoader } from '../src/loaders/request-protection';
import type { LoaderContext } from '../src/loaders/types';
import {
  DEFAULT_REQUEST_PROTECTION,
  PROTECTION_BOUNDS,
  protectionPgSettings,
  resolveRequestProtection
} from '../src/request-protection';

describe('resolveRequestProtection', () => {
  it('falls back to the platform default when neither scope has a preference', () => {
    const resolved = resolveRequestProtection(null, null);
    expect(resolved).toEqual(DEFAULT_REQUEST_PROTECTION);
    expect(resolved.statementTimeoutMs).toBe(PROTECTION_BOUNDS.statementTimeoutMs.default);
  });

  it('inherits a database setting when the API expresses nothing', () => {
    const resolved = resolveRequestProtection({ statementTimeoutMs: 5_000 }, {});
    expect(resolved.statementTimeoutMs).toBe(5_000);
  });

  it('lets an API override lower a database setting', () => {
    const resolved = resolveRequestProtection(
      { statementTimeoutMs: 20_000 },
      { statementTimeoutMs: 2_000 }
    );
    expect(resolved.statementTimeoutMs).toBe(2_000);
  });

  it('refuses to let an API override raise a database setting', () => {
    const resolved = resolveRequestProtection(
      { statementTimeoutMs: 5_000 },
      { statementTimeoutMs: 90_000 }
    );
    expect(resolved.statementTimeoutMs).toBe(5_000);
  });

  it('clamps a value written above the platform ceiling', () => {
    const resolved = resolveRequestProtection({ statementTimeoutMs: 999_999_999 }, null);
    expect(resolved.statementTimeoutMs).toBe(PROTECTION_BOUNDS.statementTimeoutMs.max);
  });

  it('clamps a value written below the floor, so a tenant cannot brick its own API', () => {
    const resolved = resolveRequestProtection({ statementTimeoutMs: 0 }, null);
    expect(resolved.statementTimeoutMs).toBe(PROTECTION_BOUNDS.statementTimeoutMs.floor);
  });

  it('treats null as "no preference" rather than as zero', () => {
    const resolved = resolveRequestProtection(
      { maxQueryDepth: null, maxPageSize: 10 },
      { maxQueryDepth: null, maxPageSize: null }
    );
    expect(resolved.maxQueryDepth).toBe(PROTECTION_BOUNDS.maxQueryDepth.default);
    expect(resolved.maxPageSize).toBe(10);
  });

  it('leaves introspection on until metadata takes it away, and never puts it back', () => {
    // A database that has expressed no preference — a routing plane older than
    // the column — keeps the introspection its clients already rely on.
    expect(resolveRequestProtection(null, null).enableIntrospection).toBe(true);
    expect(resolveRequestProtection({ enableIntrospection: false }, {}).enableIntrospection).toBe(
      false
    );
    // Lower-only: an API may switch it off for itself, never back on.
    expect(
      resolveRequestProtection({ enableIntrospection: true }, { enableIntrospection: false })
        .enableIntrospection
    ).toBe(false);
    expect(
      resolveRequestProtection({ enableIntrospection: false }, { enableIntrospection: true })
        .enableIntrospection
    ).toBe(false);
  });

  it('resolves every bound, so a new column cannot silently arrive unresolved', () => {
    const resolved = resolveRequestProtection(null, null);
    for (const key of Object.keys(PROTECTION_BOUNDS)) {
      expect(typeof (resolved as unknown as Record<string, unknown>)[key]).toBe('number');
    }
  });
});

describe('protectionPgSettings', () => {
  it('emits the three timeout GUCs as millisecond integers', () => {
    expect(
      protectionPgSettings({
        ...DEFAULT_REQUEST_PROTECTION,
        statementTimeoutMs: 7_000,
        idleInTransactionTimeoutMs: 8_000,
        lockTimeoutMs: 900
      })
    ).toEqual({
      statement_timeout: '7000',
      idle_in_transaction_session_timeout: '8000',
      lock_timeout: '900'
    });
  });

  it('carries no other setting, so it can be merged into any pgSettings', () => {
    expect(Object.keys(protectionPgSettings(DEFAULT_REQUEST_PROTECTION))).toHaveLength(3);
  });
});

// ─── Loader ─────────────────────────────────────────────────────────────────

interface Call {
  text: string;
  values?: unknown[];
}

/** A routing pool that answers the settings rows in order. */
const fakePool = (rows: unknown[][]) => {
  const calls: Call[] = [];
  let i = 0;
  const pool = {
    query: jest.fn(async (text: string, values?: unknown[]) => {
      calls.push({ text, values });
      return { rows: rows[i++] ?? [] };
    })
  } as unknown as Pool;
  return { pool, calls };
};

const ctx = (routingPool: Pool, databaseId = 'db-1', apiId?: string): LoaderContext =>
  ({
    routingPool,
    tenantPool: {} as Pool,
    databaseId,
    apiId,
    dbname: 'tenant'
  }) as LoaderContext;

describe('requestProtectionLoader', () => {
  beforeEach(() => {
    requestProtectionLoader.invalidate();
  });

  it('binds the database and API it was asked about', async () => {
    const { pool, calls } = fakePool([[{ db_statement_timeout_ms: '5000' }]]);

    await requestProtectionLoader.resolve(ctx(pool, 'db-a', 'api-a'));

    expect(calls[0].values).toEqual(['db-a', 'api-a']);
    expect(calls[0].text).toMatch(/function_resolution\.request_protection/);
  });

  it('reads a bigint back as a number rather than a string', async () => {
    // node-postgres returns bigint as a string; an unparsed value would sail
    // through the clamp as NaN and land on the default.
    const { pool } = fakePool([[{ db_statement_timeout_ms: '4000', db_lock_timeout_ms: '250' }]]);

    const resolved = await requestProtectionLoader.resolve(ctx(pool));

    expect(resolved?.statementTimeoutMs).toBe(4_000);
    expect(resolved?.lockTimeoutMs).toBe(250);
  });

  it('applies the API override as a lower-only bound', async () => {
    const { pool } = fakePool([
      [
        {
          db_statement_timeout_ms: '20000',
          api_statement_timeout_ms: '3000',
          db_max_page_size: 200,
          api_max_page_size: 900
        }
      ]
    ]);

    const resolved = await requestProtectionLoader.resolve(ctx(pool, 'db-a', 'api-a'));

    expect(resolved?.statementTimeoutMs).toBe(3_000);
    expect(resolved?.maxPageSize).toBe(200);
  });

  it('keeps two APIs on one database apart in the cache', async () => {
    const { pool } = fakePool([
      [{ db_statement_timeout_ms: '20000', api_statement_timeout_ms: '3000' }],
      [{ db_statement_timeout_ms: '20000', api_statement_timeout_ms: '9000' }]
    ]);

    const first = await requestProtectionLoader.resolve(ctx(pool, 'db-a', 'api-1'));
    const second = await requestProtectionLoader.resolve(ctx(pool, 'db-a', 'api-2'));

    expect(first?.statementTimeoutMs).toBe(3_000);
    expect(second?.statementTimeoutMs).toBe(9_000);
  });

  it('returns nothing when the database has no settings row, so the caller uses the defaults', async () => {
    const { pool } = fakePool([[]]);
    expect(await requestProtectionLoader.resolve(ctx(pool))).toBeUndefined();
  });

  it('reads both scopes through the login-only reader, not the RLS-protected tables', async () => {
    const { pool, calls } = fakePool([[{ db_statement_timeout_ms: '5000' }]]);

    await requestProtectionLoader.resolve(ctx(pool, 'db-reader'));

    expect(calls[0].text).toMatch(/FROM function_resolution\.request_protection\(\$1, \$2\)/);
    expect(calls[0].text).not.toMatch(/routing_public|information_schema/);
  });
});
