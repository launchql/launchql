import dotenv from 'dotenv';
dotenv.config({ path: __dirname + '/../../../.env.minio.env' });

import { sync as glob } from 'glob';
import { createReadStream } from 'fs';
import { basename } from 'path';
import S3 from 'aws-sdk/clients/s3';

import asyncUpload from '../src';
import { cleanEnv, str, url } from 'envalid';
import { createS3Bucket } from '@launchql/s3-utils';

export const testEnv = cleanEnv(process.env, {
  AWS_REGION: str({ default: 'us-east-1' }),
  AWS_SECRET_KEY: str({ default: 'minioadmin' }),
  AWS_ACCESS_KEY: str({ default: 'minioadmin' }),
  MINIO_ENDPOINT: url({ default: undefined }),
  BUCKET_NAME: str({ default: 'test-bucket' })
});

// Initialize S3 client
const s3Client = new S3({
  accessKeyId: testEnv.AWS_ACCESS_KEY,
  secretAccessKey: testEnv.AWS_SECRET_KEY,
  region: testEnv.AWS_REGION,
  endpoint: testEnv.MINIO_ENDPOINT,
  s3ForcePathStyle: true,
  signatureVersion: 'v4'
});

jest.setTimeout(3000000);

// Create bucket before tests
beforeAll(async () => {
  process.env.IS_MINIO = 'true'; // Ensure MinIO behavior in createS3Bucket
  const result = await createS3Bucket(s3Client, testEnv.BUCKET_NAME);
  if (!result.success) throw new Error('Failed to create test S3 bucket');
});

const files = []
  .concat(glob(__dirname + '/../../../__fixtures__/kitchen-sink/**'))
  .concat(glob(__dirname + '/../../../__fixtures__/kitchen-sink/**/.*'))
  .filter((file) => {
    const key = file.split('kitchen-sink')[1];
    return key != '';
  })
  .map((f) => ({
    key: basename(f),
    path: f
  }));

describe('uploads', () => {
  it('works', async () => {
    const res = {};
    for (const file of files) {
      const key = file.key;
      const readStream = createReadStream(file.path);
      const results = await asyncUpload({
        readStream,
        filename: file.path,
        bucket: testEnv.BUCKET_NAME,
        key: 'db1/assets/' + basename(file.path)
      });
      // @ts-ignore
      res[key] = results;
    }
    expect(res).toMatchSnapshot();
  });
});
