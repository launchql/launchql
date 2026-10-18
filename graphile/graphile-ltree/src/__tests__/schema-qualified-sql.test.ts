import sql from 'pg-sql2';

import { createLtreeOperatorFactory } from '../plugins/connection-filter-operators';
import {
  resolveLtreeExtensionInfo,
  type LtreeExtensionInfo,
} from '../plugins/detect-ltree';
import { createFolderOperatorFactory } from '../plugins/folder-filter-operators';
import { LtreeCodecPlugin } from '../plugins/ltree-codec';

const codec = (name: string, schemaName = 'extension_tools') => ({
  name,
  extensions: {
    pg: {
      serviceName: 'tenant_service',
      schemaName,
      name,
    },
  },
});

const helperResource = (
  name: 'to_path' | 'to_query',
  returnCodec: any,
  schemaName = 'tenant_helpers'
) => ({
  name: `resource_${name}`,
  parameters: [{ codec: codec('text', 'pg_catalog') }],
  codec: returnCodec,
  extensions: {
    pg: {
      serviceName: 'tenant_service',
      schemaName,
      name,
    },
  },
});

const registryBuild = (
  options: {
    includeHelpers?: boolean;
    ltreeCodec?: any;
    lqueryCodec?: any;
    resources?: Record<string, any>;
  } = {}
) => {
  const ltreeCodec = options.ltreeCodec ?? codec('ltree');
  const lqueryCodec = options.lqueryCodec ?? codec('lquery');
  const includeHelpers = options.includeHelpers ?? false;
  let pgResources = options.resources;
  if (!pgResources) {
    if (includeHelpers) {
      pgResources = {
        toPath: helperResource('to_path', ltreeCodec),
        toQuery: helperResource('to_query', lqueryCodec),
      };
    } else {
      pgResources = {};
    }
  }
  return {
    input: {
      pgRegistry: {
        pgCodecs: { ltree: ltreeCodec, lquery: lqueryCodec },
        pgResources,
      },
    },
  };
};

const resolveSql = (
  info: LtreeExtensionInfo,
  factory: ReturnType<typeof createFolderOperatorFactory>,
  operatorName: string,
  input: string
) => {
  const registration = factory({ pgLtreeExtensionInfo: info } as any).find(
    (entry) => entry.operatorName === operatorName
  )!;
  const fragment = registration.spec.resolve!(
    sql.identifier('path'),
    sql.null,
    input,
    null,
    { fieldName: 'path', operatorName }
  );
  return sql.compile(fragment!);
};

describe('ltree extension identity', () => {
  it('qualifies and annotates a native codec from gather introspection', async () => {
    const gatherHook = (LtreeCodecPlugin as any).gather.hooks
      .pgCodecs_findPgCodec;
    const event: any = {
      pgCodec: {
        name: 'ltree',
        sqlType: sql.fragment`ltree`,
        extensions: undefined,
      },
      pgType: { typname: 'ltree', typnamespace: '910', _id: '911' },
      serviceName: 'tenant_service',
    };
    const originalCodec = event.pgCodec;
    await gatherHook(
      {
        helpers: {
          pgIntrospection: {
            getNamespace: jest
              .fn()
              .mockResolvedValue({ nspname: 'extension_tools' }),
          },
        },
      },
      event
    );

    expect(event.pgCodec).toBe(originalCodec);
    expect(event.pgCodec.extensions).toMatchObject({
      oid: '911',
      pg: {
        serviceName: 'tenant_service',
        schemaName: 'extension_tools',
        name: 'ltree',
      },
    });
    expect(sql.compile(event.pgCodec.sqlType).text).toBe(
      '"extension_tools"."ltree"'
    );
  });

  it('derives codec and actual helper schemas from one service/build', () => {
    const info = resolveLtreeExtensionInfo(
      registryBuild({ includeHelpers: true })
    );
    expect(info).toMatchObject({
      serviceName: 'tenant_service',
      schemaName: 'extension_tools',
      helperSchemaName: 'tenant_helpers',
    });
  });

  it('fails closed on missing codec identity and incomplete helpers', () => {
    expect(() =>
      resolveLtreeExtensionInfo(
        registryBuild({
          ltreeCodec: { name: 'ltree', extensions: { pg: { name: 'ltree' } } },
        })
      )
    ).toThrow(/missing exact service\/schema metadata/);

    const ltreeCodec = codec('ltree');
    expect(() =>
      resolveLtreeExtensionInfo(
        registryBuild({
          ltreeCodec,
          resources: {
            onlyPath: helperResource('to_path', ltreeCodec),
          },
        })
      )
    ).toThrow(/incomplete or ambiguous/);
  });

  it('fails closed when ltree and lquery identities disagree', () => {
    expect(() =>
      resolveLtreeExtensionInfo(
        registryBuild({
          lqueryCodec: codec('lquery', 'other_extension_schema'),
        })
      )
    ).toThrow(/does not match/);
  });
});

describe('ltree SQL qualification', () => {
  it('qualifies helper functions and operators in the folder factory', () => {
    const info = resolveLtreeExtensionInfo(
      registryBuild({ includeHelpers: true })
    )!;
    const within = resolveSql(
      info,
      createFolderOperatorFactory(),
      'within',
      '/a/b'
    );
    const glob = resolveSql(
      info,
      createFolderOperatorFactory(),
      'glob',
      '/a/*'
    );

    expect(within.text).toContain('OPERATOR("extension_tools".<@)');
    expect(within.text).toContain('"tenant_helpers"."to_path"($1)');
    expect(glob.text).toContain('OPERATOR("extension_tools".~)');
    expect(glob.text).toContain('"tenant_helpers"."to_query"($1)');
  });

  it('qualifies inline casts when helper functions are absent', () => {
    const info = resolveLtreeExtensionInfo(registryBuild())!;
    const within = resolveSql(
      info,
      createFolderOperatorFactory(),
      'within',
      '/a/b'
    );
    const glob = resolveSql(
      info,
      createFolderOperatorFactory(),
      'glob',
      '/a/*'
    );

    expect(within.text).toContain('::"extension_tools"."ltree"');
    expect(within.text).toContain('OPERATOR("extension_tools".<@)');
    expect(glob.text).toContain('::"extension_tools"."lquery"');
    expect(glob.text).toContain('OPERATOR("extension_tools".~)');
  });

  it('qualifies the deprecated duplicate operator factory too', () => {
    const info = resolveLtreeExtensionInfo(registryBuild())!;
    const result = resolveSql(
      info,
      createLtreeOperatorFactory() as ReturnType<
        typeof createFolderOperatorFactory
      >,
      'isDescendantOf',
      '/a/b'
    );
    expect(result.text).toContain('OPERATOR("extension_tools".@>)');
    expect(result.text).toContain('::"extension_tools"."ltree"');
  });
});
