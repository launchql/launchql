import {
  cache,
  svcCache,
  getRootPgPool,
  cors,
  healthz,
  poweredBy,
  trustProxy
} from '@launchql/server-utils';
import { graphqlUploadExpress } from 'graphql-upload';
import { middleware as parseDomains } from '@pyramation/url-domains';
import { postgraphile } from '@pyramation/postgraphile';
import express from 'express';

import { getGraphileSettings } from './settings';
import env from './env';

export default ({
  simpleInflection = env.USE_SIMPLE_INFLECTION,
  oppositeBaseNames = env.USE_OPPOSITE_BASENAMES,
  port = env.SERVER_PORT,
  postgis = env.USE_POSTGIS,
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
        port,
        host: env.SERVER_HOST,
        schema: schemas,
        svc,
        postgis
      }),
      graphqlRoute: '/graphql',
      graphiqlRoute: '/graphiql'
    };

    const pgPool = getRootPgPool(dbname);

    const obj = {
      pgPool,
      handler: postgraphile(pgPool, schemas, opts)
    };

    cache.set(key, obj);
    return obj;
  };

  healthz(app, origin);
  cors(app, origin);
  trustProxy(app, env);
  app.use(parseDomains());
  app.use(poweredBy('launchql'));
  app.use(graphqlUploadExpress());

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
      cache.del(req.svc_key);
      svcCache.del(req.svc_key);
      return res.status(200).send('OK');
    }
    return next();
  });

  app.listen(port, env.SERVER_HOST, () =>
    console.log(`app listening at http://${env.SERVER_HOST}:${port}`)
  );
};

export { getGraphileSettings };
