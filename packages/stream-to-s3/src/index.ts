import stream, { PassThrough, Readable } from 'stream';
import type S3 from 'aws-sdk/clients/s3';
import getS3 from './s3';
import {
  streamContentType,
  ContentStream
} from '@launchql/content-type-stream';

const s3: S3 = getS3();

interface UploadFromStreamParams {
  key: string;
  contentType: string;
  bucket: string;
}

interface AsyncUploadParams extends UploadFromStreamParams {
  readStream: Readable;
  magic: { charset: string };
}

interface AsyncUploadResult {
  upload: S3.ManagedUpload.SendData;
  magic: { charset: string };
  contentType: string;
  contents: unknown;
}

export function uploadFromStream({
  key,
  contentType,
  bucket
}: UploadFromStreamParams): PassThrough {
  const pass = new stream.PassThrough();

  const params = {
    Body: pass,
    Key: key,
    ContentType: contentType,
    Bucket: bucket
  };

  s3.upload(params, function (
    err: Error | null,
    data: S3.ManagedUpload.SendData
  ): void {
    if (err) {
      pass.emit('error', err);
    } else {
      pass.emit('upload', data);
    }
  });

  return pass;
}

export const asyncUpload = ({
  key,
  contentType,
  readStream,
  magic,
  bucket
}: AsyncUploadParams): Promise<AsyncUploadResult> => {
  return new Promise((resolve, reject) => {
    // upload stream
    let upload: S3.ManagedUpload.SendData | undefined;

    const uploadStream = uploadFromStream({
      key,
      contentType,
      bucket
    });

    // content stream
    let contents: unknown;
    const contentStream = new ContentStream();

    const tryResolve = () => {
      if (contents && upload) {
        resolve({
          upload,
          magic,
          contentType,
          contents
        });
      }
    };

    contentStream
      .on('contents', function (results: unknown) {
        contents = results;
        tryResolve();
      })
      .on('error', (error: Error) => {
        reject(error);
      });

    uploadStream
      .on('upload', (results: S3.ManagedUpload.SendData) => {
        upload = results;
        tryResolve();
      })
      .on('error', (error: Error) => {
        reject(error);
      });

    readStream.pipe(contentStream);
    contentStream.pipe(uploadStream);
  });
};

interface UploadInput {
  readStream: Readable;
  filename: string;
  bucket: string;
  key: string;
}

export default async ({
  readStream,
  filename,
  bucket,
  key
}: UploadInput): Promise<AsyncUploadResult> => {
  const { stream: newStream, magic, contentType } = await streamContentType({
    readStream,
    filename
  });

  return await asyncUpload({
    key,
    contentType,
    readStream: newStream,
    magic,
    bucket
  });
};
