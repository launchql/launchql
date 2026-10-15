import { withTimeLimit } from '../src/backend-fetch';
import {
  type ProvisionRequestExecutor,
  type ProvisionTicket,
  requestDatabaseProvision,
} from '../src/provision-database/request-database';
import { PROVISION_STOPPED_MESSAGE } from '../src/tools/provision-database';

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
    signal: new AbortController().signal,
    pollIntervalMs: 0,
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
    await expect(promise).resolves.toEqual({ databaseId: 'db-id' });
    expect(pollCalls).toEqual([]);
  });

  it('waits for the deferred bootstrap on a warm claim (completed + bootstrap pending)', async () => {
    const { promise, pollCalls } = run({
      initial: ticket({ status: 'completed', databaseId: 'db-id' }),
      polls: [done],
    });
    await expect(promise).resolves.toEqual({ databaseId: 'db-id' });
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
    await expect(promise).resolves.toEqual({ databaseId: 'db-id' });
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
      polls: [new Error('502'), null, new Error('network'), done],
    });
    await expect(promise).resolves.toEqual({ databaseId: 'db-id' });
  });

  it('gives up on the fourth consecutive failed poll', async () => {
    const { promise, pollCalls } = run({
      initial: ticket(),
      polls: [new Error('502'), new Error('502'), new Error('502'), new Error('final failure')],
    });
    await expect(promise).rejects.toThrow('final failure');
    expect(pollCalls).toHaveLength(4);
  });

  it('resets the failure budget after a readable poll', async () => {
    const { promise } = run({
      initial: ticket(),
      polls: [
        new Error('502'),
        null,
        new Error('502'),
        ticket({ status: 'in_progress' }),
        new Error('502'),
        null,
        new Error('502'),
        done,
      ],
    });
    await expect(promise).resolves.toEqual({ databaseId: 'db-id' });
  });

  it('polls a ticket that never completes until the provisioning limit stops it', async () => {
    const poll = jest.fn(async () => ticket());
    const promise = requestDatabaseProvision({
      apiEndpoint: 'http://api.test/graphql',
      modulesEndpoint: 'http://modules.test/graphql',
      bearer: 'bearer-token',
      databaseName: 'my_app',
      domain: 'localhost',
      request: { presetSlug: 'b2b:storage' },
      executor: { request: async () => ticket(), poll },
      signal: withTimeLimit(undefined, 50, PROVISION_STOPPED_MESSAGE),
      pollIntervalMs: 5,
    });
    await expect(promise).rejects.toThrow(PROVISION_STOPPED_MESSAGE);
    expect(poll.mock.calls.length).toBeGreaterThan(1);
    expect(PROVISION_STOPPED_MESSAGE).toMatch(/continues on the server/);
    expect(PROVISION_STOPPED_MESSAGE).toMatch(/Run provision_database again to check it/);
  });

  it('stops at once when the signal aborts during the poll wait', async () => {
    const controller = new AbortController();
    const reason = new Error('cancelled');
    const poll = jest.fn();
    const promise = requestDatabaseProvision({
      apiEndpoint: 'http://api.test/graphql',
      modulesEndpoint: 'http://modules.test/graphql',
      bearer: 'bearer-token',
      databaseName: 'my_app',
      domain: 'localhost',
      request: { presetSlug: 'b2b:storage' },
      executor: { request: async () => ticket(), poll },
      signal: controller.signal,
      pollIntervalMs: 60_000,
    });
    setTimeout(() => controller.abort(reason), 5);
    await expect(promise).rejects.toBe(reason);
    expect(poll).not.toHaveBeenCalled();
  });

  it('does not count an aborted poll as a failed poll', async () => {
    const controller = new AbortController();
    const reason = new Error('cancelled');
    const poll = jest.fn(async (): Promise<ProvisionTicket> => {
      controller.abort(reason);
      throw reason;
    });
    const promise = requestDatabaseProvision({
      apiEndpoint: 'http://api.test/graphql',
      modulesEndpoint: 'http://modules.test/graphql',
      bearer: 'bearer-token',
      databaseName: 'my_app',
      domain: 'localhost',
      request: { presetSlug: 'b2b:storage' },
      executor: { request: async () => ticket(), poll },
      signal: controller.signal,
      pollIntervalMs: 0,
    });
    await expect(promise).rejects.toBe(reason);
    expect(poll).toHaveBeenCalledTimes(1);
  });
});
