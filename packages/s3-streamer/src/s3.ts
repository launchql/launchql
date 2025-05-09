import S3 from 'aws-sdk/clients/s3';

interface S3Options {
  awsAccessKey: string;
  awsSecretKey: string;
  awsRegion: string;
  minioEndpoint?: string;
}

export default function getS3(opts: S3Options): S3 {
  const isMinio = Boolean(opts.minioEndpoint);

  const awsConfig: S3.ClientConfiguration = isMinio
    ? {
        accessKeyId: opts.awsAccessKey,
        secretAccessKey: opts.awsSecretKey,
        endpoint: opts.minioEndpoint,
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
      }
    : {
        apiVersion: '2006-03-01',
        region: opts.awsRegion,
        ...(opts.awsAccessKey && opts.awsSecretKey
          ? {
              accessKeyId: opts.awsAccessKey,
              secretAccessKey: opts.awsSecretKey,
            }
          : {}),
      };

  return new S3(awsConfig);
}
