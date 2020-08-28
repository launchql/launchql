import stream from 'stream';
import getS3 from './s3';
import {
  streamContentType,
  ContentStream
} from '@pyramation/content-type-stream';

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

  uploadFromStream({ key, contentType, bucket = this.defaultBucket }) {
    const pass = new stream.PassThrough();

    const params = {
      Body: pass,
      Key: key,
      ContentType: contentType,
      Bucket: bucket
    };
    this.s3.upload(params, function (err, data) {
      if (err) {
        return pass.emit('error', err);
      }
      pass.emit('upload', data);
    });

    return pass;
  }

  asyncUpload({
    key,
    contentType,
    readStream,
    magic,
    bucket = this.defaultBucket
  }) {
    return new Promise((resolve, reject) => {
      // upload stream
      let upload;
      const uploadStream = this.uploadFromStream({
        key,
        contentType,
        bucket
      });

      // content stream
      let contents;
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
        .on('contents', function (results) {
          contents = results;
          tryResolve();
        })
        .on('error', (error) => {
          reject(error);
        });
      uploadStream
        .on('upload', (results) => {
          upload = results;
          tryResolve();
        })
        .on('error', (error) => {
          reject(error);
        });

      readStream.pipe(contentStream);
      contentStream.pipe(uploadStream);
    });
  }

  async upload({ readStream, filename, key, bucket = this.defaultBucket }) {
    const { stream: newStream, magic, contentType } = await streamContentType({
      readStream,
      filename
    });
    return await this.asyncUpload({
      key,
      contentType,
      readStream: newStream,
      magic,
      bucket
    });
  }
}

export default Streamer;
