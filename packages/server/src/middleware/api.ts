import { getGraphileSettings } from 'graphile-settings';
import { GraphileQuery, getSchema } from 'graphile-query';
import { ApiQuery, ApiByNameQuery, ListOfAllDomainsOfDb } from './gql';
import { svcCache, getRootPgPool } from '@launchql/server-utils';
import { getNodeEnv } from '@launchql/types';
import errorPage404Message from '../errors/404-message';
import errorPage50x from '../errors/50x';
import { LaunchQLOptions } from '@launchql/types';
import { Response, Request, NextFunction } from 'express';
import { Pool } from 'pg';

const getPortFromRequest = (req: Request): string | null => {
  const host = req.headers.host;
  if (!host) return null;

  const parts = host.split(':');
  return parts.length === 2 ? `:${parts[1]}` : null;
};

export const getSubdomain = (reqDomains: string[]): string | null => {
  const names = reqDomains.filter((name) => !['www'].includes(name));
  return !names.length ? null : names.join('.');
};

export const createApiMiddleware = (opts: LaunchQLOptions) => {
  return async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
      const svc = await getApiConfig(opts, req);

      if (svc?.errorHtml) {
        res.status(404).send(errorPage404Message('API not found', svc.errorHtml));
        return;
      } else if (!svc) {
        res.status(404).send(errorPage404Message('API service not found for the given domain/subdomain.'));
        return;
      }
      req.apiInfo = svc;
      req.databaseId = svc.data.api.databaseId;
      next();
    } catch (e: any) {
      if (e.code === 'NO_VALID_SCHEMAS') {
        res.status(404).send(errorPage404Message(e.message));
      } else if (e.message.match(/does not exist/)) {
        res.status(404).send(errorPage404Message('The resource you’re looking for does not exist.'));
      } else {
        console.error(e);
        res.status(500).send(errorPage50x('API Error'));
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
        schemaNames: { nodes: [] as Array<{ schemaName: string }> },
        apiModules: { nodes: [] as Array<any> }
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
        schemaNames: { nodes: [] as Array<{ schemaName: string }> },
        apiModules: { nodes: [] as Array<any> }
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

const validateSchemata = async (pool: Pool, schemata: string[]): Promise<string[]> => {
  const result = await pool.query(
    `SELECT schema_name FROM information_schema.schemata WHERE schema_name = ANY($1::text[])`,
    [schemata]
  );
  return result.rows.map(row => row.schema_name);
};

export const getApiConfig = async (opts: LaunchQLOptions, req: Request): Promise<any> => {
  const rootPgPool = getRootPgPool(opts.pg);
  // @ts-ignore
  const subdomain = getSubdomain(req.urlDomains.subdomains);
  const domain: string = req.urlDomains.domain as string;

  const key = getSvcKey(opts, req);
  req.svc_key = key;

  let svc;
  if (svcCache.has(key)) {
    svc = svcCache.get(key);
  } else {
    const allSchemata = opts.graphile.metaSchemas || [];
    const validatedSchemata = await validateSchemata(rootPgPool, allSchemata);

    if (validatedSchemata.length === 0) {
      const message = `No valid schemas found for domain: ${domain}, subdomain: ${subdomain}`;
      const error: any = new Error(message);
      error.code = 'NO_VALID_SCHEMAS';
      throw error;
    }

    const settings = getGraphileSettings({
      graphile: {
        schema: validatedSchemata
      }
    });

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

      if (!svc) {
        if (getNodeEnv() === 'development') {

          // TODO ONLY DO THIS IN DEV MODE
          const fallbackResult = await client.query({
            role: 'administrator',
            // @ts-ignore
            query: ListOfAllDomainsOfDb,
            // variables: { databaseId }
          });

          if (!fallbackResult.errors?.length && fallbackResult.data?.apis?.nodes?.length) {
            const port = getPortFromRequest(req);

            const allDomains = fallbackResult.data.apis.nodes.flatMap((api: any) =>
              api.domains.nodes.map((d: any) => ({
                domain: d.domain,
                subdomain: d.subdomain,
                href: d.subdomain
                  ? `http://${d.subdomain}.${d.domain}${port}/graphiql`
                  : `http://${d.domain}${port}/graphiql`
              }))

            );

            const linksHtml = allDomains.length
              ? `<ul class="mt-4 pl-5 list-disc space-y-1">` +
              allDomains
                .map(
                  (d: any) =>
                    `<li><a href="${d.href}" class="text-brand hover:underline">${d.href}</a></li>`
                )
                .join('') +
              `</ul>`
              : `<p class="text-gray-600">No APIs are currently registered for this database.</p>`;

            const errorHtml = `
          <p class="text-sm text-gray-700">Try some of these:</p>
          <div class="mt-4">
            ${linksHtml}
          </div>
        `.trim();

            return {
              errorHtml
            };
          }
        }
      }

    }
  }
  return svc;
};
