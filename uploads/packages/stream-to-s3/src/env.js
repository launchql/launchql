import { cleanEnv, str } from 'envalid';

export default cleanEnv(
  process.env,
  {
    AWS_REGION: str({ default: 'us-east-1' }),
    AWS_SECRET_KEY: str(),
    AWS_ACCESS_KEY: str()
  },
  { dotEnvPath: null }
);
