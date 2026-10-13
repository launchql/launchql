import '../middleware/types'; // for Request type

import type { EventsConfig } from '@constructive-io/express-context';
import { Logger } from '@pgpmjs/logger';
import type { Request } from 'express';
import type { GraphileConfig } from 'graphile-config';
import type { GraphQLError } from 'graphql';
import { getOperationAST } from 'graphql';
import { escapeIdentifier, type Pool } from 'pg';
import { withPgClient } from 'pg-query-context';

import { normalizeError } from '../middleware/format-error';

const log = new Logger('error-events');

const getExpressRequest = (
  requestContext: Partial<Grafast.RequestContext> | undefined
): Request | undefined => (requestContext as { expressv4?: { req?: Request } })?.expressv4?.req;

/**
 * The first structured, public-classified registry code among the errors.
 * Internal/unknown errors are bugs, not refusals: they are logged by
 * `formatError` and never recorded as tenant events.
 */
const refusalCode = (errors: readonly GraphQLError[] | undefined): string | undefined => {
  for (const error of errors ?? []) {
    const { code, class: errorClass } = normalizeError(error);
    if (code && errorClass === 'public') return code;
  }
  return undefined;
};

export const recordErrorSql = (events: EventsConfig): string => {
  if (!events.recordError) {
    throw new Error(`events module ${events.privateSchemaName} has no record_error function`);
  }
  return `SELECT ${escapeIdentifier(events.privateSchemaName)}.${escapeIdentifier(events.recordError)}($1, $2::uuid, $3::jsonb)`;
};

/**
 * Records a refused authenticated mutation as an event named after the error
 * code raised by `errors.raise_error`. The refusal rolled back the mutation's
 * own transaction, so the event is written afterwards in a fresh transaction
 * under the same request claims, via the tenant's events module
 * `record_error`, which classifies the code as an error that earns no ladder
 * progress.
 *
 * The server carries no policy: the code is the event, and the database decides
 * what it means — a ladder's `revoked_by` names the code directly (e.g.
 * PRINCIPAL_CHILD_WIDENS demoting a principal on the trust ladder). Endpoints
 * without an events module record nothing. Unauthenticated requests are never
 * recorded, so anonymous traffic cannot drive writes. The client response is
 * never altered.
 */
export const createErrorEventsPlugin = (pool: Pool): GraphileConfig.Plugin => ({
  name: 'ErrorEventsPlugin',
  version: '0.0.0',
  description: 'Records a refused authenticated mutation as its error code through the tenant events module.',

  grafast: {
    middleware: {
      async execute(next, event) {
        const result = await next();
        if (Symbol.asyncIterator in result) return result;

        const { args } = event;
        const req = getExpressRequest(args.requestContext);
        const actorId = req?.token?.principal_id ?? req?.token?.user_id;
        if (!actorId) return result;
        if (getOperationAST(args.document, args.operationName)?.operation !== 'mutation') return result;

        const code = refusalCode(result.errors);
        if (!code) return result;

        const pgSettings = (args.contextValue as { pgSettings?: Record<string, string> })?.pgSettings;
        const label = req.requestId ? `[${req.requestId}]` : '[req]';
        try {
          const events = await req.constructive?.useModule('events');
          if (!events || !pgSettings) return result;
          const operation = args.operationName ?? getOperationAST(args.document)?.name?.value ?? null;
          await withPgClient(pool, pgSettings, (client) =>
            client.query(recordErrorSql(events), [code, actorId, JSON.stringify({ operation })])
          );
        } catch (err) {
          log.error(
            `${label} failed to record refusal ${code} for ${actorId}: ${
              err instanceof Error ? err.message : String(err)
            }`
          );
        }
        return result;
      }
    }
  }
});
