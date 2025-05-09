import S3 from 'aws-sdk/clients/s3';

export default function getS3(env) {
  const awsConfig = {};
  if (env.MINIO_ENDPOINT) {
    Object.assign(awsConfig, {
      accessKeyId: env.AWS_ACCESS_KEY,
      secretAccessKey: env.AWS_SECRET_KEY,
      endpoint: env.MINIO_ENDPOINT,
      s3ForcePathStyle: true,
      signatureVersion: 'v4'
    });
  } else {
    Object.assign(awsConfig, {
      apiVersion: '2006-03-01',
      region: env.AWS_REGION,
      accessKeyId: env.AWS_ACCESS_KEY,
      secretAccessKey: env.AWS_SECRET_KEY
    });
    // NOTE you can remove key and secret
    // and then this could go in resolver if needed...
    // ( but does NOT work with minio)
    // s3.config.update({
    //   credentials: {
    //     accessKeyId: env.AWS_ACCESS_KEY,
    //     secretAccessKey: env.AWS_SECRET_KEY
    //   }
    // });
  }
  return new S3(awsConfig);
}
