export async function createS3Bucket(client, Bucket) {
  try {
    await client.createBucket({ Bucket }).promise();
    // MINIO
    if (client.endpoint.hostname !== 'localhost') {
      await client
        .putBucketCors({
          Bucket,
          CORSConfiguration: {
            CORSRules: [
              {
                AllowedMethods: ['POST', 'GET', 'PUT', 'DELETE', 'HEAD'],
                AllowedHeaders: [
                  'Authorization',
                  'Content-Type',
                  'Content-Length'
                ],
                AllowedOrigins: ['*'],
                ExposeHeaders: ['ETag'],
                MaxAgeSeconds: 3000
              }
            ]
          }
        })
        .promise();

      await client
        .putBucketPolicy({
          Bucket,
          Policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Action: ['s3:*'],
                Effect: 'Allow',
                Principal: '*',
                Resource: [`arn:aws:s3:::${Bucket}/*`],
                Sid: 'AddPerm'
              }
            ]
          })
        })
        .promise();
    } else {
      await client
        .putBucketPolicy({
          Bucket,
          Policy: JSON.stringify({
            Version: '2012-10-17',
            Statement: [
              {
                Action: ['s3:GetBucketLocation', 's3:ListBucket'],
                Effect: 'Allow',
                Principal: {
                  AWS: ['*']
                },
                Resource: [`arn:aws:s3:::${Bucket}`]
              },
              {
                Action: ['s3:GetObject'],
                Effect: 'Allow',
                Principal: {
                  AWS: ['*']
                },
                Resource: [`arn:aws:s3:::${Bucket}/*`]
              }
            ]
          })
        })
        .promise();
    }
    return { success: true };
  } catch (e) {
    process.stderr.write(e + '\n');
    return { success: false };
  }
}
