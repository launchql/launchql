import pg from 'pg';
import env from './env';

const getDbString = () =>
  `postgres://${env.PGUSER}:${env.PGPASSWORD}@${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`;

const pgPool = new pg.Pool({
  connectionString: getDbString()
});

process.on('SIGTERM', () => {
  pgPool.end();
});

export default pgPool;
