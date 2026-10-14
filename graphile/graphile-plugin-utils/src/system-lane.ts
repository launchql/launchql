/**
 * The system lane: server-owned reads and writes that are not a tenant
 * session — schema metadata, module registration, storage config.
 *
 * Grafast's `withPgClient(null, cb)` acquires a client with NO settings, so
 * each statement would land in its own implicit transaction. This helper runs
 * `cb` in one transaction as the connection's own login — the single
 * pgpm-created service login, whose grants are the lane's reach. It never
 * switches role: the login is a member of the request roles only, so any
 * other role would be refused. It is the server-owned counterpart to the
 * request lane's `withRequestPgClient`.
 */

/** The subset of grafast's PgClient the system lane needs. */
export interface SystemLanePgClient {
  query(opts: {
    text: string;
    values?: unknown[];
  }): Promise<{ rows: Array<Record<string, unknown>> }>;
  withTransaction<T>(cb: (tx: SystemLanePgClient) => Promise<T>): Promise<T>;
}

export type SystemLaneWithPgClient = <T>(
  pgSettings: Record<string, string> | null,
  cb: (client: SystemLanePgClient) => Promise<T>,
) => Promise<T>;

/**
 * Run `cb` in one transaction as the connection's login. The client's own
 * `withTransaction` owns commit and rollback.
 */
export function withSystemLaneClient<T>(
  withPgClient: SystemLaneWithPgClient,
  cb: (client: SystemLanePgClient) => Promise<T>,
): Promise<T> {
  return withPgClient(null, (client) => client.withTransaction(cb));
}
