import stream from 'stream';

import {
  streamContentType,
  ContentStream
} from '@pyramation/content-type-stream';

export const uploadFromStream = ({ client, key, contentType, bucket }) => {
  const pass = new stream.PassThrough();

  const params = {
    Body: pass,
    Key: key,
    ContentType: contentType,
    Bucket: bucket
  };
  client.upload(params, function (err, data) {
    if (err) {
      return pass.emit('error', err);
    }
    pass.emit('upload', data);
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
}) => {
  return new Promise((resolve, reject) => {
    // upload stream
    let upload;
    const uploadStream = uploadFromStream({
      client,
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

export const upload = async ({ client, readStream, filename, key, bucket }) => {
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
