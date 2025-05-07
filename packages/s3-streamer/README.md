# s3-streamer

```sh
npm install @launchql/s3-streamer
```

Stream uploads to s3

```js
import Streamer from '@launchql/s3-streamer';
const streamer = new Streamer(opts)
const readStream = createReadStream(filename);
const results = await streamer.upload({
    readStream,
    filename,
    bucket,
    key
});
```

and get detailed payload results

```js
{ upload:
{ ETag: '"952fd44d14cee87882239b707231609d"',
    Location: 'http://localhost:9000/launchql/db1/assets/.gitignore',
    key: 'db1/assets/.gitignore',
    Key: 'db1/assets/.gitignore',
    Bucket: 'launchql' },
magic: { type: 'text/plain', charset: 'us-ascii' },
contentType: 'text/plain',
contents:
{ uuid: '278aee01-1404-5725-8f0e-7044c9c16397',
    sha: '7d65523f2a5afb69d76824dd1dfa62a34faa3197',
    etag: '952fd44d14cee87882239b707231609d' } }
```

## functional utils

If you don't want to use the `Streamer` class you can use the utils directly:

```js
import { getClient, upload } from '@launchql/s3-streamer';
const client = getClient(opts)
const readStream = createReadStream(filename);
const results = await upload({
    client,
    readStream,
    filename,
    bucket,
    key
});
```

## variables

### production

```js
    const streamer = new Streamer({
      defaultBucket: BUCKET_NAME,
      AWS_REGION,
      AWS_SECRET_KEY,
      AWS_ACCESS_KEY,
      MINIO_ENDPOINT
    });
```

### using minio

```js
    const streamer = new Streamer({
      defaultBucket: BUCKET_NAME,
      AWS_REGION,
      AWS_SECRET_KEY,
      AWS_ACCESS_KEY,
      MINIO_ENDPOINT
    });
```

values:

`MINIO_ENDPOINT`=http://localhost:9000
`AWS_ACCESS_KEY`=minio-access
`AWS_SECRET_KEY`=minio-secret

