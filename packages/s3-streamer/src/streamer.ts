import { ReadStream } from 'fs';
import S3 from 'aws-sdk/clients/s3';
import getS3 from './s3';
import { upload as streamUpload, type AsyncUploadResult } from './utils';

interface StreamerOptions {
  awsRegion: string;
  awsSecretKey: string;
  awsAccessKey: string;
  minioEndpoint?: string;
  defaultBucket: string;
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
    awsRegion,
    awsSecretKey,
    awsAccessKey,
    minioEndpoint,
    defaultBucket
  }: StreamerOptions) {
    this.s3 = getS3({
      awsRegion,
      awsSecretKey,
      awsAccessKey,
      minioEndpoint
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
