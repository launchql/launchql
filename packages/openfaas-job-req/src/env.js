import { env, url } from '@launchql/openfaas-env';

export default env({
  INTERNAL_GATEWAY_URL: url(),
  INTERNAL_JOB_REQ_URL: url()
});
