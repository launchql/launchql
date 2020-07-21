import { env, str, port } from '@launchql/openfaas-env';

export default env({
  PGUSER: str({ default: 'postgres' }),
  PGHOST: str({ default: 'localhost' }),
  PGPASSWORD: str({ default: 'password' }),
  PGPORT: port({ default: 5432 }),
  PGDATABASE: str({ default: 'jobs' }),
  PORT: port({ default: 10101 })
});
