const parser = require('pgsql-parser');
import { resolve } from '@launchql/db-utils';

export default async (argv) => {
  // sql
  try {
    const sql = await resolve();
    const query = parser.parse(sql);
    var finalSql = parser.deparse(query);
  } catch (e) {
    console.error(e);
  }

  console.log(finalSql);
};
