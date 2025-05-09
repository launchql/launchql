import { getGraphileSettings } from '@launchql/graphile-settings';
import { GraphileQuery, getSchema } from '@launchql/graphile-query';
import { ApiQuery, ApiByNameQuery } from './gql';
import { svcCache, getRootPgPool } from '@launchql/server-utils';
import errorPage404 from '../errors/404';
import errorPage50x from '../errors/50x';
import { LaunchQLOptions } from '@launchql/types';
import { Response, NextFunction } from 'express';

export const getSubdomain = (reqDomains: string[]): string | null => {
  const names = reqDomains.filter((name) => !['www'].includes(name));
  return !names.length ? null : names.join('.');
};

export const createApiMiddleware = (opts: LaunchQLOptions) => {
  return async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const svc = await getApiConfig(opts, req);
      if (!svc) {
        res.status(404).send(errorPage404);
        return;
      }
      req.apiInfo = svc;
      req.databaseId = svc.data.api.databaseId;
      next();
    } catch (e: any) {
      if (e.message.match(/does not exist/)) {
        res.status(404).send(errorPage404);
      } else {
        console.error(e);
        res.status(500).send(errorPage50x);
      }
    }
  };
};

const getHardCodedSchemata = ({
  opts,
  schemata,
  databaseId,
  key
}: {
  opts: LaunchQLOptions,
  schemata: string;
  databaseId: string;
  key: string;
}): any => {
  const svc = {
    data: {
      api: {
        databaseId,
        isPublic: false,
        dbname: opts.pg.database,
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
  opts,
  key,
  databaseId
}: {
  opts: LaunchQLOptions,
  key: string;
  databaseId: string;
}): any => {
  const schemata = opts.graphile.metaSchemas;
  const svc = {
    data: {
      api: {
        databaseId,
        isPublic: false,
        dbname: opts.pg.database,
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
  opts,
  key,
  client,
  domain,
  subdomain
}: {
  opts: LaunchQLOptions,
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
    if (!data.api || data.api.isPublic !== opts.graphile.isPublic) return null;
    const svc = { data };
    svcCache.set(key, svc);
    return svc;
  }
  return null;
};

const queryServiceByApiName = async ({
  opts,
  key,
  client,
  databaseId,
  name
}: {
  opts: LaunchQLOptions,
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
  if (data?.api && data.api.isPublic === opts.graphile.isPublic) {
    const svc = { data };
    svcCache.set(key, svc);
    return svc;
  }
  return null;
};

const getSvcKey = (opts: LaunchQLOptions, req: any): string => {
  const domain = req.urlDomains.domain;
  const key = req.urlDomains.subdomains
    .filter((name: string) => !['www'].includes(name))
    .concat(domain)
    .join('.');

  if (!opts.graphile.isPublic) {
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

export const getApiConfig = async (opts: LaunchQLOptions, req: any): Promise<any> => {
  const rootPgPool = getRootPgPool(opts.pg);
  const subdomain = getSubdomain(req.urlDomains.subdomains);
  const domain = req.urlDomains.domain;

  const key = getSvcKey(opts, req);
  req.svc_key = key;

  const schemata = opts.graphile.metaSchemas

  let svc;
  if (svcCache.has(key)) {
    svc = svcCache.get(key);
  } else {
    const settings = getGraphileSettings({
      graphile: {
        schema: schemata
      }
    });

    console.log('remove THESE ignores!!!');
    // @ts-ignore
    const schema = await getSchema(rootPgPool, settings);
    // @ts-ignore
    const client = new GraphileQuery({ schema, pool: rootPgPool, settings });

    if (!opts.graphile.isPublic) {
      if (req.get('X-Schemata')) {
        svc = getHardCodedSchemata({
          opts,
          key,
          schemata: req.get('X-Schemata'),
          databaseId: req.get('X-Database-Id')
        });
      } else if (req.get('X-Api-Name')) {
        svc = await queryServiceByApiName({
          opts,
          key,
          client,
          name: req.get('X-Api-Name'),
          databaseId: req.get('X-Database-Id')
        });
      } else if (req.get('X-Meta-Schema')) {
        svc = getMetaSchema({
          opts,
          key,
          databaseId: req.get('X-Database-Id')
        });
      } else {
        svc = await queryServiceByDomainAndSubdomain({
          opts,
          key,
          client,
          domain,
          subdomain
        });
      }
    } else {
      svc = await queryServiceByDomainAndSubdomain({
        opts,
        key,
        client,
        domain,
        subdomain
      });
    }
  }
  return svc;
};
