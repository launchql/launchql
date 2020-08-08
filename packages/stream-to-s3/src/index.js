import stream from 'stream';
import getS3 from './s3';
import env from './env';
import {
  streamContentType,
  ContentStream
} from '@pyramation/content-type-stream';

const s3 = getS3();

function uploadFromStream({ key, contentType, bucket }) {
  const pass = new stream.PassThrough();

  const params = {
    Body: pass,
    Key: key,
    ContentType: contentType,
    Bucket: bucket
  };
  s3.upload(params, function (err, data) {
    if (err) {
      return pass.emit('error', err);
    }
    pass.emit('upload', data);
  });

  return pass;
}

const asyncUpload = ({ key, contentType, readStream, magic, bucket }) => {
  return new Promise((resolve, reject) => {
    // upload stream
    let upload;
    const uploadStream = uploadFromStream({
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
};

export default async ({ readStream, filename, bucket, key }) => {
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
