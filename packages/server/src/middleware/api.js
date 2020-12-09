import { getGraphileSettings } from '@launchql/graphile-settings';
import { GraphileQuery, getSchema } from '@launchql/graphile-query';
import { ApiQuery } from './gql';
import { svcCache, getRootPgPool } from '@launchql/server-utils';
import env from '../env';

export const getSubdomain = (reqDomains) => {
  const names = reqDomains.filter((name) => !['www'].includes(name));
  return !names.length ? null : names.join('.');
};

export const api = async (req, res, next) => {
  try {
    const svc = await getApiConfig(req);
    req.apiInfo = svc;
    if (!svc) {
      return res.status(404).send('Not found');
    }
  } catch (e) {
    if (e.message.match(/does not exist/)) {
      return res.status(404).send('API Not found');
    }
    console.error(e);
    return res.status(500).send('Something bad happened...');
  }
  return next();
};

export const getApiConfig = async (req) => {
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
    // get Graphile Settings
    const settings = getGraphileSettings({
      simpleInflection: true,
      schema: [env.META_SCHEMA]
    });

    // get schema
    const schema = await getSchema(rootPgPool, settings);

    // initialize client
    const client = new GraphileQuery({ schema, pool: rootPgPool, settings });

    const result = await client.query({
      role: 'administrator',
      query: ApiQuery,
      variables: {
        domain,
        subdomain
      }
    });

    if (result.errors && result.errors.length) {
      console.error(result.errors);
      return null;
    }

    if (
      result &&
      result.data &&
      result.data.domains &&
      result.data.domains &&
      result.data.domains.nodes &&
      result.data.domains.nodes.length
    ) {
      svc = {
        client,
        data: result.data.domains.nodes[0]
      };
      svcCache.set(key, svc);
    } else {
      return null;
    }
  }
  return svc;
};
