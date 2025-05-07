import stream, { PassThrough, Readable } from 'stream';
import type S3 from 'aws-sdk/clients/s3';

import {
  streamContentType,
  ContentStream
} from '@launchql/content-type-stream';

export interface UploadParams {
  client: S3;
  key: string;
  contentType: string;
  bucket: string;
}

export interface AsyncUploadParams extends UploadParams {
  readStream: Readable;
  magic: { charset: string };
}

export interface UploadWithFilenameParams {
  client: S3;
  readStream: Readable;
  filename: string;
  key: string;
  bucket: string;
}

export interface AsyncUploadResult {
  upload: S3.ManagedUpload.SendData;
  magic: { charset: string };
  contentType: string;
  contents: unknown;
}

export const uploadFromStream = ({
  client,
  key,
  contentType,
  bucket
}: UploadParams): PassThrough => {
  const pass = new stream.PassThrough();

  const params = {
    Body: pass,
    Key: key,
    ContentType: contentType,
    Bucket: bucket
  };

  client.upload(params, function (
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
};

export const asyncUpload = ({
  client,
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
      client,
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

export const upload = async ({
  client,
  readStream,
  filename,
  key,
  bucket
}: UploadWithFilenameParams): Promise<AsyncUploadResult> => {
  const { stream: newStream, magic, contentType } = await streamContentType({
    readStream,
    filename
  });

  return await asyncUpload({
    client,
    key,
    contentType,
    readStream: newStream,
    magic,
    bucket
  });
};
