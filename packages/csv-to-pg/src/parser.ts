// @ts-nocheck
import { readFileSync, writeFileSync } from 'fs';
import { parse, parseTypes } from './index';
import { deparse } from 'pgsql-deparser';
import { InsertOne, InsertMany } from './utils';

export class Parser {
  constructor(config) {
    this.config = config;
  }
  async parse(data) {
    const config = this.config;
    const { schema, table, singleStmts, conflict, headers, delimeter } = config;

    const opts = {};
    if (headers) opts.headers = headers;
    if (delimeter) opts.separator = delimeter;

    let records;
    if (typeof data === 'undefined') {
      if (config.json || config.input.endsWith('.json')) {
        records = JSON.parse(readFileSync(config.input, 'utf-8'));
      } else {
        records = await parse(config.input, opts);
      }
    } else {
      if (!Array.isArray(data)) {
        throw new Error('data is not an array');
      }
      records = data;
    }

    if (config.debug) {
      console.log(records);
      return;
    }

    const types = parseTypes(config);

    if (singleStmts) {
      const stmts = records.map((record) =>
        InsertOne({
          schema,
          table,
          types,
          record,
          conflict
        })
      );
      return deparse(stmts);
    } else {
      const stmt = InsertMany({
        schema,
        table,
        types,
        records,
        conflict
      });
      return deparse([stmt]);
    }
  }
}
