#!/usr/bin/env node

import { prompt } from '@pyramation/prompt';
import { parse } from './parse';
import { deparse } from 'pgsql-parser';
import * as ast from 'pg-ast';
import { writeFileSync } from 'fs';
import { InsertStmtValues, makePoly, makePoint } from './utils';

const argv = process.argv.slice(2);

// - [ ] option to rename fields
// - [ ] option to set table name
// - [ ] option to cast certain props
// - [ ] option to specify unique fields for on conflict updates

(async () => {
  const { path } = await prompt(
    [
      {
        _: true,
        name: 'path',
        type: 'path',
        required: true
      }
    ],
    argv
  );

  const { out } = await prompt(
    [
      {
        name: 'out',
        type: 'path',
        required: true
      }
    ],
    argv
  );

  const records = await parse(path);

  const { schemaName, tableName } = await prompt(
    [
      {
        name: 'schemaName',
        type: 'text',
        required: true
      },
      {
        name: 'tableName',
        type: 'text',
        required: true
      }
    ],
    argv
  );
  let { fields } = await prompt(
    [
      {
        name: 'fields',
        type: 'text',
        required: true
      }
    ],
    argv
  );
  fields = fields.split(',');

  const qs = fields.map((field) => ({
    type: 'checkbox',
    name: field,
    message: 'choose props',
    choices: Object.keys(records[0]),
    required: true
  }));
  const ts = fields.map((field) => ({
    type: 'list',
    name: field,
    message: 'choose types',
    choices: ['int', 'text', 'float', 'location', 'bbox'],
    required: true
  }));

  console.log('FIRST LIST FIELDS FROM CSV');
  const thefields = await prompt(qs, []);
  console.log('NOW TYPES');
  const thetypes = await prompt(ts, []);

  const types = Object.entries(thetypes).reduce((m, val) => {
    const [k, v] = val;
    // m[k] = v;
    const other = thefields[k];
    if (!other) throw new Error('type/field mismatch');

    switch (v) {
      case 'text':
        m[k] = (record) =>
          ast.A_Const({ val: ast.String({ str: record[other[0]] }) });
        break;
      case 'int':
        m[k] = (record) =>
          ast.A_Const({ val: ast.Integer({ ival: record[other[0]] }) });
        break;
      case 'float':
        m[k] = (record) =>
          ast.A_Const({ val: ast.Float({ str: record[other[0]] }) });
        break;
      case 'bbox':
        {
          // do bbox magic with args from the fields
          m[k] = (record) => makePoly({ bbox: record[other[0]] });
        }
        break;
      case 'location':
        {
          // do bbox magic with args from the fields
          const [lngKey, latKey] = other;

          // do location magic with args from the fields
          m[k] = (record) =>
            makePoint({ longitude: record[lngKey], latitude: record[latKey] });
        }
        break;
      default:
        m[k] = (record) =>
          ast.A_Const({ val: ast.String({ str: record[other[0]] }) });
        break;
    }

    return m;
  }, {});

  // TODO WTF is the _????
  delete types._;

  const stmt = InsertStmtValues({
    schemaName,
    tableName,
    types,
    records
  });
  // IDEA: -- LEXER
  // fields = zip,location,bbox
  // types = int(zip),makeltln(longitude,latitude),makebbox(bbox)

  // another lexer idea:
  // types = 'int',fkey(bbox, s.table2)

  // BUG: chooser doesn't let you pick an order.... FUCK
  // yarn run dev ./__fixtures__/zip.csv  --fields zip,location,bbox
  const deparsed = deparse([stmt]);
  writeFileSync(out, deparsed);
})();
