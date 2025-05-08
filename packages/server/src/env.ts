import { cleanEnv, str, port, bool } from 'envalid';
import { makeValidator, EnvError } from 'envalid'

const array = makeValidator<string[]>((input: string) => {
  if (typeof input !== 'string') {
    throw new EnvError(`Expected a string but got: ${typeof input}`)
  }
  return input
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0)
})
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

// import { cleanEnv, str, port, bool, makeValidator } from 'envalid';

// export default cleanEnv(
//   process.env,
//   {
//     SERVER_PORT: port({ default: 5555 }),
//     SERVER_HOST: str({ default: 'localhost' }),
//     PGUSER: str({ default: 'app_admin' }),
//     PGHOST: str({ default: 'localhost' }),
//     PGPASSWORD: str({ default: 'admin_password' }),
//     PGDATABASE: str({ default: 'webinc-db' }),
//     PGPORT: port({ default: 5432 }),
//     META_SCHEMAS: array({ default: 'meta_public,collections_public' }),
//     IS_PUBLIC: bool({ default: true }),
//     STRICT_AUTH: bool({ default: true }),
//     TRUST_PROXY: bool({ default: false }),
//     USE_SIMPLE_INFLECTION: bool({ default: true }),
//     USE_OPPOSITE_BASENAMES: bool({ default: false }),
//     USE_POSTGIS: bool({ default: true })
//   },
//   { dotEnvPath: null }
// );


export const env = cleanEnv(process.env, {
  META_SCHEMAS: array({ default: ['meta_public', 'collections_public'] }),
  IS_PUBLIC: bool({ default: true }),
  STRICT_AUTH: bool({ default: true }),

  /////
  PGUSER: str(),
  PGPASSWORD: str(),
  PGHOST: str(),
  PGDATABASE: str(),
  PGPORT: port({ default: 5432 }),
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
