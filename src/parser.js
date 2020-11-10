import { writeFileSync } from 'fs';
import { parse, parseTypes } from './index';
import { deparse } from 'pgsql-deparser';
import { InsertOne, InsertMany } from './utils';

export class Parser {
  constructor(config) {
    this.config = config;
    if (!this.config.output.endsWith('.sql'))
      this.config.output = this.config.output + '.sql';
  }
  async parse() {
    const config = this.config;
    const { schema, table, singleStmts, conflict, headers, delimeter } = config;

    const opts = {};
    if (headers) opts.headers = headers;
    if (delimeter) opts.separator = delimeter;

    const records = await parse(config.input, opts);
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
      writeFileSync(config.output, deparse(stmts));
    } else {
      const stmt = InsertMany({
        schema,
        table,
        types,
        records,
        conflict
      });
      writeFileSync(config.output, deparse([stmt]));
    }
  }
}
