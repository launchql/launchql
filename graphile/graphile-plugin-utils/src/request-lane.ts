/**
 * Run a callback under the request's pgSettings inside ONE explicit transaction.
 *
 * The grafast context's `withPgClient(pgSettings, cb)` applies pgSettings as
 * transaction-LOCAL `set_config(key, value, is_local => true)`. When `cb` issues
 * more than one statement WITHOUT an explicit surrounding transaction, each
 * statement runs in its own implicit (autocommit) transaction, so a LOCAL
 * setting applied for one statement is already gone by the next. The request
 * role's jwt claims (notably `jwt.claims.database_id`) then vanish between
 * statements, and `jwt_private.current_database_id()` raises
 * DATABASE_CLAIM_REQUIRED even though the request carried the claim.
 *
 * This helper acquires the client without settings (`withPgClient(null, ...)`),
 * opens a single explicit transaction, and applies the request settings inside
 * it — so every statement in `cb` observes the same role and jwt claims. It
 * mirrors the `pg-query-context` pattern used elsewhere in the codebase for
 * manual, multi-statement RLS work.
 */

/** The subset of grafast's PgClient the request lane needs. */
export interface RequestPgClient {
  query(opts: {
    text: string;
    values?: unknown[];
  }): Promise<{ rows: Array<Record<string, unknown>> }>;
  withTransaction<T>(cb: (tx: RequestPgClient) => Promise<T>): Promise<T>;
}

export type WithPgClient = <T>(
  pgSettings: Record<string, string> | null,
  cb: (client: RequestPgClient) => Promise<T>,
) => Promise<T>;

async function applyRequestSettings(
  tx: RequestPgClient,
  pgSettings: Record<string, string> | null,
): Promise<void> {
  if (!pgSettings) return;
  const entries = Object.entries(pgSettings)
    .filter(([, value]) => value != null)
    .map(([key, value]) => [key, String(value)]);
  if (entries.length === 0) return;
  await tx.query({
    text: 'SELECT set_config(el->>0, el->>1, true) FROM json_array_elements($1::json) el',
    values: [JSON.stringify(entries)],
  });
}

export function withRequestPgClient<T>(
  withPgClient: WithPgClient,
  pgSettings: Record<string, string> | null,
  cb: (tx: RequestPgClient) => Promise<T>,
): Promise<T> {
  return withPgClient(null, (client) =>
    client.withTransaction(async (tx) => {
      await applyRequestSettings(tx, pgSettings);
      return cb(tx);
    }),
  );
}
