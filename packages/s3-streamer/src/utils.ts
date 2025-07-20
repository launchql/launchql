import {S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import {
  ContentStream,
  streamContentType} from '@launchql/content-type-stream';
import stream, { PassThrough, Readable } from 'stream';

export interface UploadParams {
  client: S3Client;
  key: string;
  contentType: string;
  bucket: string;
}

export interface AsyncUploadParams extends UploadParams {
  readStream: Readable;
  magic: { charset: string };
}

export interface UploadWithFilenameParams {
  client: S3Client;
  readStream: Readable;
  filename: string;
  key: string;
  bucket: string;
}

export interface UploadResult {
  Location: string;
  ETag?: string;
  Bucket?: string;
  Key?: string;
}

export interface AsyncUploadResult {
  upload: UploadResult;
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

  const upload = new Upload({
    client,
    params: {
      Body: pass,
      Key: key,
      ContentType: contentType,
      Bucket: bucket
    },
  });

  upload.done()
    .then((data) => {
      // Transform to match v2 response format
      const result: UploadResult = {
        Location: data.Location || `https://${bucket}.s3.amazonaws.com/${key}`,
        ETag: data.ETag,
        Bucket: bucket,
        Key: key
      };
      pass.emit('upload', result);
    })
    .catch((err) => {
      pass.emit('error', err);
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
    let upload: UploadResult | undefined;

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
      .on('upload', (results: UploadResult) => {
        upload = results;
        tryResolve();
      })
      .on('error', (error: Error) => {
        reject(error);
      });

    // Ensure proper cleanup on stream end
    uploadStream.on('finish', () => {
      readStream.destroy();
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
