import S3 from 'aws-sdk/clients/s3';
import { env } from './env';

export default function getS3(): S3 {
  const isMinio = Boolean(env.MINIO_ENDPOINT);

  const awsConfig: S3.ClientConfiguration = isMinio
    ? {
        accessKeyId: env.AWS_ACCESS_KEY,
        secretAccessKey: env.AWS_SECRET_KEY,
        endpoint: env.MINIO_ENDPOINT,
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
      }
    : {
        apiVersion: '2006-03-01',
        region: env.AWS_REGION,
        // Only include credentials if explicitly set — this allows IAM role fallback
        ...(env.AWS_ACCESS_KEY && env.AWS_SECRET_KEY
          ? {
              accessKeyId: env.AWS_ACCESS_KEY,
              secretAccessKey: env.AWS_SECRET_KEY,
            }
          : {})
      };

  return new S3(awsConfig);
}
