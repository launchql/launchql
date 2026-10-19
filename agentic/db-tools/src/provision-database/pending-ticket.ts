// The provision request provision_database stopped waiting on, as recorded in
// a project's .env. requestDatabase never resumes by name, so the ticket is
// the only way back to a provision that is still running.

import { type EnvVars, mergeEnv, PENDING_PROVISION_KEYS, removeEnvKeys } from './env-file';

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
 * The recorded ticket when it was requested for this database name, on this
 * backend and by this account. A ticket from another backend or account isn't
 * ours to poll, and one for another name is a different database.
 */
export function matchingPendingTicket(
  env: EnvVars,
  want: { databaseName: string; apiEndpoint: string; userId: string },
): PendingTicket | undefined {
  const ticketId = env[PENDING_PROVISION_KEYS.ticketId];
  if (
    !ticketId ||
    env[PENDING_PROVISION_KEYS.databaseName] !== want.databaseName ||
    env[PENDING_PROVISION_KEYS.apiEndpoint] !== want.apiEndpoint ||
    env[PENDING_PROVISION_KEYS.userId] !== want.userId
  ) {
    return undefined;
  }
  const attempts = Number.parseInt(env[PENDING_PROVISION_KEYS.attempts] ?? '', 10);
  return { ...want, ticketId, attempts: Number.isFinite(attempts) && attempts > 0 ? attempts : 0 };
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
