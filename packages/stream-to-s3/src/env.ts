import { cleanEnv, str, url } from 'envalid';

export const env = cleanEnv(process.env, {
  AWS_REGION: str({ default: 'us-east-1' }),
  AWS_SECRET_KEY: str(),
  AWS_ACCESS_KEY: str(),
  MINIO_ENDPOINT: url({ default: undefined })
});
