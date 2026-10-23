// The provision request provision_database stopped waiting on, as recorded in
// a project's .env. requestDatabase never resumes by name, so the ticket is
// the only way back to a provision that is still running.

import {
  archiveBindingKeys,
  type EnvVars,
  mergeEnv,
  PENDING_PROVISION_KEYS,
  readEnv,
  removeEnvKeys,
} from './env-file';

/**
 * Pending results recorded for one ticket before provision_database stops
 * following it. At the default 240 s deadline that is about 20 minutes.
 */
export const MAX_PENDING_ATTEMPTS = 5;

export type PendingTicket = {
  ticketId: string;
  databaseName: string;
  apiEndpoint: string;
  userId: string;
  /** Pending results recorded for this ticket so far. */
  attempts: number;
};

const KEYS = Object.values(PENDING_PROVISION_KEYS);

/**
 * Tickets the host told provisioning to stop following (`abandonPending`),
 * comma-separated. A lookup by name skips them, so an abandoned provision is
 * never resumed.
 */
export const ABANDONED_TICKETS_KEY = 'PROVISION_TICKET_ABANDONED';

/** The newest abandoned ids kept; older ones are long finished or failed. */
const MAX_ABANDONED = 10;

/**
 * The recorded ticket, with the name, backend and account it was requested
 * for. Only a ticket from this backend and account is ours to poll, and one
 * for another name is a different database.
 */
export function recordedTicket(env: EnvVars): PendingTicket | undefined {
  const ticketId = env[PENDING_PROVISION_KEYS.ticketId];
  if (!ticketId) return undefined;
  const attempts = Number.parseInt(env[PENDING_PROVISION_KEYS.attempts] ?? '', 10);
  return {
    ticketId,
    databaseName: env[PENDING_PROVISION_KEYS.databaseName] ?? '',
    apiEndpoint: env[PENDING_PROVISION_KEYS.apiEndpoint] ?? '',
    userId: env[PENDING_PROVISION_KEYS.userId] ?? '',
    attempts: Number.isFinite(attempts) && attempts > 0 ? attempts : 0,
  };
}

export function recordPendingTicket(content: string, ticket: PendingTicket): string {
  return mergeEnv(content, {
    [PENDING_PROVISION_KEYS.ticketId]: ticket.ticketId,
    [PENDING_PROVISION_KEYS.databaseName]: ticket.databaseName,
    [PENDING_PROVISION_KEYS.apiEndpoint]: ticket.apiEndpoint,
    [PENDING_PROVISION_KEYS.userId]: ticket.userId,
    [PENDING_PROVISION_KEYS.attempts]: String(ticket.attempts),
  });
}

export function clearPendingTicket(content: string): string {
  return removeEnvKeys(content, KEYS);
}

/** Comment the record out (`# archived <date>: …`), keeping it readable. */
export function archivePendingTicket(content: string, archivedOn: string): string {
  return archiveBindingKeys(content, KEYS, archivedOn);
}

export function abandonedTickets(env: EnvVars): Set<string> {
  return new Set(
    (env[ABANDONED_TICKETS_KEY] ?? '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

/** Add ticket ids to the abandoned list. */
export function recordAbandoned(content: string, ticketIds: readonly string[]): string {
  const ids = [...new Set([...abandonedTickets(readEnv(content)), ...ticketIds])].slice(-MAX_ABANDONED);
  return mergeEnv(content, { [ABANDONED_TICKETS_KEY]: ids.join(',') });
}
