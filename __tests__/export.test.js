import { parse, parseTypes } from '../src';
import { resolve } from 'path';
import { deparse } from 'pgsql-deparser';
import { InsertOne, InsertMany } from '../src/utils';

const testCase = resolve(__dirname + '/../__fixtures__/test-case.csv');

it('test case', async () => {
  const config = {
    schema: 'collections_public',
    singleStmts: true,
    table: 'field',
    headers: [
      'id',
      'database_id',
      'table_id',
      'name',
      'description',
      'smart_tags',
      'is_required',
      'default_value',
      'is_hidden',
      'type',
      'field_order',
      'regexp',
      'chk',
      'chk_exp',
      'min',
      'max',
      'created_at',
      'updated_at'
    ],
    fields: {
      id: 'uuid',
      database_id: 'uuid',
      table_id: 'uuid',
      name: 'text',
      description: 'text'
    }
  };
  const records = await parse(testCase, { headers: config.headers });
  const types = parseTypes(config);
  const stmt = InsertMany({
    schema: config.schema,
    table: config.table,
    types,
    records
  });

  expect(deparse([stmt])).toMatchSnapshot();
});
