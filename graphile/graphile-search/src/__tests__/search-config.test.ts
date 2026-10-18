/**
 * Tests for Phase D (per-table @searchConfig smart tag) and Phase E (chunk querying).
 *
 * These tests verify the pure helper functions extracted from plugin.ts and pgvector.ts
 * without requiring a database connection.
 */

// We need to test the internal helpers. Since they're not exported,
// we test them indirectly through the adapter/plugin behavior using mocked codecs.

import { createBm25Adapter } from '../adapters/bm25';
import { createPgvectorAdapter } from '../adapters/pgvector';
import { createTsvectorAdapter } from '../adapters/tsvector';
import { createUnifiedSearchPlugin } from '../plugin';

const VECTOR_ADAPTER_IDENTITY = {
  serviceName: 'main',
  extensionSchema: 'extension_tools',
};

const vectorAttribute = () => ({
  codec: {
    name: 'vector',
    extensions: {
      pg: {
        serviceName: 'main',
        schemaName: 'extension_tools',
        name: 'vector',
      },
    },
  },
  extensions: {
    searchExtensionSchemas: {
      serviceName: 'main',
      pgTrgmSchema: 'extension_tools',
      pgvectorSchema: 'extension_tools',
    },
  },
});

// ─── pgvector adapter: chunk detection ────────────────────────────────────────

