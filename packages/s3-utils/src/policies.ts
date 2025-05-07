import type S3 from 'aws-sdk/clients/s3';

export async function createS3Bucket(client: S3, Bucket: string): Promise<{ success: boolean }> {
  try {
    await client.createBucket({ Bucket }).promise();
  } catch (e: any) {
    if (e.code === 'BucketAlreadyOwnedByYou') {
      console.warn(`[createS3Bucket] Bucket "${Bucket}" already exists`);
      return { success: true };
    } else {
      console.error('[createS3Bucket error - createBucket]', e);
      return { success: false };
    }
  }

  const isMinio =
    process.env.IS_MINIO === 'true' ||
    ['localhost', '127.0.0.1'].includes(client.endpoint.hostname) ||
    client.endpoint.hostname.includes('minio');

  const policy = isMinio
    ? {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'MinioListBucket',
          Action: ['s3:GetBucketLocation', 's3:ListBucket'],
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Resource: [`arn:aws:s3:::${Bucket}`],
        },
        {
          Sid: 'MinioGetObject',
          Action: ['s3:GetObject'],
          Effect: 'Allow',
          Principal: { AWS: ['*'] },
          Resource: [`arn:aws:s3:::${Bucket}/*`],
        },
      ],
    }
    : {
      Version: '2012-10-17',
      Statement: [
        {
          Sid: 'AddPerm',
          Action: ['s3:*'],
          Effect: 'Allow',
          Principal: '*',
          Resource: [`arn:aws:s3:::${Bucket}/*`],
        },
      ],
    };

  try {
    if (!isMinio) {
      await client
        .putBucketCors({
          Bucket,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedMethods: ['POST', 'GET', 'PUT', 'DELETE', 'HEAD'],
                AllowedHeaders: ['Authorization', 'Content-Type', 'Content-Length'],
                AllowedOrigins: ['*'],
                ExposeHeaders: ['ETag'],
                MaxAgeSeconds: 3000,
              },
            ],
          },
        })
        .promise();
    }

    await client.putBucketPolicy({ Bucket, Policy: JSON.stringify(policy) }).promise();

    return { success: true };
  } catch (e) {
    console.error('[createS3Bucket error - post-create]', e);
    return { success: false };
  }
}
