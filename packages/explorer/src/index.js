import {
  cache,
  getRootPgPool,
  cors,
  healthz,
  poweredBy
} from '@launchql/server-utils';
import { graphqlUploadExpress } from 'graphql-upload';
import { middleware as parseDomains } from '@pyramation/url-domains';
import { postgraphile } from '@pyramation/postgraphile';
import express from 'express';

import { getGraphileSettings } from './settings';
import { printSchemas, printDatabases } from './render';
import env from './env';

export default ({
  simpleInflection = true,
  oppositeBaseNames = true,
  port = env.SERVER_PORT,
  origin
} = {}) => {
  const getGraphileInstanceObj = (dbname, schemaname) => {
    const key = [dbname, schemaname].join('.');

    if (cache.has(key)) {
      return cache.get(key);
    }

    const opts = {
      ...getGraphileSettings({
        simpleInflection,
        oppositeBaseNames,
        port,
        host: env.SERVER_HOST,
        schema: schemaname
      }),
      graphqlRoute: '/graphql',
      graphiqlRoute: '/graphiql'
    };

    const pgPool = getRootPgPool(dbname);

    const obj = {
      pgPoolKey: dbname,
      handler: postgraphile(pgPool, opts.schema, opts)
    };

    cache.set(key, obj);
    return obj;
  };

  const app = express();

  healthz(app, origin);
  cors(app, origin);
  app.use(parseDomains());
  app.use(poweredBy('launchql'));
  app.use(graphqlUploadExpress());

  app.use(async (req, res, next) => {
    if (req.urlDomains.subdomains.length == 1) {
      try {
        const [dbName] = req.urlDomains.subdomains;
        const pgPool = getRootPgPool(dbName);

        const results = await pgPool.query(`
        SELECT s.nspname AS table_schema
        FROM pg_catalog.pg_namespace s
        WHERE
        s.nspname !~ '^pg_' AND
        s.nspname not in ('information_schema');
        `);
        return res.send(
          printSchemas({
            dbName,
            schemas: results.rows,
            req,
            hostname: env.SERVER_HOST,
            port
          })
        );
      } catch (e) {
        if (e.message.match(/does not exist/)) {
          return res.status(404).send(`DB Not found`);
        } else {
          console.error(e);
          return res.status(500).send('Something happened...');
        }
      }
    }
    return next();
  });

  // check db exists
  app.use(async (req, res, next) => {
    if (req.urlDomains.subdomains.length == 2) {
      const [schemaName, dbName] = req.urlDomains.subdomains;
      try {
        const [_schemaName, dbName] = req.urlDomains.subdomains;
        const pgPool = getRootPgPool(dbName);
        await pgPool.query(`SELECT 1;`);
      } catch (e) {
        if (e.message.match(/does not exist/)) {
          return res.status(404).send('DB Not found');
        } else {
          console.error(e);
          return res.status(500).send('Something happened...');
        }
      }
    }
    return next();
  });

  // graphql instance
  app.use(async (req, res, next) => {
    if (req.urlDomains.subdomains.length == 2) {
      const [schemaName, dbName] = req.urlDomains.subdomains;
      try {
        const { handler } = getGraphileInstanceObj(dbName, schemaName);
        return handler(req, res, next);
      } catch (e) {
        // TODO update graphile... why do we not catch
        // this error!
        return res.status(500).send(e.message);
      }
    }
    return next();
  });

  app.use(async (req, res, next) => {
    if (req.urlDomains.subdomains.length == 2) {
      if (req.url === '/flush') {
        const [schemaName, dbName] = req.urlDomains.subdomains;
        const key = [dbName, schemaName].join('.');
        cache.del(key);
        return res.status(200).send('OK');
      }
    }
    return next();
  });

  app.use(async (req, res, next) => {
    if (req.urlDomains.subdomains.length === 0) {
      try {
        const rootPgPool = getRootPgPool(env.PGUSER);
        const results = await rootPgPool.query(`
        SELECT
        *
      FROM
        pg_catalog.pg_database
      where datistemplate = False
      and datname != 'postgres'
      and datname !~ '^pg_'
      `);
        return res.send(printDatabases({ databases: results.rows, req, port }));
      } catch (e) {
        if (e.message.match(/does not exist/)) {
          return res.status(404).send('DB Not found');
        } else {
          console.error(e);
          return res.status(500).send('Something happened...');
        }
      }
    }
    return next();
  });

  app.listen(port, env.SERVER_HOST, () =>
    console.log(`app listening at http://${env.SERVER_HOST}:${port}`)
  );
};
