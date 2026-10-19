import {
  ProvisionPendingError,
  type ProvisionRequestExecutor,
  type ProvisionTicket,
  requestDatabaseProvision,
} from '../src/provision-database/request-database';

// What the SDK throws: an HTTP status from the adapter, a GraphQL error, or a
// fetch that never got a response.
const httpError = (status: number) =>
  Object.assign(new Error(`GraphQL Error: HTTP ${status}`), {
    errors: [{ message: `HTTP ${status}` }],
  });
const graphqlError = (message: string) =>
  Object.assign(new Error(`GraphQL Error: ${message}`), { errors: [{ message }] });
const networkError = () => new TypeError('fetch failed');

function ticket(overrides: Partial<ProvisionTicket> = {}): ProvisionTicket {
  return {
    id: 'ticket-1',
    status: 'pending',
    bootstrapStatus: 'pending',
    databaseId: null,
    errorMessage: null,
    bootstrapError: null,
    ...overrides,
  };
}

const done = ticket({ status: 'completed', bootstrapStatus: 'completed', databaseId: 'db-id' });

function run(args: {
  initial: ProvisionTicket;
  polls?: (ProvisionTicket | null | Error)[];
  deadlineMs?: number;
}) {
  const polls = [...(args.polls ?? [])];
  const pollCalls: string[] = [];
  const request = jest.fn(async () => args.initial);
  const executor: ProvisionRequestExecutor = {
    request,
    poll: async (ticketId) => {
      pollCalls.push(ticketId);
      const next = polls.shift();
      if (next === undefined) throw new Error('unexpected extra poll');
      if (next instanceof Error) throw next;
      return next;
    },
  };
  const promise = requestDatabaseProvision({
    apiEndpoint: 'http://api.test/graphql',
    modulesEndpoint: 'http://modules.test/graphql',
    bearer: 'bearer-token',
    databaseName: 'my_app',
    domain: 'localhost',
    request: { presetSlug: 'b2b:storage' },
    executor,
    pollIntervalMs: 0,
    pollDeadlineMs: args.deadlineMs ?? 5_000,
  });
  return { promise, request, pollCalls };
}

describe('requestDatabaseProvision', () => {
  it('sends databaseName, subdomain (= databaseName), domain, and the request branch', async () => {
    const { promise, request } = run({ initial: done });
    await promise;
    expect(request).toHaveBeenCalledWith({
      databaseName: 'my_app',
      subdomain: 'my_app',
      domain: 'localhost',
      request: { presetSlug: 'b2b:storage' },
    });
  });

  it('resolves a fully completed ticket without ever polling', async () => {
    const { promise, pollCalls } = run({ initial: done });
    await expect(promise).resolves.toEqual({ databaseId: 'db-id', ticketId: 'ticket-1' });
    expect(pollCalls).toEqual([]);
  });

  it('waits for the deferred bootstrap on a warm claim (completed + bootstrap pending)', async () => {
    const { promise, pollCalls } = run({
      initial: ticket({ status: 'completed', databaseId: 'db-id' }),
      polls: [done],
    });
    await expect(promise).resolves.toEqual({ databaseId: 'db-id', ticketId: 'ticket-1' });
    expect(pollCalls).toEqual(['ticket-1']);
  });

  it('polls a cold ticket through pending → in_progress → completed → bootstrap completed', async () => {
    const { promise, pollCalls } = run({
      initial: ticket(),
      polls: [
        ticket({ status: 'in_progress' }),
        ticket({ status: 'completed', databaseId: 'db-id' }),
        done,
      ],
    });
    await expect(promise).resolves.toEqual({ databaseId: 'db-id', ticketId: 'ticket-1' });
    expect(pollCalls).toHaveLength(3);
  });

  it('surfaces errorMessage when the ticket fails before the first poll', async () => {
    const { promise, pollCalls } = run({
      initial: ticket({ status: 'failed', errorMessage: 'database "my_app" already exists' }),
    });
    await expect(promise).rejects.toThrow('database "my_app" already exists');
    expect(pollCalls).toEqual([]);
  });

  it('surfaces errorMessage when a polled ticket fails', async () => {
    const { promise } = run({
      initial: ticket(),
      polls: [ticket({ status: 'failed', errorMessage: 'provision job crashed' })],
    });
    await expect(promise).rejects.toThrow('provision job crashed');
  });

  it('surfaces bootstrapError when the owner bootstrap fails', async () => {
    const { promise } = run({
      initial: ticket({ status: 'completed', databaseId: 'db-id' }),
      polls: [
        ticket({
          status: 'completed',
          databaseId: 'db-id',
          bootstrapStatus: 'failed',
          bootstrapError: 'owner copy failed',
        }),
      ],
    });
    await expect(promise).rejects.toThrow('owner copy failed');
  });

  it('rejects a completed ticket without a databaseId', async () => {
    const { promise } = run({
      initial: ticket({ status: 'completed', bootstrapStatus: 'completed' }),
    });
    await expect(promise).rejects.toThrow(/no databaseId/);
  });

  it('rejects a ticket without an id', async () => {
    const { promise } = run({ initial: ticket({ id: null }) });
    await expect(promise).rejects.toThrow(/without an id/);
  });

  it('tolerates three consecutive failed polls, then continues', async () => {
    const { promise } = run({
      initial: ticket(),
      polls: [httpError(502), null, networkError(), done],
    });
    await expect(promise).resolves.toEqual({ databaseId: 'db-id', ticketId: 'ticket-1' });
  });

  it('leaves the ticket pending after the fourth consecutive unreachable poll', async () => {
    const { promise, pollCalls } = run({
      initial: ticket(),
      polls: [httpError(502), httpError(502), networkError(), httpError(503)],
    });
    await expect(promise).rejects.toBeInstanceOf(ProvisionPendingError);
    await expect(promise).rejects.toMatchObject({ ticketId: 'ticket-1' });
    expect(pollCalls).toHaveLength(4);
  });

  it('fails at once when a poll gets a GraphQL or auth error, without calling it pending', async () => {
    for (const error of [graphqlError('permission denied for table database_provision_module'), httpError(401)]) {
      const { promise, pollCalls } = run({ initial: ticket(), polls: [error] });
      await expect(promise).rejects.toThrow(/could not be read/);
      await expect(promise).rejects.not.toBeInstanceOf(ProvisionPendingError);
      expect(pollCalls).toHaveLength(1);
    }
  });

  it('resets the failure budget after a readable poll', async () => {
    const { promise } = run({
      initial: ticket(),
      polls: [
        httpError(502),
        null,
        httpError(502),
        ticket({ status: 'in_progress' }),
        networkError(),
        null,
        httpError(502),
        done,
      ],
    });
    await expect(promise).resolves.toEqual({ databaseId: 'db-id', ticketId: 'ticket-1' });
  });

  it('times out a ticket that never completes', async () => {
    const { promise, pollCalls } = run({ initial: ticket(), deadlineMs: 0 });
    await expect(promise).rejects.toThrow(/timed out.*status: pending.*bootstrapStatus: pending/);
    expect(pollCalls).toEqual([]);
  });
});
