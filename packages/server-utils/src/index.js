// import cors from 'cors';
import env from './env';
import LRU from 'lru-cache';
import pg from 'pg';

const end = (pool) => {
  try {
    if (pool.ended || pool.ending) {
      console.error(
        'DO NOT CLOSE pool, why are you trying to call end() when already ended?'
      );
      return;
    }
    pool.end();
  } catch (e) {
    process.stderr.write(e);
  }
};

export const cache = new LRU({
  max: 15,
  dispose: function (key, obj) {
    console.log(`disposing ${'PostGraphile'}[${key}]`);
  },
  updateAgeOnGet: true,
  maxAge: 1000 * 60 * 60
});

export const pgCache = new LRU({
  max: 10,
  dispose: function (key, pgPool) {
    console.log(`disposing pg ${key}`);
    const inUse = false;
    cache.forEach((obj, k) => {
      if (obj.pgPoolKey === key) {
        cache.del(k);
      }
    });
    end(pgPool);
  },
  updateAgeOnGet: true,
  maxAge: 1000 * 60 * 60
});

export const svcCache = new LRU({
  max: 25,
  dispose: function (key, svc) {
    console.log(`disposing ${'service'}[${key}]`);
  },
  updateAgeOnGet: true,
  maxAge: 1000 * 60 * 60
});

export const getDbString = (db) =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${db}`;

export const getRootPgPool = (dbname) => {
  let pgPool;
  if (pgCache.has(dbname)) {
    pgPool = pgCache.get(dbname);
  } else {
    pgPool = new pg.Pool({
      connectionString: getDbString(dbname)
    });
    pgCache.set(dbname, pgPool);
  }
  return pgPool;
};
