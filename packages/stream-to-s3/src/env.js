import { cleanEnv, str } from 'envalid';

export default cleanEnv(
  process.env,
  {
    AWS_SECRET_KEY: str(),
    AWS_ACCESS_KEY: str()
  },
  { dotEnvPath: null }
);
