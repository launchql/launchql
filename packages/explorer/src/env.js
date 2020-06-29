const { cleanEnv, str, port, url, makeValidator } = require('envalid');

const array = makeValidator((x) => x.split(','), '');

module.exports = cleanEnv(
  process.env,
  {
    SERVER_PORT: port({ default: 5555 }),
    SERVER_HOST: str({ default: 'localhost' }),
    PGUSER: str({ default: 'postgres' }),
    PGHOST: str({ default: 'localhost' }),
    PGPASSWORD: str({ default: 'password' }),
    PGPORT: port({ default: 5432 })
  },
  { dotEnvPath: null }
);
