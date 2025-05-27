import { LaunchQLOptions } from '@launchql/types';
import { Response, NextFunction } from 'express';
import errorPage404 from '../errors/404-message';
import errorPage50x from '../errors/50x';

export const createDirectSchemaMiddleware = (opts: LaunchQLOptions) => {
  return async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const schemas = opts.graphile?.schema || [];
      const schemaArray = Array.isArray(schemas) ? schemas : [schemas];

      if (!schemaArray.length) {
        res.status(404).send(errorPage404('no schema for hard-coded schema'));
        return;
      }
      
      // let's just pass this in from the CLI when it's needed
      const svc = {
        data: {
          api: {
            databaseId: 'direct-schema',
            isPublic: opts.graphile.isPublic,
            dbname: opts.pg.database,

            // TODO: allow these to be passed in when useMetaApi is off...
            anonRole: opts.graphile.anonRole,
            roleName: opts.graphile.roleName,
            schemaNamesFromExt: {
              nodes: schemaArray.map(schemaName => ({ schemaName }))
            },
            schemaNames: { nodes: [] as Array<{ schemaName: string }> },
            apiModules: { nodes: [] as Array<any> }
          }
        }
      };
      
      req.apiInfo = svc;
      req.databaseId = svc.data.api.databaseId;
      req.svc_key = 'direct-schema';
      
      next();
    } catch (e: any) {
      console.error(e);
      res.status(500).send(errorPage50x('directSchema'));
      return;
    }
  };
};
