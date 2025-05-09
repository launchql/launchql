import { createHash } from 'etag-hash';
module.exports = function stream2etag(stream, partSizeInMb = 5) {
  return new Promise((resolve, reject) => {
    const hash = createHash(partSizeInMb);
    stream
      .on('error', function (error) {
        reject(error);
      })
      .on('data', function (chunk) {
        hash.update(chunk);
      })
      .on('end', function () {
        resolve(hash.digest());
      });
  });
};
