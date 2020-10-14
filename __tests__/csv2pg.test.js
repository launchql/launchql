import { parse } from '../src';
import { resolve } from 'path';
import { deparse } from 'pgsql-parser';
import { InsertStmt } from '../src/utils';

const CSV = resolve(__dirname + '/../__fixtures__/zip-codes.csv');

it('works', async () => {
  const result = await parse(CSV);
  if (!result.length) throw new Error('no fields!');
  const fields = Object.keys(result[0]);

  const types = {
    code: 'int',
    latitude: 'float',
    longitude: 'float',
    bbox: 'text'
  };

  const nodes = result.map((record) => {
    return InsertStmt({
      schemaName: 'schema',
      tableName: 'table',
      fields: fields.map((name) => ({ name })),
      types,
      record
    });
  });
  // expect(nodes).toMatchSnapshot();
  expect(deparse(nodes)).toMatchSnapshot();
});
