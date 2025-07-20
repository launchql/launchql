import { S3Client } from '@aws-sdk/client-s3';
import { ReadStream } from 'fs';

import getS3 from './s3';
import { type AsyncUploadResult,upload as streamUpload } from './utils';

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
  private s3: S3Client;
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
    if (!bucket) {
      throw new Error('Bucket is required');
    }
    
    return await streamUpload({
      client: this.s3,
      readStream,
      filename,
      key,
      bucket
    });
  }

  destroy(): void {
    this.s3.destroy();
  }
}

export default Streamer;
