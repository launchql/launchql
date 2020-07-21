import env from './env';
import requestLib from 'request';

// for completion
const completeUrl = `${env.INTERNAL_JOB_REQ_URL}/complete`;

const request = (fn, { body, workerId, jobId, taskId }) => {
  return new Promise((resolve, reject) => {
    requestLib.post(
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Worker-Id': workerId,
          'X-Job-Id': jobId,
          'X-Task-Id': taskId,
          // this one is used by OpenFAAS
          'X-Callback-Url': completeUrl
        },
        url: `${env.INTERNAL_GATEWAY_URL}/async-function/${fn}`,
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
