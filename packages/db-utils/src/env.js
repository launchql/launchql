const { cleanEnv, str, port } = require('envalid');

module.exports = cleanEnv(
  process.env,
  {
    PGUSER: str({ default: 'postgres' }),
    PGHOST: str({ default: 'localhost' }),
    PGPASSWORD: str({ default: 'password' }),
    PGPORT: port({ default: 5432 })
  },
  { dotEnvPath: null }
);