import { getGraphileSettings } from '@launchql/graphile-settings';
import { GraphileQuery, getSchema } from '@launchql/graphile-query';
import { ApiQuery, ApiByNameQuery } from './gql';
import { svcCache, getRootPgPool } from '@launchql/server-utils';
import env from '../env';
import errorPage404 from './errors/404';
import errorPage50x from './errors/50x';
const isPublic = env.IS_PUBLIC;

export const getSubdomain = (reqDomains) => {
  const names = reqDomains.filter((name) => !['www'].includes(name));
  return !names.length ? null : names.join('.');
};

export const api = async (req, res, next) => {
  try {
    const svc = await getApiConfig(req);
    if (!svc) {
      return res.status(404).send(errorPage404);
    }
    req.apiInfo = svc;
    req.databaseId = svc.data.api.databaseId;
  } catch (e) {
    if (e.message.match(/does not exist/)) {
      return res.status(404).send(errorPage404);
    }
    console.error(e);
    return res.status(500).send(errorPage50x);
  }
  return next();
};

const getSvcKey = (req) => {
  const domain = req.urlDomains.domain;
  const key = req.urlDomains.subdomains
    .filter((name) => !['www'].includes(name))
    .concat(domain)
    .join('.');

  if (!isPublic && req.get('X-Database-Id')) {
    if (req.get('X-Api-Name')) {
      return 'api:' + req.get('X-Database-Id') + ':' + req.get('X-Api-Name');
    }
    if (req.get('X-Schemata')) {
      return (
        'schemata:' + req.get('X-Database-Id') + ':' + req.get('X-Schemata')
      );
    }
  }
  return key;
};

const getHardCodedSchemata = ({ schemata, databaseId, key }) => {
  // hard-coded mostly for admin purposes
  const svc = {
    data: {
      api: {
        databaseId,
        isPublic: false,
        dbname: env.PGDATABASE,
        anonRole: 'administrator',
        roleName: 'administrator',
        schemaNamesFromExt: {
          nodes: schemata
            .split(',')
            .map((schema) => schema.trim())
            .map((schemaName) => ({ schemaName }))
        },
        schemaNames: {
          nodes: []
        },
        apiModules: {
          nodes: []
        }
      }
    }
  };
  svcCache.set(key, svc);
  return svc;
};

const queryServiceByDomainAndSubdomain = async ({
  key,
  client,
  domain,
  subdomain
}) => {
  let svc;
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
    result.data.domains.nodes &&
    result.data.domains.nodes.length
  ) {
    const data = result.data.domains.nodes[0];
    if (!data.api || data.api.isPublic !== isPublic) {
      return null;
    }
    svc = {
      data
    };
    svcCache.set(key, svc);
  } else {
    return null;
  }
};

const queryServiceByApiName = async ({ key, client, databaseId, name }) => {
  let svc;
  const result = await client.query({
    role: 'administrator',
    query: ApiByNameQuery,
    variables: {
      databaseId,
      name
    }
  });

  if (result.errors && result.errors.length) {
    console.error(result.errors);
    return null;
  }

  if (result && result.data && result.data.api) {
    const data = result.data;
    if (!data.api || data.api.isPublic !== isPublic) {
      return null;
    }
    svc = {
      data
    };
    svcCache.set(key, svc);
  } else {
    return null;
  }
};

export const getApiConfig = async (req) => {
  const rootPgPool = getRootPgPool(env.PGDATABASE);

  const subdomain = getSubdomain(req.urlDomains.subdomains);
  const domain = req.urlDomains.domain;

  const key = getSvcKey(req);
  req.svc_key = key;

  const schemata = env.META_SCHEMAS;

  let svc;

  if (svcCache.has(key)) {
    svc = svcCache.get(key);
  } else {
    // get Graphile Settings
    const settings = getGraphileSettings({
      simpleInflection: true,
      schema: schemata
    });

    // get schema
    const schema = await getSchema(rootPgPool, settings);

    // initialize client
    const client = new GraphileQuery({ schema, pool: rootPgPool, settings });

    if (!isPublic && req.get('X-Database-Id')) {
      if (req.get('X-Schemata')) {
        // hard-coded mostly for admin purposes
        svc = getHardCodedSchemata({
          key,
          schemata: req.get('X-Schemata'),
          databaseId: req.get('X-Database-Id')
        });
        return svc;
      } else if (req.get('X-Api-Name')) {
        // query for api!
        svc = await queryServiceByApiName({
          key,
          client,
          name: req.get('X-Api-Name'),
          databaseId: req.get('X-Database-Id')
        });
      }
    } else if (!isPublic) {
      svc = await queryServiceByDomainAndSubdomain({
        key,
        client,
        domain,
        subdomain
      });
    } else {
      svc = await queryServiceByDomainAndSubdomain({
        key,
        client,
        domain,
        subdomain
      });
    }
  }
  return svc;
};
