import { getEnvOptions } from '@constructive-io/graphql-env';
import type { ConstructiveOptions } from '@constructive-io/graphql-types';
import { middleware as parseDomains } from '@constructive-io/url-domains';
import { cors, healthz, poweredBy } from '@pgpmjs/server-utils';
import express, { Express, NextFunction, Request, Response } from 'express';
import { cacheGraphileInstance, createGraphileInstance, graphileCache, GraphileCacheEntry } from 'graphile-cache';
import type { GraphileConfig } from 'graphile-config';
import { makePgService } from 'graphile-settings';
import { getPgPool } from 'pg-cache';
import { getPgEnvOptions } from 'pg-env';

import { printDatabases, printSchemas } from './render';
import { getGraphilePreset } from './settings';

export const GraphQLExplorer = (rawOpts: ConstructiveOptions = {}): Express => {
  const opts = getEnvOptions(rawOpts);

  const { pg, server } = opts;

  const getGraphileInstanceObj = async (
    dbname: string,
    schemaname: string
  ): Promise<GraphileCacheEntry> => {
    const key = `${dbname}.${schemaname}`;

    const cached = graphileCache.get(key);
    if (cached) {
      return cached;
    }

    const pgConfig = getPgEnvOptions({
      ...pg,
      database: dbname,
    });

    // Route through pg-cache so the pool is tracked and can be cleaned up
    // properly, preventing leaked connections during database teardown.
    const pool = getPgPool(pgConfig);

    const basePreset = getGraphilePreset(opts);
    const preset: GraphileConfig.Preset = {
      ...basePreset,
      pgServices: [
        makePgService({ pool, schemas: [schemaname] }),
      ],
      grafserv: {
        graphqlPath: '/graphql',
        graphiqlPath: '/graphiql',
        graphiql: true,
      },
    };

    const instance = await createGraphileInstance({ preset, cacheKey: key });
    await cacheGraphileInstance(key, instance);
    return instance;
  };

  const app = express();

  healthz(app);
  cors(app, server.origin);
  app.use(parseDomains());
  app.use(poweredBy('constructive'));

  app.use(async (req: Request, res: Response, next: NextFunction) => {
    if (req.urlDomains?.subdomains.length === 1) {
      const [dbName] = req.urlDomains.subdomains;
      try {
        const pgPool = getPgPool(
          getPgEnvOptions({
            ...opts.pg,
            database: dbName,
          })
        );

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
            port: server.port,
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
        const pgPool = getPgPool(
          getPgEnvOptions({
            ...opts.pg,
            database: dbName,
          })
        );

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
        const instance = await getGraphileInstanceObj(dbName, schemaName);
        instance.handler(req, res, next);
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
        const rootPgPool = getPgPool(
          getPgEnvOptions({
            ...opts.pg,
            database: opts.pg.user, // is this to get postgres?
          })
        );

        const results = await rootPgPool.query(`
          SELECT * FROM pg_catalog.pg_database
          WHERE datistemplate = FALSE AND datname != 'postgres' AND datname !~ '^pg_'
        `);
        res.send(
          printDatabases({ databases: results.rows, req, port: server.port })
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

  app.listen(server.port, server.host, () => {
    console.log(`app listening at http://${server.host}:${server.port}`);
  });

  return app;
};
