// import { cleanEnv, str, port } from 'envalid';

// export const env = cleanEnv(process.env, {
//   NODE_ENV: str({ choices: ['development', 'test', 'production'] }),
//   DATABASE_URL: str(),
//   PORT: port({ default: 3000 }),
// });


import { cleanEnv, str, port } from 'envalid';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

export const env = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ['development', 'production', 'test'] }),
  DATABASE_URL: str(),
  SCHEMAS: str({ default: 'public' }),
  PORT: port({ default: 3000 }),
});
