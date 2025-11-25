import env from './env';
import requestLib from 'request';

// for completion
const completeUrl = env.INTERNAL_JOBS_CALLBACK_URL;

let hasDevMap = false;
let DEV_MAP = {};

if (env.NODE_ENV !== 'production' && env.INTERNAL_GATEWAY_DEVELOPMENT_MAP) {
  hasDevMap = true;
  DEV_MAP = JSON.parse(env.INTERNAL_GATEWAY_DEVELOPMENT_MAP);
}

const getFunctionUrl = (fn) => {
  if (hasDevMap) {
    return DEV_MAP[fn] || completeUrl;
  }
  return `${env.INTERNAL_GATEWAY_URL}/async-function/${fn}`;
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
          'X-Callback-Url': completeUrl
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
