import { cleanEnv, url, str, port, makeValidator } from 'envalid';

const array = makeValidator((x) => x.split(','), '');

export default cleanEnv(
  process.env,
  {
    PGUSER: str({ default: 'postgres' }),
    PGHOST: str({ default: 'localhost' }),
    PGPASSWORD: str({ default: 'password' }),
    PGPORT: port({ default: 5432 }),
    PGDATABASE: str({ default: 'jobs' }),
    JOBS_SCHEMA: str({ default: 'app_jobs' }),
    SUPPORTED_JOBS: array(),
    INTERNAL_GATEWAY_URL: url(),
    INTERNAL_JOB_REQ_URL: url(),
    PORT: port({ default: 12345 })
  },
  { dotEnvPath: null }
);
