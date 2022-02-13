import DataLoader from 'dataloader';
import langParser from 'accept-language-parser';
import { ACCEPTED_LANGUAGES } from './env';

const escapeIdentifier = (str) => `"${str.replace(/"/g, '""')}"`;

export const makeLanguageDataLoaderForTable = (_req) => {
  const cache = new Map();
  return (
    props,
    pgClient,
    languageCodes,
    identifer,
    idType,
    sqlField,
    gqlField
  ) => {
    let dataLoader = cache.get(props);
    if (!dataLoader) {
      const { table, coalescedFields, variationsTableName, key } = props;
      const schemaName = escapeIdentifier(table.namespaceName);
      const baseTable = escapeIdentifier(table.name);
      const variationTable = escapeIdentifier(variationsTableName);
      const joinKey = escapeIdentifier(key);
      const fields = coalescedFields.join(', ');
      const b = [schemaName, baseTable].join('.');
      const v = [schemaName, variationTable].join('.');
      dataLoader = new DataLoader(async (ids) => {
        const { rows } = await pgClient.query(
          `
            select *
            from unnest($1::${idType}[]) ids(${identifer})
            inner join lateral (
              select b.${identifer}, v.${sqlField} as "${gqlField}", ${fields}
              from ${b} b
              left join ${v} v
              on (v.${joinKey} = b.${identifer} and array_position($2, ${sqlField}) is not null)
              where b.${identifer} = ids.${identifer}
              order by array_position($2, ${sqlField}) asc nulls last
              limit 1
            ) tmp on (true)
            `,
          [ids, languageCodes]
        );
        return ids.map((id) => rows.find((r) => r.id === id));
      });
      cache.set(props, dataLoader);
    }
    return dataLoader;
  };
};

export const additionalGraphQLContextFromRequest = (req, res) => {
  const language = langParser.pick(
    ACCEPTED_LANGUAGES,
    req.get('accept-language')
  );

  // Accept-Language: *
  // Accept-Language: en-US,en;q=0.5
  // Accept-Language: fr-CH, fr;q=0.9, en;q=0.8, de;q=0.7, *;q=0.5
  return {
    langCodes: [language], // in future make fallback languages
    getLanguageDataLoader: makeLanguageDataLoaderForTable(req)
  };
};
