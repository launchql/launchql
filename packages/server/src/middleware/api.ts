import { getGraphileSettings } from '@launchql/graphile-settings';
import { GraphileQuery, getSchema } from '@launchql/graphile-query';
import { ApiQuery, ApiByNameQuery } from './gql';
import { svcCache, getRootPgPool } from '@launchql/server-utils';
import { env } from '../env';
import errorPage404 from '../errors/404';
import errorPage50x from '../errors/50x';

const isPublic = env.IS_PUBLIC;

export const getSubdomain = (reqDomains: string[]): string | null => {
  const names = reqDomains.filter((name) => !['www'].includes(name));
  return !names.length ? null : names.join('.');
};

export const api = async (req: any, res: any, next: any): Promise<any> => {
  try {
    const svc = await getApiConfig(req);
    if (!svc) {
      return res.status(404).send(errorPage404);
    }
    req.apiInfo = svc;
    req.databaseId = svc.data.api.databaseId;
  } catch (e: any) {
    if (e.message.match(/does not exist/)) {
      return res.status(404).send(errorPage404);
    }
    console.error(e);
    return res.status(500).send(errorPage50x);
  }
  return next();
};

const getSvcKey = (req: any): string => {
  const domain = req.urlDomains.domain;
  const key = req.urlDomains.subdomains
    .filter((name: string) => !['www'].includes(name))
    .concat(domain)
    .join('.');

  if (!isPublic) {
    if (req.get('X-Api-Name')) {
      return 'api:' + req.get('X-Database-Id') + ':' + req.get('X-Api-Name');
    }
    if (req.get('X-Schemata')) {
      return 'schemata:' + req.get('X-Database-Id') + ':' + req.get('X-Schemata');
    }
    if (req.get('X-Meta-Schema')) {
      return 'metaschema:api:' + req.get('X-Database-Id');
    }
  }
  return key;
};

const getHardCodedSchemata = ({
  schemata,
  databaseId,
  key
}: {
  schemata: string;
  databaseId: string;
  key: string;
}): any => {
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
        // @ts-ignore
        schemaNames: { nodes: [] },
        // @ts-ignore
        apiModules: { nodes: [] }
      }
    }
  };
  svcCache.set(key, svc);
  return svc;
};

const getMetaSchema = ({
  key,
  databaseId
}: {
  key: string;
  databaseId: string;
}): any => {
  const schemata = env.META_SCHEMAS;
  const svc = {
    data: {
      api: {
        databaseId,
        isPublic: false,
        dbname: env.PGDATABASE,
        anonRole: 'administrator',
        roleName: 'administrator',
        schemaNamesFromExt: {
          nodes: schemata.map((schemaName: string) => ({ schemaName }))
        },
        // @ts-ignore
        schemaNames: { nodes: [] },
        // @ts-ignore
        apiModules: { nodes: [] }
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
}: {
  key: string;
  client: any;
  domain: string;
  subdomain: string;
}): Promise<any> => {

  const result = await client.query({
    role: 'administrator',
    query: ApiQuery,
    variables: { domain, subdomain }
  });

  console.log(JSON.stringify(result, null, 2));

  if (result.errors?.length) {
    console.error(result.errors);
    return null;
  }

  const nodes = result?.data?.domains?.nodes;
  if (nodes?.length) {
    const data = nodes[0];
    if (!data.api || data.api.isPublic !== isPublic) return null;
    const svc = { data };
    svcCache.set(key, svc);
    return svc;
  }
  return null;
};

const queryServiceByApiName = async ({
  key,
  client,
  databaseId,
  name
}: {
  key: string;
  client: any;
  databaseId: string;
  name: string;
}): Promise<any> => {
  const result = await client.query({
    role: 'administrator',
    query: ApiByNameQuery,
    variables: { databaseId, name }
  });

  if (result.errors?.length) {
    console.error(result.errors);
    return null;
  }

  const data = result?.data;
  if (data?.api && data.api.isPublic === isPublic) {
    const svc = { data };
    svcCache.set(key, svc);
    return svc;
  }
  return null;
};

export const getApiConfig = async (req: any): Promise<any> => {
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
    const settings = getGraphileSettings({
      simpleInflection: true,
      schema: schemata
    });

    console.log('remove THESE ignores!!!');
    // @ts-ignore
    const schema = await getSchema(rootPgPool, settings);
    // @ts-ignore
    const client = new GraphileQuery({ schema, pool: rootPgPool, settings });

    if (!isPublic) {
      if (req.get('X-Schemata')) {
        svc = getHardCodedSchemata({
          key,
          schemata: req.get('X-Schemata'),
          databaseId: req.get('X-Database-Id')
        });
      } else if (req.get('X-Api-Name')) {
        svc = await queryServiceByApiName({
          key,
          client,
          name: req.get('X-Api-Name'),
          databaseId: req.get('X-Database-Id')
        });
      } else if (req.get('X-Meta-Schema')) {
        svc = getMetaSchema({
          key,
          databaseId: req.get('X-Database-Id')
        });
      } else {
        svc = await queryServiceByDomainAndSubdomain({
          key,
          client,
          domain,
          subdomain
        });
      }
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
