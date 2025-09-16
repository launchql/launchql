// Minimal script to create a bucket in MinIO using @launchql/s3-utils
// Avoid strict type coupling between different @aws-sdk/client-s3 versions

// Loads packages/server/.env by default when running via ts-node from this workspace
import 'dotenv/config';

import { S3Client } from '@aws-sdk/client-s3';
import { createS3Bucket } from '@launchql/s3-utils';

const BUCKET = process.env.BUCKET_NAME || 'test-bucket';
const REGION = process.env.AWS_REGION || 'us-east-1';
const ACCESS_KEY =
  process.env.AWS_ACCESS_KEY || process.env.AWS_ACCESS_KEY_ID || 'minioadmin';
const SECRET_KEY =
  process.env.AWS_SECRET_KEY ||
  process.env.AWS_SECRET_ACCESS_KEY ||
  'minioadmin';
const ENDPOINT = process.env.MINIO_ENDPOINT || 'http://localhost:9000';

(async () => {
  try {
    const client: any = new S3Client({
      region: REGION,
      credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
      endpoint: ENDPOINT,
      forcePathStyle: true,
    });

    // Hint downstream to apply MinIO policies
    process.env.IS_MINIO = 'true';

    const res = await createS3Bucket(client as any, BUCKET);
    console.log(`[create-bucket] ${BUCKET}:`, res);

    client.destroy();
  } catch (e) {
    console.error('[create-bucket] error', e);
    process.exitCode = 1;
  }
})();
