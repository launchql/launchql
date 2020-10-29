import { cleanEnv, str, port } from 'envalid';

export default cleanEnv(
  process.env,
  {
    PGUSER: str({ default: 'postgres' }),
    PGHOST: str({ default: 'localhost' }),
    PGPASSWORD: str({ default: 'password' }),
    PGPORT: port({ default: 5432 }),
    SERVER_HOST: str({ default: 'localhost' }),
    SERVER_PORT: port({ default: 7987 })
  },
  { dotEnvPath: null }
);
