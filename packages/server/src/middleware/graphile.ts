import { Request, Response, NextFunction, RequestHandler } from 'express';
import { env } from '../env';
import { graphileCache, getRootPgPool } from '@launchql/server-utils';
import { postgraphile, PostGraphileOptions } from 'postgraphile';
import { getGraphileSettings as getSettings } from '@launchql/graphile-settings';
import type { Plugin } from 'graphile-build';

declare module 'express-serve-static-core' {
  interface Request {
    apiInfo: {
      data: {
        api: {
          dbname: string;
          anonRole: string;
          roleName: string;
          schemaNames: {
            nodes: { schemaName: string }[];
          };
          schemaNamesFromExt: {
            nodes: { schemaName: string }[];
          };
          apiModules: {
            nodes: {
              name: string;
              data?: any;
            }[];
          };
          rlsModule?: {
            authenticate?: string;
            authenticateStrict?: string;
            privateSchema: {
              schemaName: string;
            };
          };
        };
      };
    };
    svc_key: string;
    clientIp?: string;
    databaseId?: string;
    token?: {
      id: string;
      user_id: string;
      [key: string]: any;
    };
  }
}

interface GraphileMiddlewareOptions {
  simpleInflection?: boolean;
  oppositeBaseNames?: boolean;
  port?: number;
  postgis?: boolean;
  appendPlugins?: Plugin[];
  graphileBuildOptions?: PostGraphileOptions['graphileBuildOptions'];
  overrideSettings?: Partial<PostGraphileOptions>;
}

export const graphile = ({
  simpleInflection,
  oppositeBaseNames,
  port,
  postgis,
  appendPlugins = [],
  graphileBuildOptions = {},
  overrideSettings = {}
}: GraphileMiddlewareOptions): RequestHandler => {
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
        host: env.SERVER_HOST,
        schema: schemas,
        port,
        simpleInflection,
        oppositeBaseNames,
        postgis
      });

      const pubkey_challenge = api.apiModules.nodes.find(
        (mod: any) => mod.name === 'pubkey_challenge'
      );

      if (pubkey_challenge && pubkey_challenge.data) {
        options.appendPlugins.push(PublicKeySignature(pubkey_challenge.data));
      }

      if (appendPlugins.length) {
        [].push.apply(options.appendPlugins, appendPlugins);
      }

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
        ...graphileBuildOptions
      };

      const opts: PostGraphileOptions = {
        ...options,
        ...overrideSettings
      };

      const pgPool = getRootPgPool(dbname);
      const handler = postgraphile(pgPool, schemas, opts);

      graphileCache.set(key, {
        pgPool,
        handler
      });

      return handler(req, res, next);
    } catch (e: any) {
      return res.status(500).send(e.message);
    }
  };
};
