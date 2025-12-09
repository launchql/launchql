import requestLib from 'request';
import { getCallbackBaseUrl } from '@launchql/job-utils';

const getNamespace = (): string =>
  process.env.KNATIVE_NAMESPACE || process.env.JOBS_NAMESPACE || 'default';

const callbackUrl = getCallbackBaseUrl();

const getFunctionUrl = (fn: string): string => {
  const ns = getNamespace();
  return `http://${fn}.${ns}.svc.cluster.local/`;
};

const request = (
  fn: string,
  { body, databaseId, workerId, jobId }: { body: any; databaseId: any; workerId: any; jobId: any }
) => {
  const url = getFunctionUrl(fn);
  return new Promise((resolve, reject) => {
    requestLib.post(
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Worker-Id': workerId,
          'X-Job-Id': jobId,
          'X-Database-Id': databaseId,
          'X-Callback-Url': callbackUrl
        },
        url,
        json: true,
        body
      },
      function (error: any) {
        return error ? reject(error) : resolve(true);
      }
    );
  });
};

export { request };

