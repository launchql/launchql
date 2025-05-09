import express, { Request, Response, NextFunction, Express } from 'express';
import { postgraphile } from 'postgraphile';
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
import { getGraphileSettings } from './settings';
import { LaunchQLOptions } from '@launchql/types';
import { getMergedOptions } from '@launchql/types';

export const LaunchQLExplorer = (rawOpts: LaunchQLOptions = {}): Express => {
  const opts = getMergedOptions(rawOpts);

  const {
    pg,
    server
  } = opts;

  const getGraphileInstanceObj = (dbname: string, schemaname: string): GraphileCache => {
    const key = `${dbname}.${schemaname}`;

    if (graphileCache.has(key)) {
      return graphileCache.get(key);
    }

    const settings = {
      ...getGraphileSettings({
        ...opts,
        graphile: { schema: schemaname }
      }),
      graphqlRoute: '/graphql',
      graphiqlRoute: '/graphiql'
    };

    const pgPool = getRootPgPool({
      ...opts.pg,
      database: dbname
    });
    const handler = postgraphile(pgPool, schemaname, settings);

    const obj = {
      pgPool,
      pgPoolKey: dbname,
      handler
    };

    graphileCache.set(key, obj);
    return obj;
  };

  const app = express();

  healthz(app);
  cors(app, server.origin);
  app.use(parseDomains());
  app.use(poweredBy('launchql'));
  app.use(graphqlUploadExpress());

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.urlDomains?.subdomains.length === 1) {
      const [dbName] = req.urlDomains.subdomains;
      try {
        const pgPool = getRootPgPool({
          ...opts.pg,
          database: dbName
        });
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
            hostname: server.host,
            port: server.port
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
        const pgPool = getRootPgPool({
          ...opts.pg,
          database: dbName
        });
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
        const rootPgPool = getRootPgPool({
          ...opts.pg,
          database: opts.pg.user // is this to get postgres?
        });
        const results = await rootPgPool.query(`
          SELECT * FROM pg_catalog.pg_database
          WHERE datistemplate = FALSE AND datname != 'postgres' AND datname !~ '^pg_'
        `);
        res.send(printDatabases({ databases: results.rows, req, port: server.port }));
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

  app.listen(server.port, server.host, () => {
    console.log(`app listening at http://${server.host}:${server.port}`);
  });

  return app;
};
