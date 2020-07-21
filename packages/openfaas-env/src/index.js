import {
  cleanEnv,
  makeValidator,
  EnvError,
  EnvMissingError,
  testOnly,
  bool,
  num,
  str,
  json,
  host,
  port,
  url,
  email
} from 'envalid';

import { readFileSync } from 'fs';

const getSecret = (secret) =>
  readFileSync('/var/openfaas/secrets/' + secret).toString();

const env = (props) => {
  const secrets = Object.keys(props).reduce((m, k) => {
    try {
      m[k] = getSecret(k);
      /*eslint-disable-next-line */
    } catch (e) {}
    return m;
  }, {});

  const env = Object.assign({}, process.env, secrets);

  return cleanEnv(env, props, { dotEnvPath: null });
};

export {
  env,
  cleanEnv,
  makeValidator,
  EnvError,
  EnvMissingError,
  testOnly,
  bool,
  num,
  str,
  json,
  host,
  port,
  url,
  email
};
