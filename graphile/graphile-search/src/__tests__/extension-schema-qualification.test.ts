import sql from 'pg-sql2';

import { createPgvectorAdapter } from '../adapters/pgvector';
import { createTrgmAdapter } from '../adapters/trgm';
import { createTrgmOperatorFactories } from '../codecs/operator-factories';
import { VectorCodecPlugin } from '../codecs/vector-codec';
import {
  collectSearchExtensionSchemas,
  requireBuildExtensionSchema,
  resolveBuildExtensionSchema,
  type SearchExtensionSchemas,
} from '../extension-metadata';

const extensionBinding = (
  overrides: Partial<SearchExtensionSchemas> = {}
): SearchExtensionSchemas => ({
  serviceName: 'tenant_service',
  pgTrgmSchema: 'extension_tools',
  pgvectorSchema: 'extension_tools',
  ...overrides,
});

const introspection = (extensions: any[]) =>
  ({
    extensions,
    getNamespace: ({ id }: { id: string }) =>
      id === '910' ? { nspname: 'extension_tools' } : undefined,
  }) as any;

describe('search extension schema binding', () => {
  it('collects exact pg_trgm and pgvector schemas from one service introspection', () => {
    expect(
      collectSearchExtensionSchemas(
        introspection([
          { extname: 'pg_trgm', extnamespace: '910' },
          { extname: 'vector', extnamespace: '910' },
        ]),
        'tenant_service'
      )
    ).toEqual(extensionBinding());
  });

  it('fails closed on ambiguous, unresolved, or cross-service schemas', () => {
    expect(() =>
      collectSearchExtensionSchemas(
        introspection([
          { extname: 'pg_trgm', extnamespace: '910' },
          { extname: 'pg_trgm', extnamespace: '910' },
        ]),
        'tenant_service'
      )
    ).toThrow(/ambiguous pg_trgm/);

    expect(() =>
      collectSearchExtensionSchemas(
        introspection([{ extname: 'pg_trgm', extnamespace: '999' }]),
        'tenant_service'
      )
    ).toThrow(/cannot resolve the namespace/);

    expect(() =>
      requireBuildExtensionSchema(
        {
          pgSearchExtensionSchemasByService: new Map([
            [
              'a',
              extensionBinding({ serviceName: 'a', pgTrgmSchema: 'ext_a' }),
            ],
            [
              'b',
              extensionBinding({ serviceName: 'b', pgTrgmSchema: 'ext_b' }),
            ],
          ]),
        },
        'pg_trgm'
      )
    ).toThrow(/ambiguous schemas/);

    expect(
      resolveBuildExtensionSchema(
        {
          pgSearchExtensionSchemasByService: new Map([
            ['tenant_service', extensionBinding({ pgTrgmSchema: null })],
          ]),
        },
        'pg_trgm'
      )
    ).toBeNull();
  });
});

describe('pg_trgm SQL qualification', () => {
  const adapter = createTrgmAdapter({ requireIntentionalSearch: false });

  it('binds metadata to the eligible attribute and qualifies functions', () => {
    const codec = {
      name: 'documents',
      attributes: {
        title: {
          codec: { name: 'text' },
          extensions: { searchExtensionSchemas: extensionBinding() },
        },
      },
    };
    const [column] = adapter.detectColumns(codec, {});
    const result = adapter.buildFilterApply(
      sql,
      sql.identifier('documents'),
      column,
      { value: 'memory density', threshold: 0.2 },
      {}
    );
    expect(sql.compile(result!.whereClause!).text).toContain(
      '"extension_tools"."similarity"("documents"."title", $1)'
    );

    const registrations = createTrgmOperatorFactories()({
      sql,
      pgSearchExtensionSchemasByService: new Map([
        ['tenant_service', extensionBinding()],
      ]),
      getTypeByName: () => ({ name: 'TrgmSearchInput' }),
    } as any);
    const similar = registrations.find(
      (entry) => entry.operatorName === 'similarTo'
    )!;
    const fragment = similar.spec.resolve!(
      sql.identifier('title'),
      sql.null,
      { value: 'memory', threshold: 0.3 },
      null,
      { fieldName: 'title', operatorName: 'similarTo' }
    );
    expect(sql.compile(fragment!).text).toContain(
      '"extension_tools"."similarity"'
    );
  });

  it('fails closed when an eligible attribute has no bound schema', () => {
    expect(() =>
      adapter.detectColumns(
        {
          name: 'documents',
          attributes: { title: { codec: { name: 'text' } } },
        },
        {}
      )
    ).toThrow(/missing service-bound extension schema/);
  });
});

describe('pgvector SQL qualification', () => {
  const vectorCodec = {
    name: 'vector',
    extensions: {
      pg: {
        serviceName: 'tenant_service',
        schemaName: 'extension_tools',
        name: 'vector',
      },
    },
  };

  it('qualifies and annotates a native vector codec during gather', async () => {
    const gatherHook = (VectorCodecPlugin as any).gather.hooks
      .pgCodecs_findPgCodec;
    const event: any = {
      pgCodec: {
        name: 'vector',
        sqlType: sql.fragment`vector`,
        extensions: undefined,
      },
      pgType: { typname: 'vector', typnamespace: '910', _id: '912' },
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
    expect(event.pgCodec.extensions.pg).toEqual({
      serviceName: 'tenant_service',
      schemaName: 'extension_tools',
      name: 'vector',
    });
    expect(sql.compile(event.pgCodec.sqlType).text).toBe(
      '"extension_tools"."vector"'
    );
  });

  it('qualifies the vector cast and distance operator', () => {
    const adapter = createPgvectorAdapter();
    const [column] = adapter.detectColumns(
      {
        name: 'documents',
        attributes: {
          embedding: {
            codec: vectorCodec,
            extensions: { searchExtensionSchemas: extensionBinding() },
          },
        },
      },
      {}
    );
    const result = adapter.buildFilterApply(
      sql,
      sql.identifier('documents'),
      column,
      { vector: [1, 0, 0], metric: 'COSINE' },
      {}
    );
    const compiled = sql.compile(result!.scoreExpression);
    expect(compiled.text).toContain('::"extension_tools"."vector"');
    expect(compiled.text).toContain('OPERATOR("extension_tools".<=>)');
  });

  it('fails closed when codec and extension identities disagree', () => {
    const adapter = createPgvectorAdapter();
    expect(() =>
      adapter.detectColumns(
        {
          name: 'documents',
          attributes: {
            embedding: {
              codec: vectorCodec,
              extensions: {
                searchExtensionSchemas: extensionBinding({
                  pgvectorSchema: 'other_extension_schema',
                }),
              },
            },
          },
        },
        {}
      )
    ).toThrow(/does not match extension/);
  });
});
