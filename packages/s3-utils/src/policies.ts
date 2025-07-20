import { 
  CreateBucketCommand, 
  PutBucketCorsCommand, 
  PutBucketPolicyCommand, 
  S3Client} from '@aws-sdk/client-s3';

export async function createS3Bucket(client: S3Client, Bucket: string): Promise<{ success: boolean }> {
  try {
    await client.send(new CreateBucketCommand({ Bucket }));
  } catch (e: any) {
    if (e.name === 'BucketAlreadyOwnedByYou' || e.Code === 'BucketAlreadyOwnedByYou') {
      console.warn(`[createS3Bucket] Bucket "${Bucket}" already exists`);
      return { success: true };
    } else {
      console.error('[createS3Bucket error - createBucket]', e);
      return { success: false };
    }
  }

  // Check if it's MinIO by looking at the endpoint
  const endpoint = (client as any).config?.endpoint;
  const endpointUrl = typeof endpoint === 'function' ? await endpoint() : endpoint;
  const hostname = endpointUrl?.hostname || endpointUrl?.host || '';
  
  const isMinio =
    process.env.IS_MINIO === 'true' ||
    ['localhost', '127.0.0.1'].includes(hostname) ||
    hostname.includes('minio');

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
      await client.send(new PutBucketCorsCommand({
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
      }));
    }

    await client.send(new PutBucketPolicyCommand({ 
      Bucket, 
      Policy: JSON.stringify(policy) 
    }));

    return { success: true };
  } catch (e) {
    console.error('[createS3Bucket error - post-create]', e);
    return { success: false };
  }
}
