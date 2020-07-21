import { cleanEnv, str } from 'envalid';

export default cleanEnv(
  process.env,
  {
    JOBS_SCHEMA: str({ default: 'app_jobs' })
  },
  { dotEnvPath: null }
);
