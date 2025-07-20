import {
  GetObjectCommand,
  HeadObjectCommand, 
  S3Client} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { PassThrough, Readable } from 'stream';

interface FileOperationArgs {
  client: S3Client;
  bucket: string;
  key: string;
}

// Type to match the old AWS SDK v2 ManagedUpload.SendData
export interface UploadResult {
  Location: string;
  ETag?: string;
  Bucket?: string;
  Key?: string;
  key?: string; // v2 had both Key and key
}

export const fileExists = async ({ client, bucket, key }: FileOperationArgs): Promise<boolean> => {
  try {
    await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    return true;
  } catch (e: any) {
    if (e.name === 'NotFound' || e.$metadata?.httpStatusCode === 404) return false;
    throw e;
  }
};

export const download = async ({
  client,
  writeStream,
  bucket,
  key,
}: FileOperationArgs & { writeStream: NodeJS.WritableStream }): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    try {
      const errors: Error[] = [];

      writeStream.on('error', (e) => errors.push(e));
      writeStream.on('finish', () => {
        if (errors.length) return reject(errors[0]);
        resolve();
      });

      const response = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
      
      if (response.Body instanceof Readable) {
        response.Body.on('error', reject).pipe(writeStream);
      } else {
        reject(new Error('Response body is not a readable stream'));
      }
    } catch (error) {
      reject(error);
    }
  });
};

export const upload = async ({
  client,
  readStream,
  bucket,
  key,
  contentType,
}: FileOperationArgs & {
  readStream: Readable;
  contentType: string;
}): Promise<UploadResult> => {
  const upload = new Upload({
    client,
    params: {
      Bucket: bucket,
      Key: key,
      Body: readStream,
      ContentType: contentType,
    },
  });

  const result = await upload.done();
  
  // Transform to match v2 response format
  return {
    Location: result.Location || `https://${bucket}.s3.amazonaws.com/${key}`,
    ETag: result.ETag,
    Bucket: bucket,
    Key: key,
    key: key, // v2 had both Key and key
  };
};

export const uploadThrough = ({
  key,
  contentType,
  bucket,
  client,
}: FileOperationArgs & { contentType: string }): PassThrough => {
  const pass = new PassThrough();

  const upload = new Upload({
    client,
    params: {
      Body: pass,
      Key: key,
      ContentType: contentType,
      Bucket: bucket,
    },
  });

  upload.done()
    .then((data) => {
      // Transform to match v2 response format
      const result: UploadResult = {
        Location: data.Location || `https://${bucket}.s3.amazonaws.com/${key}`,
        ETag: data.ETag,
        Bucket: bucket,
        Key: key,
        key: key, // v2 had both Key and key
      };
      pass.emit('upload', result);
    })
    .catch((err) => {
      pass.emit('error', err);
    });

  return pass;
};
