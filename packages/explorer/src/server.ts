import express, { Request, Response, NextFunction, Express } from 'express';
import { postgraphile, PostGraphileOptions } from 'postgraphile';
import graphqlUploadExpress from 'graphql-upload/graphqlUploadExpress.mjs';
import { middleware as parseDomains } from '@launchql/url-domains';
import {
  graphileCache,
  getRootPgPool,
  cors,
  healthz,
  poweredBy,
  GraphileCache
} from '@launchql/server-utils';

import { printSchemas, printDatabases } from './render';
import { env } from './env';
import { getGraphileSettings } from './settings';

interface ServerOptions {
  simpleInflection?: boolean;
  oppositeBaseNames?: boolean;
  port?: number;
  postgis?: boolean;
  origin?: string;
}

export default ({
  simpleInflection = env.USE_SIMPLE_INFLECTION,
  oppositeBaseNames = env.USE_OPPOSITE_BASENAMES,
  port = env.SERVER_PORT,
  postgis = env.USE_POSTGIS,
  origin
}: ServerOptions = {}): Express => {
  const getGraphileInstanceObj = (dbname: string, schemaname: string): GraphileCache => {
    const key = `${dbname}.${schemaname}`;

    if (graphileCache.has(key)) {
      return graphileCache.get(key);
    }

    const opts: PostGraphileOptions = {
      ...getGraphileSettings({
        simpleInflection,
        oppositeBaseNames,
        port,
        host: env.SERVER_HOST,
        schema: schemaname,
        postgis
      }),
      graphqlRoute: '/graphql',
      graphiqlRoute: '/graphiql'
    };

    const pgPool = getRootPgPool(dbname);
    const obj = {
      pgPoolKey: dbname,
      handler: postgraphile(pgPool, schemaname, opts)
    };

    graphileCache.set(key, obj);
    return obj;
  };

  const app = express();

  healthz(app);
  cors(app, origin);
  app.use(parseDomains());
  app.use(poweredBy('launchql'));
  app.use(graphqlUploadExpress());

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.urlDomains?.subdomains.length === 1) {
      const [dbName] = req.urlDomains.subdomains;
      try {
        const pgPool = getRootPgPool(dbName);
        const results = await pgPool.query(`
          SELECT s.nspname AS table_schema
          FROM pg_catalog.pg_namespace s
          WHERE s.nspname !~ '^pg_' AND s.nspname NOT IN ('information_schema');
        `);
        res.send(
          printSchemas({
            dbName,
            schemas: results.rows,
            req,
            hostname: env.SERVER_HOST,
            port
          })
        );
        return;
      } catch (e: any) {
        if (e.message?.match(/does not exist/)) {
          res.status(404).send('DB Not found');
          return;
        }
        console.error(e);
        res.status(500).send('Something happened...');
        return;
      }
    }
    return next();
  });

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.urlDomains?.subdomains.length === 2) {
      const [, dbName] = req.urlDomains.subdomains;
      try {
        const pgPool = getRootPgPool(dbName);
        await pgPool.query('SELECT 1;');
      } catch (e: any) {
        if (e.message?.match(/does not exist/)) {
          res.status(404).send('DB Not found');
          return;
        }
        console.error(e);
        res.status(500).send('Something happened...');
        return;
      }
    }
    return next();
  });

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.urlDomains?.subdomains.length === 2) {
      const [schemaName, dbName] = req.urlDomains.subdomains;
      try {
        const { handler } = getGraphileInstanceObj(dbName, schemaName);
        handler(req, res, next);
        return;
      } catch (e: any) {
        res.status(500).send(e.message);
        return;
      }
    }
    return next();
  });

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.urlDomains?.subdomains.length === 2 && req.url === '/flush') {
      const [schemaName, dbName] = req.urlDomains.subdomains;
      const key = `${dbName}.${schemaName}`;
      graphileCache.delete(key);
      res.status(200).send('OK');
      return;
    }
    return next();
  });

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.urlDomains?.subdomains.length === 0) {
      try {
        const rootPgPool = getRootPgPool(env.PGUSER);
        const results = await rootPgPool.query(`
          SELECT * FROM pg_catalog.pg_database
          WHERE datistemplate = FALSE AND datname != 'postgres' AND datname !~ '^pg_'
        `);
        res.send(printDatabases({ databases: results.rows, req, port }));
        return;
      } catch (e: any) {
        if (e.message?.match(/does not exist/)) {
          res.status(404).send('DB Not found');
          return;
        }
        console.error(e);
        res.status(500).send('Something happened...');
        return;
      }
    }
    return next();
  });

  app.listen(port, env.SERVER_HOST, () => {
    console.log(`app listening at http://${env.SERVER_HOST}:${port}`);
  });

  return app;
};
