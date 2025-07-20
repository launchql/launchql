import { S3Client } from '@aws-sdk/client-s3';
import { createS3Bucket } from '@launchql/s3-utils';
import dotenv from 'dotenv';
import { cleanEnv, str, url } from 'envalid';
import { createReadStream } from 'fs';
import { sync as glob } from 'glob';
import { basename } from 'path';

import { getClient, Streamer, upload } from '../src';
import type { AsyncUploadResult } from '../src/utils';

// Manually load the dotenv file
dotenv.config({ path: __dirname + '/../../../.env.minio.env' });

const testEnv = cleanEnv(process.env, {
  BUCKET_NAME: str({ default: 'test-bucket' }),
  AWS_ACCESS_KEY: str({ default: 'minioadmin' }),
  AWS_REGION: str({ default: 'us-east-1' }),
  AWS_SECRET_KEY: str({ default: 'minioadmin' }),
  MINIO_ENDPOINT: url({ default: undefined })
});

// Initialize S3 client
const s3Client = new S3Client({
  credentials: {
    accessKeyId: testEnv.AWS_ACCESS_KEY,
    secretAccessKey: testEnv.AWS_SECRET_KEY,
  },
  region: testEnv.AWS_REGION,
  endpoint: testEnv.MINIO_ENDPOINT,
  forcePathStyle: true
});


const {
  BUCKET_NAME,
  AWS_REGION,
  AWS_SECRET_KEY,
  AWS_ACCESS_KEY,
  MINIO_ENDPOINT
} = testEnv;

jest.setTimeout(3000000);

// Create bucket before tests
beforeAll(async () => {
  process.env.IS_MINIO = 'true'; // Ensure MinIO behavior in createS3Bucket
  const result = await createS3Bucket(s3Client, testEnv.BUCKET_NAME);
  if (!result.success) throw new Error('Failed to create test S3 bucket');
});

// Clean up after tests
afterAll(async () => {
  // Destroy the S3 client to close connections
  s3Client.destroy();
});


const files = []
  .concat(glob(__dirname + '/../../../__fixtures__/kitchen-sink/**'))
  .concat(glob(__dirname + '/../../../__fixtures__/kitchen-sink/**/.*'))
  .filter((file) => file.split('kitchen-sink')[1] !== '')
  .map((f) => ({
    key: basename(f),
    path: f
  }));

describe('uploads', () => {
  it('upload files via class', async () => {
    const streamer = new Streamer({
      defaultBucket: BUCKET_NAME,
      awsRegion: AWS_REGION,
      awsSecretKey: AWS_SECRET_KEY,
      awsAccessKey: AWS_ACCESS_KEY,
      minioEndpoint: MINIO_ENDPOINT
    });

    try {
      const res: Record<string, AsyncUploadResult> = {};
      for (const file of files) {
        const key = file.key;
        const readStream = createReadStream(file.path);
        const results = await streamer.upload({
          readStream,
          filename: file.path,
          key: 'db1/assets/' + basename(file.path)
        });
        res[key] = results;
      }

      Object.keys(res).map((k)=>{
        // CI/CD matching
        res[k].upload.Location = res[k].upload.Location.replace(/localhost:9000/g, 'minio_cdn:9000');
      });

      expect(res).toMatchSnapshot();
    } finally {
      // Clean up the streamer's S3 client
      streamer.destroy();
    }
  });

  it('upload files via functions', async () => {
    const client = getClient({
      awsRegion: AWS_REGION,
      awsSecretKey: AWS_SECRET_KEY,
      awsAccessKey: AWS_ACCESS_KEY,
      minioEndpoint: MINIO_ENDPOINT
    });

    try {
      const res: Record<string, AsyncUploadResult> = {};
      for (const file of files) {
        const key = file.key;
        const readStream = createReadStream(file.path);
        const results = await upload({
          client,
          readStream,
          filename: file.path,
          bucket: BUCKET_NAME,
          key: 'db1/assets/' + basename(file.path)
        });
        res[key] = results;
      }

      Object.keys(res).map((k)=>{
        // CI/CD matching
        res[k].upload.Location = res[k].upload.Location.replace(/localhost:9000/g, 'minio_cdn:9000');
      });
      expect(res).toMatchSnapshot();
    } finally {
      // Clean up the client
      client.destroy();
    }
  });
});
