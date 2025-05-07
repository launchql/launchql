import { ReadStream } from 'fs';
import S3 from 'aws-sdk/clients/s3';
import getS3 from './s3';
import { upload as streamUpload, type AsyncUploadResult } from './utils';

interface StreamerOptions {
  AWS_REGION?: string;
  AWS_SECRET_KEY?: string;
  AWS_ACCESS_KEY?: string;
  MINIO_ENDPOINT?: string;
  defaultBucket?: string;
}

interface UploadParams {
  readStream: ReadStream;
  filename: string;
  key: string;
  bucket?: string;
}

export class Streamer {
  private s3: S3;
  private defaultBucket?: string;

  constructor({
    AWS_REGION = 'us-east-1',
    AWS_SECRET_KEY,
    AWS_ACCESS_KEY,
    MINIO_ENDPOINT,
    defaultBucket
  }: StreamerOptions = {}) {
    this.s3 = getS3({
      AWS_REGION,
      AWS_SECRET_KEY,
      AWS_ACCESS_KEY,
      MINIO_ENDPOINT
    });
    this.defaultBucket = defaultBucket;
  }

  async upload({
    readStream,
    filename,
    key,
    bucket = this.defaultBucket
  }: UploadParams): Promise<AsyncUploadResult> {
    return await streamUpload({
      client: this.s3,
      readStream,
      filename,
      key,
      bucket
    });
  }
}

export default Streamer;
