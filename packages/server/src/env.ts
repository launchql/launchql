import { cleanEnv, str, port, bool } from 'envalid';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

export const env = cleanEnv(process.env, {
  PGUSER: str(),
  PGPASSWORD: str(),
  PGHOST: str(),
  PGPORT: port({ default: 5432 }),
  DATABASE_URL: str(),
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
  SCHEMAS: str({ default: 'public' }),
  TRUST_PROXY: bool({ default: false }),
  PORT: port({ default: 3000 }),
});
