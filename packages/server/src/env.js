import { cleanEnv, str, port, bool, makeValidator } from 'envalid';

const array = makeValidator((x) => x.split(','), '');

export default cleanEnv(
  process.env,
  {
    SERVER_PORT: port({ default: 5555 }),
    SERVER_HOST: str({ default: 'localhost' }),
    PGUSER: str({ default: 'app_admin' }),
    PGHOST: str({ default: 'localhost' }),
    PGPASSWORD: str({ default: 'admin_password' }),
    PGDATABASE: str({ default: 'webinc-db' }),
    PGPORT: port({ default: 5432 }),
    META_SCHEMAS: array({ default: 'meta_public,collections_public' }),
    IS_PUBLIC: bool({ default: true }),
    STRICT_AUTH: bool({ default: true }),
    TRUST_PROXY: bool({ default: false }),
    USE_SIMPLE_INFLECTION: bool({ default: true }),
    USE_OPPOSITE_BASENAMES: bool({ default: false }),
    USE_POSTGIS: bool({ default: true })
  },
  { dotEnvPath: null }
);
