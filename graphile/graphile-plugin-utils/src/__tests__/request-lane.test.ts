/**
 * Regression tests for withRequestPgClient.
 *
 * The bug: the grafast context's `withPgClient(pgSettings, cb)` applies the
 * request's jwt claims as transaction-LOCAL `set_config(key, value, is_local =>
 * true)` but does NOT open an explicit transaction around `cb`. When `cb` runs
 * more than one statement, each executes in its own implicit (autocommit)
 * transaction, so a LOCAL setting applied for the set_config statement is gone
 * by the next statement. `jwt_private.current_database_id()` then raised
 * DATABASE_CLAIM_REQUIRED on presigned uploads even though the request carried
 * `jwt.claims.database_id`.
 *
 * The fix: withRequestPgClient acquires the client WITHOUT settings, opens ONE
 * explicit transaction, and applies the settings inside it — so every statement
 * in `cb` observes the same claims.
 *
 * These tests use a small in-memory model of the node-postgres adaptor's
 * transaction-LOCAL semantics so the regression needs no live database.
 */

import { type WithPgClient,withRequestPgClient } from '../request-lane';

const SET_CONFIG_SQL_RE = /set_config\(el->>0, el->>1, true\)/;

/**
 * Faithful-enough model of the adaptor client around `set_config(..., is_local
 * => true)`: a LOCAL setting lives for the enclosing transaction, or — with no
 * open transaction — only for the single statement that set it (autocommit).
 */
class FakePg {
  txDepth = 0;
  calls: string[] = [];
  private txLocal = new Map<string, string>();
  private stmtLocal = new Map<string, string>();

  private effective(key: string): string | null {
    return this.txLocal.get(key) ?? this.stmtLocal.get(key) ?? null;
  }

  async query(opts: { text: string; values?: unknown[] }): Promise<{ rows: Array<Record<string, unknown>> }> {
    this.calls.push(opts.text.replace(/\s+/g, ' ').trim());

    if (SET_CONFIG_SQL_RE.test(opts.text)) {
      const entries = JSON.parse(String(opts.values?.[0] ?? '[]')) as Array<[string, string]>;
      for (const [key, value] of entries) {
        if (this.txDepth > 0) this.txLocal.set(key, value);
        else this.stmtLocal.set(key, value);
      }
      if (this.txDepth === 0) this.stmtLocal.clear();
      return { rows: [{}] };
    }

    const match = /current_setting\('([^']+)'/.exec(opts.text);
    const rows: Array<Record<string, unknown>> = match
      ? [{ v: this.effective(match[1]) }]
      : [{}];
    if (this.txDepth === 0) this.stmtLocal.clear();
    return { rows };
  }

  async withTransaction<T>(cb: (tx: FakePg) => Promise<T>): Promise<T> {
    this.txDepth++;
    this.calls.push('BEGIN');
    try {
      const result = await cb(this);
      this.calls.push('COMMIT');
      return result;
    } catch (err) {
      this.calls.push('ROLLBACK');
      throw err;
    } finally {
      this.txDepth--;
      if (this.txDepth === 0) this.txLocal.clear();
    }
  }
}

function makeWithPgClient(pg: FakePg): { withPgClient: WithPgClient; settingsSeen: Array<Record<string, string> | null> } {
  const settingsSeen: Array<Record<string, string> | null> = [];
  const withPgClient = (async (pgSettings, cb) => {
    settingsSeen.push(pgSettings);
    // The adaptor applies request pgSettings via a LOCAL set_config in the same
    // lane WITHOUT opening an explicit transaction — this is the buggy path.
    if (pgSettings) {
      await pg.query({
        text: 'SELECT set_config(el->>0, el->>1, true) FROM json_array_elements($1::json) el',
        values: [JSON.stringify(Object.entries(pgSettings))],
      });
    }
    return cb(pg as never);
  }) as WithPgClient;
  return { withPgClient, settingsSeen };
}

const readClaim = "SELECT current_setting('jwt.claims.database_id', true) AS v";

describe('withRequestPgClient', () => {
  it('reproduces the bug: a LOCAL claim is lost across autocommit statements', async () => {
    const pg = new FakePg();
    const { withPgClient } = makeWithPgClient(pg);

    // Directly using withPgClient(pgSettings, cb) — no surrounding transaction.
    const claim = await withPgClient({ 'jwt.claims.database_id': 'db-1' }, async (client) => {
      const result = await client.query({ text: readClaim });
      return result.rows[0]?.v ?? null;
    });

    expect(claim).toBeNull();
  });

  it('keeps the claim visible across every statement inside the transaction', async () => {
    const pg = new FakePg();
    const { withPgClient } = makeWithPgClient(pg);

    const claim = await withRequestPgClient(
      withPgClient,
      { role: 'authenticated', 'jwt.claims.database_id': 'db-1' },
      async (tx) => {
        await tx.query({ text: 'SELECT 1' });
        const result = await tx.query({ text: readClaim });
        return result.rows[0]?.v ?? null;
      },
    );

    expect(claim).toBe('db-1');
  });

  it('acquires the client without settings and wraps work in one transaction', async () => {
    const pg = new FakePg();
    const { withPgClient, settingsSeen } = makeWithPgClient(pg);

    await withRequestPgClient(
      withPgClient,
      { 'jwt.claims.database_id': 'db-1' },
      async (tx) => tx.query({ text: readClaim }),
    );

    // The helper must NOT pass request pgSettings to withPgClient — it applies
    // them itself inside the transaction.
    expect(settingsSeen).toEqual([null]);

    // BEGIN → set_config → work → COMMIT, in that order.
    expect(pg.calls[0]).toBe('BEGIN');
    expect(pg.calls[1]).toMatch(SET_CONFIG_SQL_RE);
    expect(pg.calls[2]).toBe(readClaim);
    expect(pg.calls[pg.calls.length - 1]).toBe('COMMIT');
  });

  it('opens a transaction but issues no set_config when there are no settings', async () => {
    for (const settings of [null, {}] as Array<Record<string, string> | null>) {
      const pg = new FakePg();
      const { withPgClient } = makeWithPgClient(pg);

      await withRequestPgClient(withPgClient, settings, async (tx) => tx.query({ text: 'SELECT 1' }));

      expect(pg.calls).toContain('BEGIN');
      expect(pg.calls).toContain('COMMIT');
      expect(pg.calls.filter((c) => SET_CONFIG_SQL_RE.test(c))).toHaveLength(0);
    }
  });

  it('propagates callback errors (never swallows) and rolls back', async () => {
    const pg = new FakePg();
    const { withPgClient } = makeWithPgClient(pg);

    await expect(
      withRequestPgClient(withPgClient, { 'jwt.claims.database_id': 'db-1' }, async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');

    expect(pg.calls).toContain('ROLLBACK');
    expect(pg.calls).not.toContain('COMMIT');
  });
});
