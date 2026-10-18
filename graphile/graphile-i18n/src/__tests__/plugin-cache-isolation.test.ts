import { createI18nPlugin } from '../plugin';

function makeBuild(origin: string, translatedField: string) {
  const idCodec = { name: 'uuid' };
  const textCodec = { name: 'text' };
  const baseCodec = {
    name: 'posts',
    attributes: {
      id: { codec: idCodec },
      [translatedField]: { codec: textCodec },
    },
    extensions: {
      pg: { schemaName: 'tenant', name: 'posts' },
      tags: { i18n: 'posts_translations' },
    },
  };
  const translationCodec = {
    name: 'postsTranslations',
    attributes: {
      posts_id: { codec: idCodec },
      lang_code: { codec: textCodec },
      [translatedField]: { codec: textCodec },
    },
    extensions: {
      pg: { schemaName: 'tenant', name: 'posts_translations' },
    },
  };
  class GraphQLObjectType {
    readonly origin = origin;
    constructor(readonly config: any) {}
  }
  class GraphQLNonNull {
    constructor(readonly ofType: any) {}
  }
  const build = {
    input: {
      pgRegistry: {
        pgCodecs: { baseCodec, translationCodec },
        pgResources: {
          base: {
            codec: baseCodec,
            uniques: [{ isPrimary: true, attributes: ['id'] }],
          },
          translation: { codec: translationCodec },
        },
      },
    },
    inflection: {
      camelCase: (value: string) => value,
      tableType: () => 'Post',
    },
    graphql: {
      GraphQLString: { name: 'String', origin },
      GraphQLObjectType,
      GraphQLNonNull,
    },
    extend: (base: object, extra: object) => ({ ...base, ...extra }),
  };
  return { build, baseCodec };
}

describe('I18nPlugin cache ownership', () => {
  it('keeps registry and GraphQL types local to the exact build', () => {
    const plugin = createI18nPlugin();
    const init = (plugin.schema!.hooks!.init as any).callback;
    const fieldsHook = plugin.schema!.hooks!.GraphQLObjectType_fields as any;
    const tenantA = makeBuild('tenant-a', 'title');
    const tenantB = makeBuild('tenant-b', 'summary');

    init({}, tenantA.build);
    init({}, tenantB.build);

    const fieldsA = fieldsHook({}, tenantA.build, {
      scope: { isPgClassType: true, pgCodec: tenantA.baseCodec },
    });
    const fieldsAAgain = fieldsHook({}, tenantA.build, {
      scope: { isPgClassType: true, pgCodec: tenantA.baseCodec },
    });
    const fieldsB = fieldsHook({}, tenantB.build, {
      scope: { isPgClassType: true, pgCodec: tenantB.baseCodec },
    });
    const localeTypeA = fieldsA.localeStrings.type.ofType;
    const localeTypeB = fieldsB.localeStrings.type.ofType;

    expect(localeTypeA).toBe(fieldsAAgain.localeStrings.type.ofType);
    expect(localeTypeA).not.toBe(localeTypeB);
    expect(localeTypeA.origin).toBe('tenant-a');
    expect(localeTypeB.origin).toBe('tenant-b');
    expect(localeTypeA.config.fields).toHaveProperty('title');
    expect(localeTypeA.config.fields).not.toHaveProperty('summary');
    expect(localeTypeB.config.fields).toHaveProperty('summary');
  });
});
