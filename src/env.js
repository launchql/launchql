import { cleanEnv, makeValidator } from 'envalid';

const array = makeValidator((x) => x.split(','), '');

export default cleanEnv(
  process.env,
  {
    ACCEPTED_LANGUAGES: array({ default: 'en,es' })
  },
  { dotEnvPath: null }
);
