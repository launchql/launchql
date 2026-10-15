// Provision a database through the api endpoint's requestDatabase mutation —
// the pool-aware entry point. The mutation returns a ticket (a
// database_provision_module row) immediately: a warm-pool claim arrives
// 'completed' with the deferred owner bootstrap still pending; a cold request
// arrives 'pending' and is fulfilled asynchronously by the backend's jobs
// worker. The ticket is polled on the MODULES endpoint (the api endpoint has
// no ticket query) until BOTH status and bootstrapStatus are 'completed': pi
// hands credentials to the agent as soon as this resolves, and until owner
// bootstrap completes the new database has zero users, so its per-DB API
// would reject the owner token under RLS. requestDatabase owns the database
// to the JWT user — there is no owner input. The generated ORM's default
// adapter is plain fetch, so the SDK's FetchAdapter is injected to keep
// *.localhost DNS/Host routing working in Node.

import { api, modules } from '@constructive-io/sdk';

import { sleep } from '../backend-fetch';
import type { ProvisionModule } from './presets';

/**
 * Exactly one of presetSlug or modules — requestDatabase rejects both/neither
 * (REQUEST_DATABASE_INVALID_INPUT). `selectProvisionRequest` (preset-match.ts)
 * builds this from the resolved module set.
 */
export type ProvisionRequest = { presetSlug: string } | { modules: ProvisionModule[] };

export type ProvisionTicket = {
  id?: string | null;
  status?: string | null;
  bootstrapStatus?: string | null;
  databaseId?: string | null;
  errorMessage?: string | null;
  bootstrapError?: string | null;
};

/**
 * Request + poll seam, injectable for tests (pattern: db-probe's
 * ProbeExecutor). The default executor drives the SDK clients.
 */
export type ProvisionRequestExecutor = {
  request(input: {
    databaseName: string;
    subdomain: string;
    domain: string;
    request: ProvisionRequest;
  }): Promise<ProvisionTicket>;
  poll(ticketId: string): Promise<ProvisionTicket | null>;
};

export const POLL_INTERVAL_MS = 2_000;
/** Stays under airpage's 5-minute per-tool timeout. */
export const POLL_DEADLINE_MS = 240_000;
/**
 * Consecutive unreadable polls tolerated before giving up. Provisioning keeps
 * running server-side, so a dropped request or a momentary 502 must not abort
 * a creation that is about to succeed.
 */
export const MAX_CONSECUTIVE_POLL_FAILURES = 3;

const TICKET_SELECT = {
  id: true,
  status: true,
  bootstrapStatus: true,
  databaseId: true,
  errorMessage: true,
  bootstrapError: true,
} as const;

type RequestDatabaseInput = Parameters<
  ReturnType<typeof api.createClient>['mutation']['requestDatabase']
>[0]['input'];

function createSdkExecutor(args: {
  apiEndpoint: string;
  modulesEndpoint: string;
  bearer: string;
  fetch?: typeof globalThis.fetch;
  pollFetch?: typeof globalThis.fetch;
}): ProvisionRequestExecutor {
  const headers = { Authorization: `Bearer ${args.bearer}` };
  const apiClient = api.createClient({
    adapter: new api.FetchAdapter(args.apiEndpoint, headers, args.fetch),
  });
  const modulesClient = modules.createClient({
    adapter: new api.FetchAdapter(args.modulesEndpoint, headers, args.pollFetch ?? args.fetch),
  });
  return {
    async request(input) {
      const requestInput: RequestDatabaseInput = {
        databaseName: input.databaseName,
        subdomain: input.subdomain,
        domain: input.domain,
        ...('presetSlug' in input.request
          ? { presetSlug: input.request.presetSlug }
          : { modules: input.request.modules as unknown as RequestDatabaseInput['modules'] }),
      };
      const result = await apiClient.mutation
        .requestDatabase({ input: requestInput }, { select: { result: { select: TICKET_SELECT } } })
        .unwrap();
      const ticket = result.requestDatabase?.result;
      if (!ticket) throw new Error('requestDatabase returned no provision ticket.');
      return ticket;
    },
    async poll(ticketId) {
      const result = await modulesClient.databaseProvisionModule
        .findOne({ id: ticketId, select: TICKET_SELECT })
        .unwrap();
      return result.databaseProvisionModule ?? null;
    },
  };
}

/**
 * Request a database and resolve only when it is fully usable: ticket
 * `status` AND `bootstrapStatus` both 'completed'. The ticket the mutation
 * returns is checked before the first sleep, so a warm claim with bootstrap
 * already done never waits. `status: 'failed'` surfaces `errorMessage`;
 * `bootstrapStatus: 'failed'` surfaces `bootstrapError`.
 */
export async function requestDatabaseProvision(args: {
  apiEndpoint: string;
  modulesEndpoint: string;
  bearer: string;
  databaseName: string;
  domain: string;
  request: ProvisionRequest;
  executor?: ProvisionRequestExecutor;
  /** Sends the requestDatabase mutation. */
  fetch?: typeof globalThis.fetch;
  /** Sends the ticket polls. Defaults to `fetch`. */
  pollFetch?: typeof globalThis.fetch;
  /** Stops the poll loop and its waits. */
  signal?: AbortSignal;
  pollIntervalMs?: number;
  pollDeadlineMs?: number;
}): Promise<{ databaseId: string }> {
  const executor =
    args.executor ??
    createSdkExecutor({
      apiEndpoint: args.apiEndpoint,
      modulesEndpoint: args.modulesEndpoint,
      bearer: args.bearer,
      fetch: args.fetch,
      pollFetch: args.pollFetch,
    });
  const intervalMs = args.pollIntervalMs ?? POLL_INTERVAL_MS;
  const deadlineMs = args.pollDeadlineMs ?? POLL_DEADLINE_MS;

  let ticket = await executor.request({
    databaseName: args.databaseName,
    subdomain: args.databaseName,
    domain: args.domain,
    request: args.request,
  });
  const ticketId = ticket.id;
  if (!ticketId) throw new Error('requestDatabase returned a provision ticket without an id.');

  const deadline = Date.now() + deadlineMs;
  let failures = 0;
  for (;;) {
    if (ticket.status === 'failed') {
      throw new Error(ticket.errorMessage ?? 'provisioning failed');
    }
    if (ticket.bootstrapStatus === 'failed') {
      throw new Error(ticket.bootstrapError ?? 'owner bootstrap failed');
    }
    if (ticket.status === 'completed' && ticket.bootstrapStatus === 'completed') {
      if (!ticket.databaseId) throw new Error('provisioning completed but returned no databaseId.');
      return { databaseId: ticket.databaseId };
    }
    if (Date.now() >= deadline) {
      throw new Error(
        `provisioning timed out after ${Math.round(deadlineMs / 1000)}s (status: ${
          ticket.status ?? 'unknown'
        }, bootstrapStatus: ${ticket.bootstrapStatus ?? 'unknown'})`,
      );
    }

    await sleep(intervalMs, args.signal);

    // A poll that throws (network blip, 502) or comes back empty is retried a
    // few times rather than failing a provision that is still running.
    let polled: ProvisionTicket | null;
    try {
      polled = await executor.poll(ticketId);
    } catch (err) {
      args.signal?.throwIfAborted();
      if (++failures > MAX_CONSECUTIVE_POLL_FAILURES) throw err;
      continue;
    }
    if (!polled) {
      if (++failures > MAX_CONSECUTIVE_POLL_FAILURES) {
        throw new Error(`provision ticket ${ticketId} could not be read back.`);
      }
      continue;
    }
    failures = 0;
    ticket = polled;
  }
}
