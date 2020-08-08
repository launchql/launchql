import { createWriteStream, createReadStream } from 'fs';

export const fileExists = async ({ client, bucket, key }) => {
  try {
    await client
      .headObject({
        Bucket: bucket,
        Key: key
      })
      .promise();
  } catch (e) {
    if (e.statusCode === 404) {
      return false;
    }
    throw e;
  }
  return true;
};

export const downloadToLocal = async ({ client, local, bucket, key }) => {
  return new Promise((resolve, reject) => {
    const errors = [];
    const file = createWriteStream(local);
    file.on('error', function (e) {
      errors.push(e);
    });
    file.on('finish', function () {
      if (errors.length) {
        return reject(errors[0]);
      }
      resolve();
    });
    client
      .getObject({
        Bucket: bucket,
        Key: key
      })
      .createReadStream()
      .pipe(file);
  });
};

export const uploadFromLocal = async ({ client, local, bucket, key }) => {
  const stream = createReadStream(local);
  const upload = client.upload({
    Bucket: bucket,
    Key: key,
    Body: stream,
    ContentType: 'image/jpg'
  });
  return upload.promise();
};
