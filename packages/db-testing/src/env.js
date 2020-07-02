const envalid = require('envalid');
const { bool, port, str } = envalid;

module.exports = envalid.cleanEnv(
  process.env,
  {
    PGDATABASE: str({ default: 'testing-db' }),
    PGTEMPLATE_DATABASE: str({ default: 'testing-template-db' }),
    PGHOST: str({ default: 'localhost' }),
    PGPASSWORD: str({ default: 'password' }),
    PGPORT: port({ default: 5432 }),
    PGUSER: str({ default: 'postgres' }),
    APP_USER: str({ default: 'app_user' }),
    APP_PASSWORD: str({ default: 'app_password' }),
    FAST_TEST: bool({ default: false })
  },
  { dotEnvPath: null }
);
