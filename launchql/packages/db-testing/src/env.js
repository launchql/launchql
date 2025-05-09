import { cleanEnv, bool, port, str } from 'envalid';

export default cleanEnv(
  process.env,
  {
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
