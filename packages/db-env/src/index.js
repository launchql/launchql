const envalid = require('envalid');
const { port, str } = envalid;

module.exports = envalid.cleanEnv(
  process.env,
  {
    PGPORT: port({default: 5432}),
    PGHOST: str({default: 'localhost'}),
    PGUSER: str({default: 'postgres'}),
    PGPASSWORD: str({default: 'password'})
  },
  { dotEnvPath: null }
);
