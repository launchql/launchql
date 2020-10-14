import { parse } from '../src';
import { resolve } from 'path';
import { deparse } from 'pgsql-parser';
import {
  InsertStmt,
  InsertStmtValues,
  makePoly,
  makePoint
} from '../src/utils';

const CSV = resolve(__dirname + '/../__fixtures__/zip-codes.csv');

it('insert each one', async () => {
  const result = await parse(CSV);

  const types = {
    zip: 'int',
    latitude: 'float',
    longitude: 'float',
    location: (record) => makePoint(record),
    bbox: (record) => makePoly(record)
  };

  const nodes = result.map((record) => {
    return InsertStmt({
      schemaName: 'schema',
      tableName: 'table',
      types,
      record
    });
  });
  expect(deparse(nodes)).toMatchSnapshot();
});

it('insert many', async () => {
  const records = await parse(CSV);

  const types = {
    zip: 'int',
    location: (record) => makePoint(record),
    bbox: (record) => makePoly(record)
  };

  const stmt = InsertStmtValues({
    schemaName: 'schema',
    tableName: 'zipcodes',
    types,
    records
  });

  expect(deparse([stmt])).toMatchSnapshot();
});
