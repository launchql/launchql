import express from 'express';
import { getGraphileSettings } from './settings';
import { postgraphile } from '@pyramation/postgraphile';
import pg from 'pg';
import cors from 'cors';
import env from './env';
import LRU from 'lru-cache';
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
    console.log(`disposing ${'PostGraphile'}[${key}]`);
  },
  updateAgeOnGet: true,
  maxAge: 1000 * 60 * 60
});

const pgCache = new LRU({
  max: 10,
  dispose: function (key, pgPool) {
    console.log(`disposing pg ${key}`);
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

const svcCache = new LRU({
  max: 25,
  dispose: function (key, svc) {
    console.log(`disposing ${'service'}[${key}]`);
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
  const app = express();

  const getSubdomain = (reqDomains) => {
    const names = reqDomains.filter((name) => !['www'].includes(name));
    return names.join('.');
  };

  const getSvcConfig = async (req) => {
    const rootPgPool = getRootPgPool(env.PGDATABASE);

    const subdomain = getSubdomain(req.urlDomains.subdomains);
    const domain = req.urlDomains.domain;
    const key = req.urlDomains.subdomains
      .filter((name) => !['www'].includes(name))
      .concat(domain)
      .join('.');

    req.svc_key = key;

    let svc;
    if (svcCache.has(key)) {
      svc = svcCache.get(key);
    } else {
      if (!req.urlDomains.subdomains.length) {
        svc = await rootPgPool.query(
          `SELECT * FROM "${env.SERVICE_SCHEMA}"."${env.SERVICE_TABLE}"
            WHERE domain=$1 AND subdomain IS NULL`,
          [domain]
        );
      } else {
        svc = await rootPgPool.query(
          `SELECT * FROM "${env.SERVICE_SCHEMA}"."${env.SERVICE_TABLE}"
            WHERE domain=$1 AND subdomain=$2`,
          [domain, subdomain]
        );
      }

      if (svc.rowCount === 0) {
        return null;
      } else {
        svc = svc.rows[0];
        svcCache.set(key, svc);
      }
    }
    return svc;
  };

  const getGraphileInstanceObj = async (req) => {
    const svc = req.svc;

    const { schemas, dbname } = svc;

    const key = req.svc_key;

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
        schema: schemas,
        svc
      }),
      graphqlRoute: '/graphql',
      graphiqlRoute: '/graphiql'
    };

    const pgPool = getRootPgPool(dbname);

    const obj = {
      pgPool,
      handler: postgraphile(pgPool, opts.schema, opts)
    };

    cache.set(key, obj);
    return obj;
  };

  app.get('/healthz', (req, res) => {
    // could be checking db, etc..
    res.send('ok');
  });

  process.on('SIGTERM', () => {
    cache.reset();
    pgCache.reset();
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

  if (env.TRUST_PROXY) {
    app.set('trust proxy', (ip) => {
      return true;
    });
  }

  app.use(parseDomains());
  app.use(async (req, res, next) => {
    res.set({
      'X-Powered-By': 'launchql'
    });
    return next();
  });

  // get service
  app.use(async (req, res, next) => {
    try {
      const svc = await getSvcConfig(req);
      req.svc = svc;
      if (!svc) {
        return res.status(404).send('Not found');
      }
    } catch (e) {
      if (e.message.match(/does not exist/)) {
        return res.status(404).send('Services Not found');
      }
      console.error(e);
      return res.status(500).send('Something happened with service...');
    }
    return next();
  });

  app.use(async (req, res, next) => {
    const svc = req.svc;
    const pool = getRootPgPool(svc.dbname);

    if (svc.auth?.length == 2) {
      const { authorization = '' } = req.headers;
      const [authType, authToken] = authorization.split(' ');
      let token = {};
      if (authType.toLowerCase() === 'bearer' && authToken) {
        let result = null;
        try {
          result = await pool.query(
            `SELECT * FROM "${svc.auth[0]}"."${svc.auth[1]}"($1)`,
            [authToken]
          );
        } catch (e) {
          return res.status(200).end(
            JSON.stringify({
              errors: [
                {
                  extensions: {
                    code: 'BAD_TOKEN_DEFINITION',
                    message:
                      process.env.NODE_ENV === 'production' ? '' : e.message
                  }
                }
              ]
            })
          );
        }

        if (result.rowCount === 0) {
          return res.status(200).end(
            JSON.stringify({
              errors: [{ extensions: { code: 'UNAUTHENTICATED' } }]
            })
          );
        } else {
          token = result.rows[0];
        }
      }
      req.token = token;
    }
    return next();
  });

  app.use(async (req, res, next) => {
    try {
      const { handler } = await getGraphileInstanceObj(req);

      if (req.originalUrl === '/') {
        const schemaNotIntrospected = await handler.getGraphQLSchema();
        const host = req.get('host');
        return res.send({
          api: `${req.protocol}://${host}/graphiql`,
          schema: schemaNotIntrospected
        });
      }
      return handler(req, res, next);
    } catch (e) {
      // TODO update graphile... why do we not catch
      // this error!
      return res.status(500).send(e.message);
    }
  });

  app.use(async (req, res, next) => {
    if (req.url === '/flush') {
      // TODO check bearer for a flush?
      const subdomain = getSubdomain(req.urlDomains.subdomains);
      cache.del(subdomain);
      svcCache.del(subdomain);
      return res.send(200);
    }
    return next();
  });

  app.listen(port, env.SERVER_HOST, () =>
    console.log(`app listening at http://${env.SERVER_HOST}:${port}`)
  );
};

export { getGraphileSettings };
