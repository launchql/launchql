import { cleanEnv, url, str, bool, port } from 'envalid';

export default cleanEnv(
  process.env,
  {
    PGUSER: str({ default: 'postgres' }),
    PGHOST: str({ default: 'localhost' }),
    PGPASSWORD: str({ default: 'password' }),
    PGPORT: port({ default: 5432 }),
    PGDATABASE: str({ default: 'jobs' }),
    JOBS_SCHEMA: str({ default: 'app_jobs' }),
    INTERNAL_JOBS_API_PORT: port({ default: 23456 })
  },
  { dotEnvPath: null }
);
