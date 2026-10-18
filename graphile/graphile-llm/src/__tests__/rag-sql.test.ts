import {
  buildChunkSearchSql,
  discoverChunkTables,
} from '../plugins/rag-plugin';
import type { ChunkTableInfo } from '../types';

const chunkTable = (
  overrides: Partial<ChunkTableInfo> = {}
): ChunkTableInfo => ({
  parentCodecName: 'articles',
  chunksSchema: 'tenant-a-app-public',
  vectorSchema: 'tenant-a-extensions',
  chunksTableName: 'article_chunks',
  parentFkField: 'article_id',
  parentPkField: 'id',
  embeddingField: 'embedding',
  contentField: 'content',
  ...overrides,
});

describe('RAG SQL qualification', () => {
  it('quotes tenant schemas and keeps parameter values separate', () => {
    const query = buildChunkSearchSql(chunkTable(), '[1,0]', 7, 0.4);
    expect(query.text).toContain('FROM "tenant-a-app-public".article_chunks');
    expect(query.text).toContain('$1::"tenant-a-extensions".vector');
    expect(query.text).toContain('OPERATOR("tenant-a-extensions".<=>)');
    expect(query.values).toEqual(['[1,0]', 0.4, 7]);
  });

  it('discovers the exact physical chunks resource and vector type schema', () => {
    const vectorCodec = {
      name: 'vector',
      extensions: {
        pg: {
          serviceName: 'main',
          schemaName: 'tenant-a-extensions',
          name: 'vector',
        },
      },
    };
    const chunkCodec = {
      name: 'articleChunks',
      attributes: {
        article_id: {},
        content: {},
        embedding: { codec: vectorCodec },
      },
      extensions: {
        pg: {
          serviceName: 'main',
          schemaName: 'tenant-a-app-public',
          name: 'article_chunks',
        },
      },
    };
    const tables = discoverChunkTables({
      input: {
        pgRegistry: {
          pgCodecs: {
            articles: {
              name: 'articles',
              attributes: { id: {} },
              extensions: {
                pg: {
                  serviceName: 'main',
                  schemaName: 'tenant-a-app-public',
                  name: 'articles',
                },
                tags: {
                  hasChunks: {
                    chunksTable: 'article_chunks',
                    parentFk: 'article_id',
                  },
                },
              },
            },
          },
          pgResources: { articleChunks: { codec: chunkCodec } },
        },
      },
      resolvedPreset: {
        pgServices: [{ name: 'main', schemas: ['tenant-a-app-public'] }],
      },
    });
    expect(tables).toHaveLength(1);
    expect(tables[0].chunksSchema).toBe('tenant-a-app-public');
    expect(tables[0].vectorSchema).toBe('tenant-a-extensions');
  });

  it('rejects a chunks schema outside the exact service allowlist', () => {
    expect(() =>
      discoverChunkTables({
        input: {
          pgRegistry: {
            pgCodecs: {
              articles: {
                name: 'articles',
                attributes: { id: {} },
                extensions: {
                  pg: {
                    serviceName: 'main',
                    schemaName: 'tenant_a',
                    name: 'articles',
                  },
                  tags: {
                    hasChunks: {
                      chunksSchema: 'tenant_b',
                      chunksTable: 'article_chunks',
                    },
                  },
                },
              },
            },
            pgResources: {},
          },
        },
        resolvedPreset: {
          pgServices: [{ name: 'main', schemas: ['tenant_a'] }],
        },
      })
    ).toThrow(/outside service 'main'/);
  });
});
