import type { Pool } from 'pg';

import {
  clearAgentDiscoveryCache,
  getAgentDiscovery
} from '../src/plugins/agent-discovery-plugin';

const DB_A = '00000000-0000-0000-0000-00000000000a';
const DB_B = '00000000-0000-0000-0000-00000000000b';

const row = (prefix: string): Record<string, string | null> => ({
  schema_name: `${prefix}_agent_public`,
  thread_table_name: 'agent_thread',
  message_table_name: 'agent_message',
  task_table_name: null
});

interface Call {
  text: string;
  values?: unknown[];
}

const fakePool = (respond: (values: unknown[]) => { rows: unknown[] }) => {
  const calls: Call[] = [];
  const pool = {
    query: jest.fn(async (text: string, values?: unknown[]) => {
      calls.push({ text, values });
      return respond(values ?? []);
    })
  } as unknown as Pool;
  return { pool, calls };
};

const pgError = (code: string) => Object.assign(new Error(`pg error ${code}`), { code });

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void;
  const promise = new Promise<void>(res => {
    resolve = res;
  });
  return { promise, resolve };
}

beforeEach(() => clearAgentDiscoveryCache());

describe('getAgentDiscovery', () => {
  it('resolves each tenant its own agent tables', async () => {
    // The unkeyed query this replaced returned the same row to both, and the
    // per-database cache then made the wrong answer stick for its TTL.
    const { pool, calls } = fakePool(values => ({
      rows: [row(values[0] === DB_A ? 'a' : 'b')]
    }));

    const a = await getAgentDiscovery(pool, DB_A);
    const b = await getAgentDiscovery(pool, DB_B);

    expect(calls.map(c => c.values)).toEqual([[DB_A], [DB_B]]);
    expect(calls[0].text).toMatch(/WHERE acm\.database_id = \$1/);
    expect(a?.thread?.schemaName).toBe('a_agent_public');
    expect(b?.thread?.schemaName).toBe('b_agent_public');
  });

  it('caches per database id, not across databases', async () => {
    const { pool, calls } = fakePool(values => ({
      rows: [row(values[0] === DB_A ? 'a' : 'b')]
    }));

    await getAgentDiscovery(pool, DB_A);
    await getAgentDiscovery(pool, DB_A);
    expect(calls).toHaveLength(1);

    await getAgentDiscovery(pool, DB_B);
    expect(calls).toHaveLength(2);
  });

  it('does not share discovery across physical pool identities', async () => {
    const first = fakePool(() => ({ rows: [row('physical_a')] }));
    const second = fakePool(() => ({ rows: [row('physical_b')] }));

    const fromFirst = await getAgentDiscovery(first.pool, DB_A);
    const fromSecond = await getAgentDiscovery(second.pool, DB_A);

    expect(fromFirst?.thread?.schemaName).toBe('physical_a_agent_public');
    expect(fromSecond?.thread?.schemaName).toBe('physical_b_agent_public');
    expect(first.calls).toHaveLength(1);
    expect(second.calls).toHaveLength(1);
  });

  it('keeps overlapping same-database discovery isolated by pool identity', async () => {
    const gate = deferred();
    const first = fakePool(() => ({ rows: [row('overlap_a')] }));
    const second = fakePool(() => ({ rows: [row('overlap_b')] }));
    const firstQuery = first.pool.query as jest.Mock;
    const secondQuery = second.pool.query as jest.Mock;
    firstQuery.mockImplementation(async (text: string, values?: unknown[]) => {
      first.calls.push({ text, values });
      await gate.promise;
      return { rows: [row('overlap_a')] };
    });
    secondQuery.mockImplementation(async (text: string, values?: unknown[]) => {
      second.calls.push({ text, values });
      await gate.promise;
      return { rows: [row('overlap_b')] };
    });

    const pending = Promise.all([
      getAgentDiscovery(first.pool, DB_A),
      getAgentDiscovery(second.pool, DB_A),
    ]);
    expect(first.calls).toHaveLength(1);
    expect(second.calls).toHaveLength(1);
    gate.resolve();

    const [fromFirst, fromSecond] = await pending;
    const [cachedFirst, cachedSecond] = await Promise.all([
      getAgentDiscovery(first.pool, DB_A),
      getAgentDiscovery(second.pool, DB_A),
    ]);

    expect(fromFirst?.thread?.schemaName).toBe('overlap_a_agent_public');
    expect(fromSecond?.thread?.schemaName).toBe('overlap_b_agent_public');
    expect(cachedFirst).toBe(fromFirst);
    expect(cachedSecond).toBe(fromSecond);
    expect(first.calls).toHaveLength(1);
    expect(second.calls).toHaveLength(1);
  });

  it('treats an absent module as not provisioned', async () => {
    const { pool } = fakePool(() => {
      throw pgError('42P01');
    });
    await expect(getAgentDiscovery(pool, DB_A)).resolves.toBeNull();
  });

  it('rethrows anything that is not the absence it probes for', async () => {
    // A dead pool reported as "not provisioned" is an API that silently loses
    // its agent surface.
    const { pool } = fakePool(() => {
      throw pgError('57P01'); // admin_shutdown
    });
    await expect(getAgentDiscovery(pool, DB_A)).rejects.toThrow(/57P01/);
  });

  it('refuses a missing databaseId rather than querying unkeyed', async () => {
    const { pool, calls } = fakePool(() => ({ rows: [] }));
    await expect(getAgentDiscovery(pool, '')).rejects.toThrow(/databaseId is required/);
    expect(calls).toHaveLength(0);
  });
});
