// @ts-nocheck

import { parse, parseTypes } from '../src';
import { resolve } from 'path';
import { deparse } from 'pgsql-deparser';
import { InsertOne, InsertMany } from '../src/utils';
import { Parser } from '../src/parser';

const testCase = resolve(__dirname + '/../__fixtures__/test-case.csv');

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

it('noop', () => {
  expect(true).toBe(true);
});
describe('test case', () => {
it('test case', async () => {
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

it('test case parser', async () => {
  const parser = new Parser(config);

  const sql = await parser.parse([
    {
      id: '450e3b3b-b68d-4abc-990c-65cb8a1dcdb4',
      database_id: '450e3b3b-b68d-4abc-990c-65cb8a1dcdb4',
      table_id: '450e3b3b-b68d-4abc-990c-65cb8a1dcdb4',
      name: 'name here',
      description: 'description'
    }
  ]);

  expect(sql).toMatchSnapshot();
});

it('jsonb/json', async () => {
  const parser = new Parser({
    schema: 'collections_public',
    singleStmts: true,
    table: 'field',
    fields: {
      id: 'uuid',
      name: 'text',
      data: 'jsonb'
    }
  });

  const sql = await parser.parse([
    {
      id: '450e3b3b-b68d-4abc-990c-65cb8a1dcdb4',
      name: 'name here',
      data: {
        a: 1
      }
    }
  ]);

  expect(sql).toMatchSnapshot();
});

it('image/attachment', async () => {
  const parser = new Parser({
    schema: 'collections_public',
    singleStmts: true,
    table: 'field',
    fields: {
      id: 'uuid',
      name: 'text',
      image: 'image',
      upload: 'attachment'
    }
  });

  const sql = await parser.parse([
    {
      id: '450e3b3b-b68d-4abc-990c-65cb8a1dcdb4',
      name: 'name here',
      image: {
        url: 'http://path/to/image.jpg'
      },
      upload: {
        url: 'http://path/to/image.jpg'
      }
    }
  ]);

  expect(sql).toMatchSnapshot();
});

it('arrays', async () => {
  const parser = new Parser({
    schema: 'collections_public',
    singleStmts: true,
    table: 'field',
    fields: {
      id: 'uuid',
      schemas: 'text[]'
    }
  });

  const sql = await parser.parse([
    {
      id: '450e3b3b-b68d-4abc-990c-65cb8a1dcdb4',
      schemas: ['a', 'b']
    }
  ]);

  expect(sql).toMatchSnapshot();
  });
});
