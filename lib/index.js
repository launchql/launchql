const createHash = require('crypto').createHash;

module.exports = function stream2etag(stream, partSizeInMb = 5) {
  return new Promise(async (resolve, reject) => {
    const partSizeInBytes = partSizeInMb * 1024 * 1024;
    const sums = [];
    sums.push(createHash('md5'));
    let part = 0;
    let bytes = 0;
    stream.on('error', function (error) {
      reject(error);
    }).on('data', function (chunk) {
      const len = chunk.length;

      if (bytes + len < partSizeInBytes) {
        sums[part].update(chunk);
        bytes += len;
      } else {
        const bytesNeeded = partSizeInBytes - bytes;
        sums[part].update(chunk.slice(0, bytesNeeded));
        part++;
        sums.push(createHash('md5'));
        bytes = len - bytesNeeded;
        sums[part].update(chunk.slice(bytesNeeded, len));
      }
    }).on('end', function () {
      if (!part) {
        return resolve(sums[0].digest('hex'));
      }

      const checksum = sums.map(s => s.digest('hex')).join('');
      const final = createHash('md5').update(Buffer.from(checksum, 'hex')).digest('hex');
      resolve(`${final}-${part + 1}`);
    });
  });
};