import { cleanEnv, url, str, bool, port, makeValidator } from 'envalid';

const array = makeValidator<string[]>((x) => x.split(',').filter((i) => i), '');

const baseEnv = cleanEnv(
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
    INTERNAL_JOBS_CALLBACK_URL: url()
  },
  { dotEnvPath: null }
);

const KNATIVE_SERVICE_URL = process.env.KNATIVE_SERVICE_URL;

if (!KNATIVE_SERVICE_URL) {
  throw new Error(
    'KNATIVE_SERVICE_URL (or INTERNAL_GATEWAY_URL as fallback) is required for @launchql/knative-job-worker'
  );
}

const INTERNAL_GATEWAY_DEVELOPMENT_MAP =
  process.env.INTERNAL_GATEWAY_DEVELOPMENT_MAP;

export default {
  ...baseEnv,
  KNATIVE_SERVICE_URL,
  INTERNAL_GATEWAY_DEVELOPMENT_MAP
};
