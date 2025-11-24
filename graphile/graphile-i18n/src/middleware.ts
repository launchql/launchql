import DataLoader from 'dataloader';
import type { IncomingHttpHeaders } from 'http';
import type { PoolClient } from 'pg';
import langParser from 'accept-language-parser';

import env from './env';

export interface LanguageLoaderProps {
  table: {
    name: string;
    namespaceName: string;
  };
  coalescedFields: string[];
  variationsTableName: string;
  key: string | null;
}

export type LanguageRow = Record<string, unknown>;

export type LanguageDataLoader = DataLoader<string | number, LanguageRow | undefined>;

export type LanguageDataLoaderFactory = (
  props: LanguageLoaderProps,
  pgClient: PoolClient,
  languageCodes: readonly string[],
  identifier: string,
  idType: string,
  sqlField: string,
  gqlField: string
) => LanguageDataLoader;

export interface I18nRequestLike {
  get?: (header: string) => string | undefined;
  headers?: IncomingHttpHeaders;
}

export interface I18nGraphQLContext {
  langCodes: string[];
  getLanguageDataLoader: LanguageDataLoaderFactory;
}

const escapeIdentifier = (str: string): string => `"${str.replace(/"/g, '""')}"`;

export const makeLanguageDataLoaderForTable = (
  _req?: I18nRequestLike
): LanguageDataLoaderFactory => {
  const cache = new Map<LanguageLoaderProps, LanguageDataLoader>();

  return (
    props: LanguageLoaderProps,
    pgClient: PoolClient,
    languageCodes: readonly string[],
    identifier: string,
    idType: string,
    sqlField: string,
    gqlField: string
  ): LanguageDataLoader => {
    let dataLoader = cache.get(props);

    if (!dataLoader) {
      const { table, coalescedFields, variationsTableName, key } = props;
      const schemaName = escapeIdentifier(table.namespaceName);
      const baseTable = escapeIdentifier(table.name);
      const variationTable = escapeIdentifier(variationsTableName);
      const joinKey = escapeIdentifier(key ?? identifier);
      const fields = coalescedFields.join(', ');
      const baseAlias = [schemaName, baseTable].join('.');
      const variationAlias = [schemaName, variationTable].join('.');

      dataLoader = new DataLoader<string | number, LanguageRow | undefined>(
        async (ids) => {
          const { rows } = await pgClient.query<LanguageRow>(
            `
              select *
              from unnest($1::${idType}[]) ids(${identifier})
              inner join lateral (
                select b.${identifier}, v.${sqlField} as "${gqlField}", ${fields}
                from ${baseAlias} b
                left join ${variationAlias} v
                  on (v.${joinKey} = b.${identifier} and array_position($2, ${sqlField}) is not null)
                where b.${identifier} = ids.${identifier}
                order by array_position($2, ${sqlField}) asc nulls last
                limit 1
              ) tmp on (true)
              `,
            [ids, languageCodes]
          );
          return ids.map((id) =>
            rows.find((row: LanguageRow) => row?.[identifier] === id)
          );
        }
      );

      cache.set(props, dataLoader);
    }

    return dataLoader;
  };
};

const getAcceptLanguageHeader = (req?: I18nRequestLike): string | undefined => {
  if (!req) return undefined;
  const header =
    typeof req.get === 'function'
      ? req.get('accept-language')
      : req.headers?.['accept-language'];

  return Array.isArray(header) ? header.join(',') : header;
};

export const additionalGraphQLContextFromRequest = async (
  req?: I18nRequestLike,
  _res?: unknown
): Promise<I18nGraphQLContext> => {
  const acceptLanguage = getAcceptLanguageHeader(req);
  const language =
    langParser.pick(env.ACCEPTED_LANGUAGES, acceptLanguage) ??
    env.ACCEPTED_LANGUAGES[0];

  const langCodes = language ? [language] : env.ACCEPTED_LANGUAGES;

  return {
    langCodes,
    getLanguageDataLoader: makeLanguageDataLoaderForTable(req)
  };
};

export default additionalGraphQLContextFromRequest;
