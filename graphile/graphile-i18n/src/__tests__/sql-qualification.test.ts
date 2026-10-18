import sql from 'pg-sql2';

import { buildI18nLookupSql, resolveI18nTableInfo } from '../plugin';

describe('i18n SQL qualification', () => {
  it('resolves exact physical resources and quotes hostile identifiers', () => {
    const uuidCodec = {
      name: 'uuid',
      sqlType: sql.identifier('pg_catalog', 'uuid'),
    };
    const textCodec = {
      name: 'text',
      sqlType: sql.identifier('pg_catalog', 'text'),
    };
    const hostile = 'title" FROM secrets --';
    const baseCodec: any = {
      name: 'articles',
      attributes: {
        id: { codec: uuidCodec },
        [hostile]: { codec: textCodec },
      },
      extensions: { tags: { i18n: 'article_translations' } },
    };
    const translationCodec: any = {
      name: 'articleTranslations',
      attributes: {
        article_id: { codec: uuidCodec },
        lang_code: { codec: textCodec },
        [hostile]: { codec: textCodec },
      },
      extensions: {
        pg: {
          serviceName: 'tenant_service',
          schemaName: 'tenant-app',
          name: 'article_translations',
        },
      },
    };
    const build: any = {
      sql,
      inflection: { camelCase: (value: string) => value },
      input: {
        pgRegistry: {
          pgResources: {
            articles: {
              codec: baseCodec,
              parameters: null,
              uniques: [{ isPrimary: true, attributes: ['id'] }],
              extensions: {
                pg: {
                  serviceName: 'tenant_service',
                  schemaName: 'tenant-app',
                  name: 'articles',
                },
              },
            },
            translations: { codec: translationCodec, parameters: null },
          },
        },
      },
    };

    const info = resolveI18nTableInfo(build, baseCodec, 'lang_code', ['text'])!;
    const query = buildI18nLookupSql(info, 'lang_code');

    expect(info.baseTable).toBe('articles');
    expect(query).toContain('FROM "tenant-app".articles b');
    expect(query).toContain('LEFT JOIN "tenant-app".article_translations v');
    expect(query).toContain('"title"" FROM secrets --"');
    expect(query).toContain('$1::"pg_catalog"."uuid"');
  });

  it('rejects a same-named translation table from another schema', () => {
    const uuidCodec = {
      name: 'uuid',
      sqlType: sql.identifier('pg_catalog', 'uuid'),
    };
    const baseCodec: any = {
      name: 'articles',
      attributes: { id: { codec: uuidCodec } },
      extensions: { tags: { i18n: 'article_translations' } },
    };
    const build: any = {
      sql,
      inflection: { camelCase: (value: string) => value },
      input: {
        pgRegistry: {
          pgResources: {
            articles: {
              codec: baseCodec,
              parameters: null,
              uniques: [{ isPrimary: true, attributes: ['id'] }],
              extensions: {
                pg: {
                  serviceName: 'tenant_service',
                  schemaName: 'tenant_a',
                  name: 'articles',
                },
              },
            },
            translations: {
              parameters: null,
              codec: {
                attributes: {},
                extensions: {
                  pg: {
                    serviceName: 'tenant_service',
                    schemaName: 'tenant_b',
                    name: 'article_translations',
                  },
                },
              },
            },
          },
        },
      },
    };

    expect(() =>
      resolveI18nTableInfo(build, baseCodec, 'lang_code', ['text'])
    ).toThrow(/same-service, same-schema/);
  });
});
