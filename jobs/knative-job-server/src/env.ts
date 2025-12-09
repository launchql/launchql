import { cleanEnv, port } from 'envalid';

export default cleanEnv(
  process.env,
  {
    INTERNAL_JOBS_CALLBACK_PORT: port({ default: 12345 })
  },
  { dotEnvPath: null }
);
