import { svcCache, getRootPgPool } from '@launchql/server-utils';
import env from '../env';

export const getSubdomain = (reqDomains) => {
  const names = reqDomains.filter((name) => !['www'].includes(name));
  return names.join('.');
};

export const service = async (req, res, next) => {
  try {
    const svc = await getSvcConfig(req);
    // const svc = await getSvcConfigByName(req);
    req.svc = svc;
    if (!svc) {
      return res.status(404).send('Not found');
    }
  } catch (e) {
    if (e.message.match(/does not exist/)) {
      return res.status(404).send('Service Not found');
    }
    console.error(e);
    return res.status(500).send('Something happened with service...');
  }
  return next();
};

export const getSvcConfig = async (req) => {
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

// TODO later app.use(`/:service/*`, middleware)
// hard part was getting graphile handler to work...
export const getSvcConfigByName = async (req) => {
  const rootPgPool = getRootPgPool(env.PGDATABASE);

  const key = req.params.service;
  req.svc_key = key;

  let svc;
  if (svcCache.has(key)) {
    svc = svcCache.get(key);
  } else {
    svc = await rootPgPool.query(
      `SELECT * FROM "${env.SERVICE_SCHEMA}"."${env.SERVICE_TABLE}"
                WHERE name=$1`,
      [key]
    );

    if (svc.rowCount === 0) {
      return null;
    } else {
      svc = svc.rows[0];
      svcCache.set(key, svc);
    }
  }
  return svc;
};
