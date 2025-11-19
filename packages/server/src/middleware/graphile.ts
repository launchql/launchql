import { LaunchQLOptions } from '@launchql/types';
import { NextFunction, Request, RequestHandler, Response } from 'express';
import { graphileCache } from 'graphile-cache';
import { getGraphileSettings as getSettings } from 'graphile-settings';
import type { IncomingMessage } from 'http';
import { getPgPool } from 'pg-cache';
import { postgraphile, PostGraphileOptions } from 'postgraphile';
import './types'; // for Request type
import { getSchema } from 'graphile-query';
import { printSchema } from 'graphql';

import PublicKeySignature, {
  PublicKeyChallengeConfig,
} from '../plugins/PublicKeySignature';

export const graphile = (lOpts: LaunchQLOptions): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const api = req.api;
      if (!api) {
        return res.status(500).send('Missing API info');
      }
      // Allow missing service cache key for the schema export endpoint since it does not use the cached handler
      const isSchemaExport = req.method === 'GET' && req.path === '/get-schema';
      const key = req.svc_key;
      if (!key && !isSchemaExport) {
        return res.status(500).send('Missing service cache key');
      }
      const { dbname, anonRole, roleName, schema } = api;

      if (graphileCache.has(key as any)) {
        const { handler } = graphileCache.get(key as any)!;
        return handler(req, res, next);
      }

      const options = getSettings({
        ...lOpts,
        graphile: {
          ...lOpts.graphile,
          schema: schema,
        },
      });

      // Serve GraphQL Schema SDL
      if (isSchemaExport) {
        const pgPool = getPgPool({
          ...lOpts.pg,
          database: dbname
        });
        const gqlSchema = await getSchema(pgPool as any, {
          ...options,
          schema
        });
        const sdl = printSchema(gqlSchema);
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.status(200).send(sdl);
      }

      if (graphileCache.has(key as any)) {
        const { handler } = graphileCache.get(key as any)!;
        return handler(req, res, next);
      }

      const pubkey_challenge = api.apiModules.find(
        (mod: any) => mod.name === 'pubkey_challenge'
      );

      if (pubkey_challenge && pubkey_challenge.data) {
        options.appendPlugins.push(
          PublicKeySignature(pubkey_challenge.data as PublicKeyChallengeConfig)
        );
      }

      options.appendPlugins = options.appendPlugins ?? [];
      options.appendPlugins.push(...lOpts.graphile.appendPlugins);

      options.pgSettings = async function pgSettings(request: IncomingMessage) {
        const gqlReq = request as Request;
        const context: Record<string, any> = {
          [`jwt.claims.database_id`]: gqlReq.databaseId,
          [`jwt.claims.ip_address`]: gqlReq.clientIp,
        };

        if (gqlReq.get('origin')) {
          context['jwt.claims.origin'] = gqlReq.get('origin');
        }
        if (gqlReq.get('User-Agent')) {
          context['jwt.claims.user_agent'] = gqlReq.get('User-Agent');
        }

        if (gqlReq?.token?.user_id) {
          return {
            role: roleName,
            [`jwt.claims.token_id`]: gqlReq.token.id,
            [`jwt.claims.user_id`]: gqlReq.token.user_id,
            ...context,
          };
        }

        return { role: anonRole, ...context };
      };

      options.graphqlRoute = '/graphql';
      options.graphiqlRoute = '/graphiql';

      options.graphileBuildOptions = {
        ...options.graphileBuildOptions,
        ...lOpts.graphile.graphileBuildOptions,
      };

      const opts: PostGraphileOptions = {
        ...options,
        ...lOpts.graphile.overrideSettings,
      };

      const pgPool = getPgPool({
        ...lOpts.pg,
        database: dbname,
      });
      const handler = postgraphile(pgPool, schema, opts);

      graphileCache.set(key as any, {
        pgPool,
        pgPoolKey: dbname,
        handler,
      });

      return handler(req, res, next);
    } catch (e: any) {
      return res.status(500).send(e.message);
    }
  };
};
