import { cleanEnv, url, str, bool, port, makeValidator } from 'envalid';

const array = makeValidator((x) => x.split(',').filter((i) => i), '');

export default cleanEnv(
  process.env,
  {
    INTERNAL_JOBS_CALLBACK_PORT: port({ default: 12345 })
  },
  { dotEnvPath: null }
);
