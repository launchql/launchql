import { cleanEnv, str, port, bool } from 'envalid';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

export const env = cleanEnv(process.env, {
  PGUSER: str(),
  PGPASSWORD: str(),
  PGHOST: str(),
  PGPORT: port({ default: 5432 }),
  PGDATABASE: str({ default: 'postgres' }),
  DATABASE_URL: str(),
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
  SCHEMAS: str({ default: 'public' }),
  SERVER_HOST: str({ default: 'localhost' }),
  TRUST_PROXY: bool({ default: false }),
  PORT: port({ default: 3000 }),
  // is this PORT?
  SERVER_PORT: port({ default: 3333 }),
  USE_SIMPLE_INFLECTION: bool({ default: true }),
  USE_OPPOSITE_BASENAMES: bool({ default: true }),
  USE_POSTGIS: bool({ default: true }),

  AWS_REGION: str({ default: 'aws_region' }),
  AWS_SECRET_KEY: str({ default: 'aws_secret' }),
  AWS_ACCESS_KEY: str({ default: 'aws_secret' }),
  MINIO_ENDPOINT: str({ default: 'minio' }),
  BUCKET_NAME: str({ default: 'bucket' }),

});
