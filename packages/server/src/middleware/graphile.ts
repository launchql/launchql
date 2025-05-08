import { Request, Response, NextFunction } from 'express';
import { env } from '../env';
import { graphileCache, getRootPgPool } from '@launchql/server-utils';
import { postgraphile } from 'postgraphile';
import { getGraphileSettings as getSettings } from '@launchql/graphile-settings';

// import { PostGraphileOptions } from 'postgraphile';

interface GraphileOptions {
  simpleInflection?: boolean;
  oppositeBaseNames?: boolean;
  port?: number;
  postgis?: boolean;
  appendPlugins?: any[];
  graphileBuildOptions?: Record<string, any>;
  overrideSettings?: Record<string, any>;
}

export const graphile =
  ({
    simpleInflection = true,
    oppositeBaseNames = false,
    port,
    postgis = true,
    appendPlugins = [],
    graphileBuildOptions = {},
    overrideSettings = {}
  }: GraphileOptions) =>

  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Placeholder: Replace with your actual dynamic logic
      const dbname: string = (req as any).api?.dbname || 'dashboard';
      const anonRole: string = 'anonymous';
      const roleName: string = 'app_user';
      const key: string = (req as any).svc_key || dbname;

      const schemas = ['dashboard_public'];
      console.log('hard coding schemas....');

      if (!schemas.length) {
        return res.status(500).send('No schemas provided');
      }

      if (graphileCache.has(key)) {
        // @ts-ignore
        const { handler } = graphileCache.get(key)!;
        console.log(handler);
        return handler(req, res, next);
      }

      const options = getSettings({
        host: env.SERVER_HOST,
        port,
        schema: schemas,
        simpleInflection,
        oppositeBaseNames,
        postgis
      });

      if (appendPlugins.length) {
        options.appendPlugins!.push(...appendPlugins);
      }

      // @ts-ignore
      options.pgSettings = async function pgSettings(req: Request) {
        const context: Record<string, string> = {
          'jwt.claims.database_id': (req as any).databaseId || '',
          'jwt.claims.ip_address': (req as any).clientIp || ''
        };

        if (req.get('origin')) {
          context['jwt.claims.origin'] = req.get('origin')!;
        }

        if (req.get('User-Agent')) {
          context['jwt.claims.user_agent'] = req.get('User-Agent')!;
        }

        console.log(context);

        if ((req as any).token?.user_id) {
          console.log('FOUND TOKEN', (req as any).token)
          return {
            role: roleName,
            'jwt.claims.token_id': (req as any).token.id,
            'jwt.claims.user_id': (req as any).token.user_id,
            ...context
          };
        }

        console.log('ANON', context)

        return {
          role: anonRole,
          ...context
        };
      };

      // @ts-ignore
      options.graphqlRoute = '/graphql';
      // @ts-ignore
      options.graphiqlRoute = '/graphiql';
      options.graphileBuildOptions = {
        ...options.graphileBuildOptions,
        ...graphileBuildOptions
      };

      const finalOptions = {
        ...options,
        ...overrideSettings
      };

      const pgPool = getRootPgPool(dbname);

      // @ts-ignore
      const handler = postgraphile(pgPool, schemas, finalOptions);

      graphileCache.set(key, {
        pgPool,
        handler
      });

      return handler(req, res, next);
    } catch (e: any) {
      console.error('PostGraphile init failed:', e);
      return res.status(500).send(e.message);
    }
  };