describe('pgvector adapter — chunk querying (Phase E)', () => {
  describe('detectColumns with @hasChunks smart tag', () => {
    const adapter = createPgvectorAdapter();

    it('detects vector columns without chunks info when no @hasChunks tag', () => {
      const codec = {
        name: 'documents',
        attributes: {
          id: { codec: { name: 'uuid' } },
          embedding: vectorAttribute(),
        },
        extensions: { tags: {} },
      };

      const columns = adapter.detectColumns(codec, {});
      expect(columns).toHaveLength(1);
      expect(columns[0].attributeName).toBe('embedding');
      expect(columns[0].adapterData).toEqual(VECTOR_ADAPTER_IDENTITY);
    });

    it('includes chunksInfo when @hasChunks smart tag has metadata', () => {
      const codec = {
        name: 'documents',
        attributes: {
          id: { codec: { name: 'uuid' } },
          embedding: vectorAttribute(),
        },
        extensions: {
          tags: {
            hasChunks: {
              chunksTable: 'documents_chunks',
              parentFk: 'document_id',
              embeddingField: 'embedding',
            },
          },
          pg: { schemaName: 'app_public' },
        },
      };

      const columns = adapter.detectColumns(codec, {});
      expect(columns).toHaveLength(1);
      expect(columns[0].attributeName).toBe('embedding');
      expect(columns[0].adapterData).toEqual({
        ...VECTOR_ADAPTER_IDENTITY,
        chunksInfo: {
          chunksSchema: 'app_public',
          chunksTableName: 'documents_chunks',
          parentFkField: 'document_id',
          parentPkField: 'id',
          embeddingField: 'embedding',
          contentField: 'content',
          searchField: null,
          searchIndexes: [],
        },
      });
    });

    it('parses JSON-encoded @hasChunks smart tag', () => {
      const codec = {
        name: 'documents',
        attributes: {
          embedding: vectorAttribute(),
        },
        extensions: {
          tags: {
            hasChunks: JSON.stringify({
              chunksTable: 'doc_chunks',
              chunksSchema: 'private_schema',
              parentFk: 'doc_id',
              parentPk: 'doc_uuid',
              embeddingField: 'vec',
            }),
          },
        },
      };

      const columns = adapter.detectColumns(codec, {});
      expect(columns).toHaveLength(1);
      expect(columns[0].adapterData).toEqual({
        ...VECTOR_ADAPTER_IDENTITY,
        chunksInfo: {
          chunksSchema: 'private_schema',
          chunksTableName: 'doc_chunks',
          parentFkField: 'doc_id',
          parentPkField: 'doc_uuid',
          embeddingField: 'vec',
          contentField: 'content',
          searchField: null,
          searchIndexes: [],
        },
      });
    });

    it('uses default parentFk, parentPk, and embeddingField when not specified', () => {
      const codec = {
        name: 'documents',
        attributes: {
          embedding: vectorAttribute(),
        },
        extensions: {
          tags: {
            hasChunks: { chunksTable: 'my_chunks' },
          },
        },
      };

      const columns = adapter.detectColumns(codec, {});
      expect(columns[0].adapterData).toEqual({
        ...VECTOR_ADAPTER_IDENTITY,
        chunksInfo: {
          chunksSchema: null,
          chunksTableName: 'my_chunks',
          parentFkField: 'parent_id',
          parentPkField: 'id',
          embeddingField: 'embedding',
          contentField: 'content',
          searchField: null,
          searchIndexes: [],
        },
      });
    });

    it('inherits schema from parent codec when not explicitly set', () => {
      const codec = {
        name: 'documents',
        attributes: {
          embedding: vectorAttribute(),
        },
        extensions: {
          tags: {
            hasChunks: { chunksTable: 'my_chunks' },
          },
          pg: { schemaName: 'my_schema' },
        },
      };

      const columns = adapter.detectColumns(codec, {});
      expect(columns[0].adapterData).toEqual({
        ...VECTOR_ADAPTER_IDENTITY,
        chunksInfo: {
          chunksSchema: 'my_schema',
          chunksTableName: 'my_chunks',
          parentFkField: 'parent_id',
          parentPkField: 'id',
          embeddingField: 'embedding',
          contentField: 'content',
          searchField: null,
          searchIndexes: [],
        },
      });
    });

    it('ignores boolean true @hasChunks (no metadata to resolve)', () => {
      const codec = {
        name: 'documents',
        attributes: {
          embedding: vectorAttribute(),
        },
        extensions: {
          tags: { hasChunks: true },
        },
      };

      const columns = adapter.detectColumns(codec, {});
      expect(columns).toHaveLength(1);
      expect(columns[0].adapterData).toEqual(VECTOR_ADAPTER_IDENTITY);
    });

    it('ignores invalid JSON in @hasChunks string', () => {
      const codec = {
        name: 'documents',
        attributes: {
          embedding: vectorAttribute(),
        },
        extensions: {
          tags: { hasChunks: 'not-valid-json' },
        },
      };

      const columns = adapter.detectColumns(codec, {});
      expect(columns).toHaveLength(1);
      expect(columns[0].adapterData).toEqual(VECTOR_ADAPTER_IDENTITY);
    });

    it('does not detect chunks when enableChunkQuerying is false', () => {
      const noChunksAdapter = createPgvectorAdapter({ enableChunkQuerying: false });
      const codec = {
        name: 'documents',
        attributes: {
          embedding: vectorAttribute(),
        },
        extensions: {
          tags: {
            hasChunks: { chunksTable: 'doc_chunks' },
          },
        },
      };

      const columns = noChunksAdapter.detectColumns(codec, {});
      expect(columns).toHaveLength(1);
      expect(columns[0].adapterData).toEqual(VECTOR_ADAPTER_IDENTITY);
    });
  });

  describe('buildFilterApply with chunks', () => {
    const adapter = createPgvectorAdapter();

    // Mock sql object that mimics pg-sql2 behavior
    const mockSql = {
      identifier: (...names: string[]) => names.map((name) => `"${name}"`).join('.'),
      value: (val: any) => `'${val}'`,
      raw: (s: string) => s,
      fragment: (strings: TemplateStringsArray, ...values: any[]) => {
        let result = '';
        strings.forEach((str, i) => {
          result += str;
          if (i < values.length) result += String(values[i]);
        });
        return result;
      },
      join: (parts: any[], sep: string) => parts.join(sep),
      parens: (expr: any) => `(${expr})`,
    };
    // Make sql a tagged template function too
    const sql = Object.assign(
      (strings: TemplateStringsArray, ...values: any[]) => {
        let result = '';
        strings.forEach((str: string, i: number) => {
          result += str;
          if (i < values.length) result += String(values[i]);
        });
        return result;
      },
      mockSql,
    );

    it('generates standard query when no chunks info', () => {
      const result = adapter.buildFilterApply(
        sql,
        'tbl' as any,
        {
          attributeName: 'embedding',
          adapterData: VECTOR_ADAPTER_IDENTITY,
        },
        { vector: [1, 0, 0], metric: 'COSINE' },
        {},
      );

      expect(result).not.toBeNull();
      expect(result!.scoreExpression).toBeDefined();
      // Standard query should NOT contain chunks table reference
      expect(String(result!.scoreExpression)).not.toContain('chunks');
    });

    it('generates chunk-aware query when chunks info is present', () => {
      const result = adapter.buildFilterApply(
        sql,
        'tbl' as any,
        {
          attributeName: 'embedding',
          adapterData: {
            ...VECTOR_ADAPTER_IDENTITY,
            chunksInfo: {
              chunksSchema: null,
              chunksTableName: 'documents_chunks',
              parentFkField: 'document_id',
              parentPkField: 'id',
              embeddingField: 'embedding',
            },
          },
        },
        { vector: [1, 0, 0], metric: 'COSINE' },
        {},
      );

      expect(result).not.toBeNull();
      // Chunk-aware query should contain LEAST and chunks table reference
      const scoreStr = String(result!.scoreExpression);
      expect(scoreStr).toContain('LEAST');
      expect(scoreStr).toContain('documents_chunks');
    });

    it('generates standard query when includeChunks is false', () => {
      const result = adapter.buildFilterApply(
        sql,
        'tbl' as any,
        {
          attributeName: 'embedding',
          adapterData: {
            ...VECTOR_ADAPTER_IDENTITY,
            chunksInfo: {
              chunksSchema: null,
              chunksTableName: 'documents_chunks',
              parentFkField: 'document_id',
              parentPkField: 'id',
              embeddingField: 'embedding',
            },
          },
        },
        { vector: [1, 0, 0], metric: 'COSINE', includeChunks: false },
        {},
      );

      expect(result).not.toBeNull();
      // With includeChunks: false, should NOT use chunk query
      const scoreStr = String(result!.scoreExpression);
      expect(scoreStr).not.toContain('LEAST');
      expect(scoreStr).not.toContain('documents_chunks');
    });

    it('generates schema-qualified chunk query when chunksSchema is set', () => {
      const result = adapter.buildFilterApply(
        sql,
        'tbl' as any,
        {
          attributeName: 'embedding',
          adapterData: {
            ...VECTOR_ADAPTER_IDENTITY,
            chunksInfo: {
              chunksSchema: 'app_private',
              chunksTableName: 'doc_chunks',
              parentFkField: 'document_id',
              parentPkField: 'row_id',
              embeddingField: 'vec',
            },
          },
        },
        { vector: [1, 0, 0], metric: 'COSINE' },
        {},
      );

      expect(result).not.toBeNull();
      const scoreStr = String(result!.scoreExpression);
      // Should contain both schema and table name
      expect(scoreStr).toContain('app_private');
      expect(scoreStr).toContain('doc_chunks');
      expect(scoreStr).toContain('LEAST');
    });
  });
});

