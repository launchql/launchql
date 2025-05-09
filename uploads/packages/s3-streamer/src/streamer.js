import getS3 from './s3';
import { upload as streamUpload } from './utils';

export class Streamer {
  constructor({
    AWS_REGION = 'us-east-1',
    AWS_SECRET_KEY,
    AWS_ACCESS_KEY,
    MINIO_ENDPOINT,
    defaultBucket
  } = {}) {
    this.s3 = getS3({
      AWS_REGION,
      AWS_SECRET_KEY,
      AWS_ACCESS_KEY,
      MINIO_ENDPOINT
    });
    this.defaultBucket = defaultBucket;
  }
  async upload({ readStream, filename, key, bucket = this.defaultBucket }) {
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
