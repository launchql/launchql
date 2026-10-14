import { SystemLanePgClient, withSystemLaneClient } from '../system-lane';

interface Call {
  text: string;
  values?: unknown[];
}

/**
 * A client whose `withTransaction` behaves like grafast's: it brackets the
 * callback with BEGIN and COMMIT, and rolls back when the callback throws.
 */
const makeClient = (): { client: SystemLanePgClient; calls: Call[] } => {
  const calls: Call[] = [];
  const client: SystemLanePgClient = {
    query: async (opts) => {
      calls.push(opts);
      return { rows: [] };
    },
    withTransaction: async (cb) => {
      calls.push({ text: 'BEGIN' });
      try {
        const result = await cb(client);
        calls.push({ text: 'COMMIT' });
        return result;
      } catch (err) {
        calls.push({ text: 'ROLLBACK' });
        throw err;
      }
    }
  };
  return { client, calls };
};

const makeWithPgClient = (
  client: SystemLanePgClient,
  settings: Array<Record<string, string> | null>
) =>
  (<T,>(pgSettings: Record<string, string> | null, cb: (c: SystemLanePgClient) => Promise<T>) => {
    settings.push(pgSettings);
    return cb(client);
  }) as <T>(
    pgSettings: Record<string, string> | null,
    cb: (c: SystemLanePgClient) => Promise<T>
  ) => Promise<T>;

describe('withSystemLaneClient', () => {
  it('runs the callback in one transaction as the connection login, with no role switch', async () => {
    const { client, calls } = makeClient();
    const settings: Array<Record<string, string> | null> = [];

    const result = await withSystemLaneClient(makeWithPgClient(client, settings), async (tx) => {
      await tx.query({ text: 'SELECT 1' });
      return 'ok';
    });

    expect(result).toBe('ok');
    expect(settings).toEqual([null]);
    expect(calls.map((c) => c.text)).toEqual([
      'BEGIN',
      'SELECT 1',
      'COMMIT'
    ]);
  });

  it('leaves the rollback to the client and rethrows the callback failure', async () => {
    const { client, calls } = makeClient();

    await expect(
      withSystemLaneClient(makeWithPgClient(client, []), async () => {
        throw new Error('boom');
      })
    ).rejects.toThrow('boom');

    expect(calls.map((c) => c.text)).toEqual([
      'BEGIN',
      'ROLLBACK'
    ]);
  });
});