// ─── Plugin: per-table @searchConfig smart tag (Phase D) ──────────────────────

describe('per-table @searchConfig smart tag (Phase D)', () => {
  describe('createUnifiedSearchPlugin respects @searchConfig', () => {
    it('creates a plugin with searchScoreWeights that can be overridden per-table', () => {
      // This test verifies the plugin can be created with global weights
      // The actual per-table override happens at schema-build time when codec.extensions.tags.searchConfig is read
      const plugin = createUnifiedSearchPlugin({
        adapters: [
          createTsvectorAdapter(),
          createBm25Adapter(),
        ],
        enableSearchScore: true,
        searchScoreWeights: { tsv: 0.8, bm25: 0.2 },
      });

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('UnifiedSearchPlugin');
    });

    it('creates a plugin without global weights (per-table only)', () => {
      const plugin = createUnifiedSearchPlugin({
        adapters: [
          createTsvectorAdapter(),
          createBm25Adapter(),
        ],
        enableSearchScore: true,
        // No searchScoreWeights — per-table @searchConfig will be the only source
      });

      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('UnifiedSearchPlugin');
    });
  });
});

// ─── VectorNearbyInput: includeChunks field ──────────────────────────────────

describe('VectorNearbyInput includeChunks field (Phase E)', () => {
  it('adapter registers includeChunks field on VectorNearbyInput', () => {
    const adapter = createPgvectorAdapter();

    // Mock build object with minimal graphql types
    const registeredTypes: Record<string, any> = {};
    const mockBuild = {
      graphql: {
        GraphQLList: function GraphQLList(type: any) { return { type, kind: 'list' }; },
        GraphQLNonNull: function GraphQLNonNull(type: any) { return { type, kind: 'nonnull' }; },
        GraphQLFloat: 'Float',
        GraphQLBoolean: 'Boolean',
      },
      getTypeByName: (name: string) => registeredTypes[name] ?? name,
      registerEnumType: (name: string, _scope: any, specFn: any, _origin: string) => {
        registeredTypes[name] = { name, ...specFn() };
      },
      registerInputObjectType: (name: string, _scope: any, specFn: any, _origin: string) => {
        registeredTypes[name] = { name, ...specFn() };
      },
    };

    adapter.registerTypes(mockBuild);

    // VectorNearbyInput should be registered
    expect(registeredTypes['VectorNearbyInput']).toBeDefined();

    // Get the fields
    const fieldsResult = registeredTypes['VectorNearbyInput'].fields;
    const fields = typeof fieldsResult === 'function' ? fieldsResult() : fieldsResult;

    expect(fields.vector).toBeDefined();
    expect(fields.metric).toBeDefined();
    expect(fields.distance).toBeDefined();
    expect(fields.includeChunks).toBeDefined();
    expect(fields.includeChunks.type).toBe('Boolean');
    expect(fields.includeChunks.description).toContain('chunks');
  });
});
