import { cleanEnv, str } from 'envalid';

export default cleanEnv(
  process.env,
  {
    BUCKET_NAME: str(),
    AWS_SECRET_KEY: str(),
    AWS_ACCESS_KEY: str()
  },
  { dotEnvPath: null }
);
