import { createWriteStream, createReadStream } from 'fs';
import stream from 'stream';

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

export const download = async ({ client, writeStream, bucket, key }) => {
  return new Promise((resolve, reject) => {
    const errors = [];
    writeStream.on('error', function (e) {
      errors.push(e);
    });
    writeStream.on('finish', function () {
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
      .pipe(writeStream);
  });
};

export const upload = async ({
  client,
  readStream,
  bucket,
  key,
  contentType
}) => {
  const upload = client.upload({
    Bucket: bucket,
    Key: key,
    Body: readStream,
    ContentType: contentType
  });
  return upload.promise();
};

export const uploadThrough = ({ key, contentType, bucket, client }) => {
  const pass = new stream.PassThrough();
  const params = {
    Body: pass,
    Key: key,
    ContentType: contentType,
    Bucket: bucket
  };
  client.upload(params, function (err, data) {
    if (err) {
      return pass.emit('error', err);
    }
    pass.emit('upload', data);
  });
  return pass;
};
