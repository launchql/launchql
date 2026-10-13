import { S3Client } from '@aws-sdk/client-s3';
import { streamContentType } from '@constructive-io/content-type-stream';
import type { Readable } from 'stream';

import {
  type AsyncUploadResult,
  upload as streamUpload,
  uploadWithContentType as streamUploadWithContentType,
} from './utils';

interface StreamerOptions {
  /** Client for the object store the caller resolved (see `createS3Client` in `@constructive-io/s3-utils`). */
  client: S3Client;
  /**
   * Bucket used when a call does not name one. Optional: a caller that resolves
   * the bucket per upload (tenant-resolved storage) has no deployment-wide
   * default to give, and passing a placeholder would let a missing `bucket`
   * argument write somewhere plausible instead of failing.
   */
  defaultBucket?: string;
}

interface UploadParams {
  readStream: Readable;
  filename: string;
  key: string;
  bucket?: string;
}

interface UploadWithContentTypeParams {
  readStream: Readable;
  contentType: string;
  key: string;
  bucket?: string;
  magic?: { charset: string; type?: string };
}

export class Streamer {
  private s3: S3Client;
  private defaultBucket?: string;

  constructor({ client, defaultBucket }: StreamerOptions) {
    this.s3 = client;
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

  async uploadWithContentType({
    readStream,
    contentType,
    key,
    bucket = this.defaultBucket,
    magic,
  }: UploadWithContentTypeParams): Promise<AsyncUploadResult> {
    if (!bucket) {
      throw new Error('Bucket is required');
    }

    return await streamUploadWithContentType({
      client: this.s3,
      readStream,
      contentType,
      key,
      bucket,
      magic,
    });
  }

  async detectContentType({
    readStream,
    filename,
    peekBytes,
  }: {
    readStream: Readable;
    filename: string;
    peekBytes?: number;
  }): ReturnType<typeof streamContentType> {
    return streamContentType({ readStream, filename, peekBytes });
  }

  destroy(): void {
    this.s3.destroy();
  }
}

export default Streamer;
