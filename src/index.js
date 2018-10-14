const createHash = require('etag-hash').createHash;
module.exports = function stream2etag(stream, partSizeInMb = 5) {
  return new Promise(async (resolve, reject) => {
    const hash = createHash(partSizeInMb);
    stream
      .on('error', function(error) {
        reject(error);
      })
      .on('data', function(chunk) {
        hash.update(chunk);
      })
      .on('end', function() {
        resolve(hash.digest());
      });
  });
};
