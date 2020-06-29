const pgPromise = require('pg-promise');

const pgp = pgPromise({
  noWarnings: true
});

import PgpWrapper from './wrapper';

export const connect = async (connection) => {
  const cn = await pgp(connection);
  const db = await cn.connect({ direct: true });
  return new PgpWrapper(db);
};

export const close = (db) => {
  db.done();
};
