import { join,resolve } from 'path';
import { PgProtoParser, PgProtoParserOptions } from 'pg-proto-parser';

const inFile: string = join(__dirname, '../pg_query.proto'); 
const outDir: string = resolve(join(__dirname, '../src'));

const options: PgProtoParserOptions = {
  outDir,
  types: {
    enabled: false
  },
  enums: {
    enabled: false,
  },
  utils: {
    enums: {
      enabled: false,
    },
    astHelpers: {
      enabled: true,
      typesSource: '@pgsql/types',
    },
    wrappedAstHelpers: {
      enabled: true,
      filename: 'wrapped.ts'
    }
  }
};
const parser = new PgProtoParser(inFile, options);

parser.write();