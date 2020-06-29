import express from 'express';
import { getGraphileSettings } from './settings';
import { postgraphile } from '@pyramation/postgraphile';
import 'colors';
import pg from 'pg';
import cors from 'cors';
import env from './env';
import LRU from 'lru-cache';
import { printSchemas, printDatabases } from './render';
import { middleware as parseDomains } from '@pyramation/url-domains';

const end = (pool) => {
  try {
    if (pool.ended || pool.ending) {
      console.error(
        'DO NOT CLOSE pool, why are you trying to call end() when already ended?'
      );
      return;
    }
    pool.end();
  } catch (e) {
    process.stderr.write(e);
  }
};

const cache = new LRU({
  max: 15,
  dispose: function (key, obj) {
    console.log(`disposing ${'PostGraphile'.green}[${key.blue}]`);
  },
  updateAgeOnGet: true,
  maxAge: 1000 * 60 * 60
});

const pgCache = new LRU({
  max: 10,
  dispose: function (key, pgPool) {
    console.log(`disposing pg ${key}`.red);
    const inUse = false;
    cache.forEach((obj, k) => {
      if (obj.pgPoolKey === key) {
        cache.del(k);
      }
    });
    end(pgPool);
  },
  updateAgeOnGet: true,
  maxAge: 1000 * 60 * 60
});

const getDbString = (db) =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${db}`;

const getRootPgPool = (dbname) => {
  let pgPool;
  if (pgCache.has(dbname)) {
    pgPool = pgCache.get(dbname);
  } else {
    pgPool = new pg.Pool({
      connectionString: getDbString(dbname)
    });
    pgCache.set(dbname, pgPool);
  }
  return pgPool;
};

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
        connection: getDbString(dbname),
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

  app.get('/healthz', (req, res) => {
    // could be checking db, etc..
    res.send('ok');
  });

  const corsOptions = origin
    ? {
        origin,
        credentials: true,
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
      }
    : undefined;

  if (corsOptions) {
    app.use(cors(corsOptions));
  } else {
    // Chrome was too strict, and * didn't work?
    // so just setting all origins to OK
    app.use(async (req, res, next) => {
      const opts = {
        origin: req.get('origin'),
        credentials: true,
        optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
      };
      return cors(opts)(req, res, next);
    });
  }

  app.use(parseDomains());
  app.use(async (req, res, next) => {
    res.set({
      'X-Powered-By': 'launchql'
    });
    return next();
  });

  process.on('SIGTERM', () => {
    cache.reset();
    pgCache.reset();
  });

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
        const key = req.urlDomains.subdomains.join('');
        cache.del(key);
        return res.send(200);
      }
    }
    return next();
  });

  app.use(async (req, res, next) => {
    if (req.urlDomains.subdomains.length === 0) {
      try {
        const rootPgPool = getRootPgPool('postgres');
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
