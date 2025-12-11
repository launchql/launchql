import env from './env';
import requestLib from 'request';

// for completion
const completeUrl = env.INTERNAL_JOBS_CALLBACK_URL;

let hasDevMap = false;
let DEV_MAP: Record<string, string> = {};

const nodeEnv = process.env.NODE_ENV;

if (nodeEnv !== 'production' && env.INTERNAL_GATEWAY_DEVELOPMENT_MAP) {
  hasDevMap = true;
  DEV_MAP = JSON.parse(env.INTERNAL_GATEWAY_DEVELOPMENT_MAP as string);
}

const getFunctionUrl = (fn: string): string => {
  if (hasDevMap) {
    return DEV_MAP[fn] || completeUrl;
  }
  return `http://${fn}.${env.KNATIVE_SERVICE_URL}`;
};

interface RequestOptions {
  body: unknown;
  databaseId: string;
  workerId: string;
  jobId: string | number;
}

const request = (
  fn: string,
  { body, databaseId, workerId, jobId }: RequestOptions
) => {
  const url = getFunctionUrl(fn);
  return new Promise<boolean>((resolve, reject) => {
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
      function (error: unknown) {
        // NOTE should we hit the error URL!??
        // probably not because it would be an error in the actual
        // creation of the job...
        return error ? reject(error) : resolve(true);
      }
    );
  });
};

export { request };
