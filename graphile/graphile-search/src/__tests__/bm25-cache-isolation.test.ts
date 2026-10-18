import { createBm25Adapter } from '../adapters/bm25';
import { bm25IndexStore } from '../index';
import {
  Bm25CodecPlugin,
  collectBm25Indexes,
} from '../codecs/bm25-codec';

const row = (indexName: string) => ({
  class_id: '100',
  attribute_number: 2,
  schema_name: 'tenant_a',
  table_name: 'documents',
  column_name: 'body',
  index_name: indexName,
});

describe('BM25 gather cache ownership', () => {
  beforeEach(() => bm25IndexStore.clear());
  afterEach(() => bm25IndexStore.clear());

  it('does not retain index discovery across gather states', () => {
    const first = collectBm25Indexes([row('first_idx')]);
    const rebuilt = collectBm25Indexes([]);

    expect(first.size).toBe(1);
    expect(rebuilt.size).toBe(0);
  });

  it('binds and consumes only the current gather state', () => {
    const first = collectBm25Indexes([row('first_idx')]);
    const rebuilt = collectBm25Indexes([row('rebuilt_idx')]);
    const attributeHook = (Bm25CodecPlugin.gather as any).hooks
      .pgCodecs_attribute;
    const attribute: any = { codec: { name: 'text' } };

    attributeHook(
      { state: { indexesByService: new Map([['main', rebuilt]]) } },
      {
        serviceName: 'main',
        pgClass: { _id: '100' },
        pgAttribute: { attnum: 2 },
        attribute,
      }
    );

    expect(attribute.extensions.bm25Index.indexName).toBe('rebuilt_idx');
    expect([...first.values()][0].indexName).toBe('first_idx');

    const adapter = createBm25Adapter();
    expect(
      adapter.detectColumns({ attributes: { body: attribute } }, {})
    ).toEqual([
      {
        attributeName: 'body',
        adapterData: {
          bm25Index: attribute.extensions.bm25Index,
          chunksInfo: undefined,
        },
      },
    ]);
  });

  it('does not mutate the deprecated public store during gather', () => {
    collectBm25Indexes([row('gather_idx')]);
    const attributeHook = (Bm25CodecPlugin.gather as any).hooks
      .pgCodecs_attribute;
    const attribute: any = { codec: { name: 'text' } };

    attributeHook(
      {
        state: {
          indexesByService: new Map([
            ['main', collectBm25Indexes([row('gather_idx')])],
          ]),
        },
      },
      {
        serviceName: 'main',
        pgClass: { _id: '100' },
        pgAttribute: { attnum: 2 },
        attribute,
      }
    );

    expect(bm25IndexStore.size).toBe(0);
  });

  it('uses the deprecated store only when explicitly passed to the adapter', () => {
    const explicitIndex = {
      schemaName: 'tenant_a',
      tableName: 'documents',
      columnName: 'body',
      indexName: 'explicit_idx',
    };
    bm25IndexStore.set('tenant_a.documents.body', explicitIndex);
    const codec = {
      extensions: { pg: { schemaName: 'tenant_a', name: 'documents' } },
      attributes: { body: { codec: { name: 'text' } } },
    };

    expect(createBm25Adapter().detectColumns(codec, {})).toEqual([]);
    expect(
      createBm25Adapter().detectColumns(codec, {
        pgBm25IndexStore: bm25IndexStore,
      })
    ).toEqual([]);
    expect(createBm25Adapter({ bm25IndexStore }).detectColumns(codec, {})).toEqual([
      {
        attributeName: 'body',
        adapterData: {
          bm25Index: explicitIndex,
          chunksInfo: undefined,
        },
      },
    ]);
  });
});
