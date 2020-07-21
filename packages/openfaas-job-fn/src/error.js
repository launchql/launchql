import request from 'request';

export default ({ url, body }) => {
  console.log('inside of faas-job-fn calling ' + url);
  return new Promise((resolve, reject) => {
    request.post(
      {
        headers: {
          'Content-Type': 'application/json'
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
