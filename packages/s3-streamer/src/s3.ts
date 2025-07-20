import { S3Client, S3ClientConfig } from '@aws-sdk/client-s3';

interface S3Options {
  awsAccessKey: string;
  awsSecretKey: string;
  awsRegion: string;
  minioEndpoint?: string;
}

export default function getS3(opts: S3Options): S3Client {
  const isMinio = Boolean(opts.minioEndpoint);

  const awsConfig: S3ClientConfig = {
    region: opts.awsRegion,
    ...(opts.awsAccessKey && opts.awsSecretKey
      ? {
        credentials: {
          accessKeyId: opts.awsAccessKey,
          secretAccessKey: opts.awsSecretKey,
        },
      }
      : {}),
    ...(isMinio
      ? {
        endpoint: opts.minioEndpoint,
        forcePathStyle: true,
      }
      : {}),
  };

  return new S3Client(awsConfig);
}
