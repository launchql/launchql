import { PassThrough } from 'stream';
import type S3 from 'aws-sdk/clients/s3';

interface FileOperationArgs {
  client: S3;
  bucket: string;
  key: string;
}

export const fileExists = async ({ client, bucket, key }: FileOperationArgs): Promise<boolean> => {
  try {
    await client.headObject({ Bucket: bucket, Key: key }).promise();
    return true;
  } catch (e: any) {
    if (e.statusCode === 404) return false;
    throw e;
  }
};

export const download = async ({
  client,
  writeStream,
  bucket,
  key,
}: FileOperationArgs & { writeStream: NodeJS.WritableStream }): Promise<void> => {
  return new Promise((resolve, reject) => {
    const errors: Error[] = [];

    writeStream.on('error', (e) => errors.push(e));
    writeStream.on('finish', () => {
      if (errors.length) return reject(errors[0]);
      resolve();
    });

    client.getObject({ Bucket: bucket, Key: key })
      .createReadStream()
      .on('error', reject)
      .pipe(writeStream);
  });
};

export const upload = async ({
  client,
  readStream,
  bucket,
  key,
  contentType,
}: FileOperationArgs & {
  readStream: NodeJS.ReadableStream;
  contentType: string;
}): Promise<S3.ManagedUpload.SendData> => {
  return client.upload({
    Bucket: bucket,
    Key: key,
    Body: readStream,
    ContentType: contentType,
  }).promise();
};

export const uploadThrough = ({
  key,
  contentType,
  bucket,
  client,
}: FileOperationArgs & { contentType: string }): PassThrough => {
  const pass = new PassThrough();

  client.upload(
    {
      Body: pass,
      Key: key,
      ContentType: contentType,
      Bucket: bucket,
    },
    (err, data) => {
      if (err) return pass.emit('error', err);
      pass.emit('upload', data);
    }
  );

  return pass;
};
