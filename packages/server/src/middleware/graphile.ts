import { Request, Response, NextFunction, RequestHandler } from 'express';
import { graphileCache, getRootPgPool } from '@launchql/server-utils';
import { postgraphile, PostGraphileOptions } from 'postgraphile';
import { getGraphileSettings as getSettings } from '@launchql/graphile-settings';
import PublicKeySignature from '../plugins/PublicKeySignature';
import { LaunchQLOptions } from '@launchql/types';

export const graphile = (lOpts: LaunchQLOptions): RequestHandler => {

  // @ts-ignore
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const api = req.apiInfo.data.api;
      const key = req.svc_key;
      const { dbname } = api;
      const { anonRole, roleName } = api;

      const { schemaNamesFromExt, schemaNames } = api;
      const schemas = []
        .concat(schemaNamesFromExt.nodes.map(({ schemaName }: any) => schemaName))
        .concat(schemaNames.nodes.map(({ schemaName }: any) => schemaName));

      if (graphileCache.has(key)) {
        const { handler } = graphileCache.get(key)!
        return handler(req, res, next);
      }

      const options = getSettings({
        ...lOpts,
        graphile: {
          ...lOpts.graphile,
          schema: schemas
        }
      });

      const pubkey_challenge = api.apiModules.nodes.find(
        (mod: any) => mod.name === 'pubkey_challenge'
      );

      if (pubkey_challenge && pubkey_challenge.data) {
        options.appendPlugins.push(PublicKeySignature(pubkey_challenge.data));
      }

      options.appendPlugins = options.appendPlugins ?? [];
      options.appendPlugins.push(...lOpts.graphile.appendPlugins);

      // @ts-ignore
      options.pgSettings = async function pgSettings(req: Request) {
        const context: Record<string, any> = {
          [`jwt.claims.database_id`]: req.databaseId,
          [`jwt.claims.ip_address`]: req.clientIp
        };

        if (req.get('origin')) {
          context['jwt.claims.origin'] = req.get('origin');
        }
        if (req.get('User-Agent')) {
          context['jwt.claims.user_agent'] = req.get('User-Agent');
        }

        if (req?.token?.user_id) {
          return {
            role: roleName,
            [`jwt.claims.token_id`]: req.token.id,
            [`jwt.claims.user_id`]: req.token.user_id,
            ...context
          };
        }

        return { role: anonRole, ...context };
      };

      options.graphqlRoute = '/graphql';
      options.graphiqlRoute = '/graphiql';

      options.graphileBuildOptions = {
        ...options.graphileBuildOptions,
        ...lOpts.graphile.graphileBuildOptions
      };

      const opts: PostGraphileOptions = {
        ...options,
        ...lOpts.graphile.overrideSettings
      };

      const pgPool = getRootPgPool({
        ...lOpts.pg,
        database: dbname
      });
      const handler = postgraphile(pgPool, schemas, opts);

      graphileCache.set(key, {
        pgPool,
        pgPoolKey: dbname,
        handler
      });

      return handler(req, res, next);
    } catch (e: any) {
      return res.status(500).send(e.message);
    }
  };
};
