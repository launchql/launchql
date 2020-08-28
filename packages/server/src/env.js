const { cleanEnv, bool, str, port, url, makeValidator } = require('envalid');

const array = makeValidator((x) => x.split(','), '');

module.exports = cleanEnv(
  process.env,
  {
    SERVER_PORT: port({ default: 5555 }),
    SERVER_HOST: str({ default: 'localhost' }),
    PGUSER: str({ default: 'postgres' }),
    PGHOST: str({ default: 'localhost' }),
    PGPASSWORD: str({ default: 'password' }),
    PGDATABASE: str({ default: 'launchql-db' }),
    SERVICE_SCHEMA: str({ default: 'services_public' }),
    SERVICE_TABLE: str({ default: 'services' }),
    TRUST_PROXY: bool({ default: false }),
    PGPORT: port({ default: 5432 })
  },
  { dotEnvPath: null }
);
