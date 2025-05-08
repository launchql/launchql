import { cleanEnv, str, port, bool, url } from 'envalid';

export const env = cleanEnv(
  process.env,
  {
    SERVER_PORT: port({ default: 5757 }),
    SERVER_HOST: str({ default: 'localhost' }),
    PGUSER: str({ default: 'postgres' }),
    PGHOST: str({ default: 'localhost' }),
    PGPASSWORD: str({ default: 'password' }),
    PGPORT: port({ default: 5432 }),
    USE_SIMPLE_INFLECTION: bool({ default: true }),
    USE_OPPOSITE_BASENAMES: bool({ default: false }),
    USE_POSTGIS: bool({ default: true }),
    AWS_REGION: str({ default: 'us-east-1' }),
    AWS_SECRET_KEY: str({ default: 'minioadmin' }),
    AWS_ACCESS_KEY: str({ default: 'minioadmin' }),
    MINIO_ENDPOINT: url({ default: undefined }),
    BUCKET_NAME: str({ default: 'test-bucket' })
  }
);
