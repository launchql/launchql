import { cleanEnv, url } from 'envalid';

const env = cleanEnv(
  process.env,
  {
    DATABASE_URL: url(),
  }
);

export default env;
