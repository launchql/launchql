import { cleanEnv, str, port, bool } from 'envalid';

export default cleanEnv(
  process.env,
  {
    SERVER_PORT: port({ default: 5555 }),
    SERVER_HOST: str({ default: 'localhost' }),
    PGUSER: str({ default: 'postgres' }),
    PGHOST: str({ default: 'localhost' }),
    PGPASSWORD: str({ default: 'password' }),
    PGDATABASE: str({ default: 'webinc-db' }),
    PGPORT: port({ default: 5432 }),
    META_SCHEMA: str({ default: 'meta_public' }),
    IS_PUBLIC: bool({ default: true }),
    TRUST_PROXY: bool({ default: false }),
    USE_SIMPLE_INFLECTION: bool({ default: true }),
    USE_OPPOSITE_BASENAMES: bool({ default: false }),
    USE_POSTGIS: bool({ default: true })
  },
  { dotEnvPath: null }
);
