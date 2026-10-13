import { S3Client } from '@aws-sdk/client-s3';
import { createS3Bucket, createS3Client } from '@constructive-io/s3-utils';
import { createReadStream } from 'fs';
import { sync as glob } from 'glob';
import { basename } from 'path';

import { Streamer, upload } from '../src';
import type { AsyncUploadResult } from '../src/utils';

// The local object store (docker RustFS/MinIO); credentials from the env.
const BUCKET_NAME = 'test-bucket';
const REGION = 'us-east-1';
const ENDPOINT = 'http://localhost:9000';
const ACCESS_KEY_ID = process.env.STORAGE_ACCESS_KEY_ID!;
const SECRET_ACCESS_KEY = process.env.STORAGE_SECRET_ACCESS_KEY!;

// Initialize S3 client
const s3Client = new S3Client({
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  region: REGION,
  endpoint: ENDPOINT,
  forcePathStyle: true
});

jest.setTimeout(3000000);

// Create bucket before tests
beforeAll(async () => {
  const result = await createS3Bucket(s3Client, BUCKET_NAME, { provider: 'minio' });
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
      client: createS3Client({
        provider: 'minio',
        region: REGION,
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
        endpoint: ENDPOINT
      })
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
    const client = createS3Client({
      provider: 'minio',
      region: REGION,
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
      endpoint: ENDPOINT
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
