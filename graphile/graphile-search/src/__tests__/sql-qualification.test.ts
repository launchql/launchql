import sql from 'pg-sql2';

import { createBm25Adapter } from '../adapters/bm25';

describe('BM25 SQL qualification', () => {
  it('qualifies extension functions/operators and quotes physical index names', () => {
    const store = new Map([
      [
        'tenant-a.documents.content',
        {
          extensionSchema: 'extension-tools',
          schemaName: 'tenant-a',
          tableName: 'documents',
          columnName: 'content',
          indexName: 'documents"content_idx',
        },
      ],
    ]);
    const adapter = createBm25Adapter({ bm25IndexStore: store });
    const [column] = adapter.detectColumns(
      {
        name: 'documents',
        extensions: {
          pg: { schemaName: 'tenant-a', name: 'documents' },
        },
        attributes: {
          content: { codec: { name: 'text' } },
        },
      },
      {}
    );
    const result = adapter.buildFilterApply(
      sql,
      sql.identifier('documents'),
      column,
      { query: 'memory density' },
      {}
    );
    const compiled = sql.compile(result!.scoreExpression);

    expect(compiled.text).toContain('"extension-tools"."to_bm25query"');
    expect(compiled.text).toContain('OPERATOR("extension-tools".<@>)');
    expect(compiled.values).toContain('"tenant-a"."documents""content_idx"');
  });
});
