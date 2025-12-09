import { cleanEnv, url, str, bool, port, makeValidator } from 'envalid';

const array = makeValidator<string[]>((x) => x.split(',').filter((i) => i), '');

export default cleanEnv(
  process.env,
  {
    PGUSER: str({ default: 'postgres' }),
    PGHOST: str({ default: 'localhost' }),
    PGPASSWORD: str({ default: 'password' }),
    PGPORT: port({ default: 5432 }),
    PGDATABASE: str({ default: 'jobs' }),
    JOBS_SCHEMA: str({ default: 'app_jobs' }),
    JOBS_SUPPORT_ANY: bool({ default: true }),
    JOBS_SUPPORTED: array({ default: '' as unknown as string[] }),
    HOSTNAME: str({
      default: 'worker-0'
    }),
    INTERNAL_GATEWAY_URL: url(),
    INTERNAL_JOBS_CALLBACK_URL: url(),
    INTERNAL_JOBS_CALLBACK_PORT: port({ default: 12345 })
  },
  { dotEnvPath: null }
);
