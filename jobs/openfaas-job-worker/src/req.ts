import requestLib from 'request';
import { getOpenFaasGatewayConfig, getOpenFaasDevMap, getNodeEnvironment } from '@launchql/job-utils';

// for completion
const { gatewayUrl, callbackUrl } = getOpenFaasGatewayConfig();

const isProd = getNodeEnvironment() === 'production';
const DEV_MAP = !isProd ? getOpenFaasDevMap() : null;

const getFunctionUrl = (fn) => {
  if (DEV_MAP) {
    return DEV_MAP[fn] || callbackUrl;
  }
  return `${gatewayUrl}/async-function/${fn}`;
};

const request = (fn, { body, databaseId, workerId, jobId }) => {
  const url = getFunctionUrl(fn);
  return new Promise((resolve, reject) => {
    requestLib.post(
      {
        headers: {
          'Content-Type': 'application/json',

          // these are used by job-worker/job-fn
          'X-Worker-Id': workerId,
          'X-Job-Id': jobId,
          'X-Database-Id': databaseId,

          // this one is used by OpenFAAS
          'X-Callback-Url': callbackUrl
        },
        url,
        json: true,
        body
      },
      function (error) {
        // NOTE should we hit the error URL!??
        // probably not because it would be an error in the actual
        // creation of the job...
        return error ? reject(error) : resolve(true);
      }
    );
  });
};

export { request };
