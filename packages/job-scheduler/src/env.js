import { cleanEnv, url, str, bool, port, makeValidator } from 'envalid';

const array = makeValidator((x) => x.split(',').filter((i) => i), '');

export default cleanEnv(
  process.env,
  {
    PGUSER: str({ default: 'postgres' }),
    PGHOST: str({ default: 'localhost' }),
    PGPASSWORD: str({ default: 'password' }),
    PGPORT: port({ default: 5432 }),
    PGDATABASE: str({ default: 'jobs' }),
    JOBS_SCHEMA: str({ default: 'app_jobs' }),
    SUPPORT_ANY_JOBS: bool({ default: true }),
    SUPPORTED_JOBS: array({ default: '' }),
    HOSTNAME: str({
      default: 'scheduler-0'
    }),
    // INTERNAL_GATEWAY_URL: url(),
    // INTERNAL_JOB_REQ_URL: url(),
    PORT: port({ default: 12345 })
  },
  { dotEnvPath: null }
);
